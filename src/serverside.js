var express = require('express'); // https://expressjs.com/en/guide/routing.html
var mysql = require('mysql');// https://www.npmjs.com/package/mysql
var bodyParser = require('body-parser');// https://www.npmjs.com/package/body-parser
var fs = require('fs'); // https://www.w3schools.com/nodejs/nodejs_filesystem.asp
var db = require('./DBinfo');
var https = require('https');
var session = require('express-session');
var app = express();
var APIkey= "a407e4-2ee284";

var crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}

//session cookie setting lives for 1h
app.use(session({secret: 'ALDO4923ALFO2QIA', resave: false, saveUninitialized : true, cookie:{ maxAge: 3600000}}));

//sets connection to Database with the specifics given from DBinfo.js
var connection = mysql.createConnection(db.connectionstring);

//use for complex json parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//allows for navigation from exteral ip(gateway), not needed if ran on localhost
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//makes a promise for sequential execution for database
var DatabaseConn = function(queryString){
  return new Promise(function(resolve, reject) { 
  connection.query(queryString,(error, results, fields) => {  
      if (error) return reject(error);
      return resolve(results);
    });
  });
};
  
app.post('/loginbtn',(req, res) =>{
  const hash = crypto.createHmac('sha256', req.body.Pass).digest('hex');
  const QueryString = "SELECT userID, name FROM origgo.users WHERE Name = '"+req.body.Name+"' AND Password = '"+hash+"';";

  DatabaseConn(QueryString).then(function(data){
    if (data.length > 0){
     req.session.login = true;
     req.session.name = data[0].name;
     req.session.userId = data[0].userID;
    }
  console.log("req.session: ",req.session.login,"\nreq:",req.body.Name, req.body.Pass); 
  res.send(req.session.login);
  }).catch((err) => {
    console.log("login err: ",err);
    res.send("");
  })
});

app.post('/signupForm', (req, res) =>{

  const hash = crypto.createHmac('sha256', req.body.Password).digest('hex');
  const QueryString = 'INSERT INTO `origgo`.`users` (`Name`, `Password`, `eMail`, `compName`) VALUES ('+'"'+req.body.Username+'"'+', '+'"'+hash+'"'+', '+'"'+req.body.Mail+'"'+', '+'"'+req.body.Company+'"'+');';

  DatabaseConn(QueryString).then(function(data){
    res.send(data.affectedRows.toString());
  }).catch((err)=>{
    console.log("signup error: ",err);
    res.send("");
  })
});

app.post('/check',(req, res) =>{
    if(req.session.login) {
      const query = "SELECT * FROM origgo.usersavedplanes WHERE UID = '"+req.session.userId+"';";
      DatabaseConn(query).then(function(rows){
        console.log("rows: ", rows);

        if(rows.length > 0){
          let userData = { plane : rows[0].Icao24, username : req.session.name };
          res.send(userData);
        }
        else res.send(req.session.name);
      }).catch((err) => {
        console.log("check error: ", err);
        res.send(false);
      })
      }
    else res.send("");
});


app.get('/search', function(req, res){
  if(req.query.q!="") {
      connection.query("select * from airport where city like '%" + req.query.q + "%'", (err, rows, fields) => {
          if (err) console.log(err);
          if (Object.keys(rows).length){
            console.log(rows[0].city);
          } else {
              // queryRes = ;
          }
          res.send(rows);
      });
  }else{queryRes = "{\"No Match\"}"}
      console.log("req.body: ", req.body, "req.query: ", req.query);
      //res.send(queryRes);
})

app.get('/logout',function(req,res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});


app.get('/signup.html',(req, res) =>{//makes sure user dont reach signup if logedin
    if (req.session.login) {
      res.redirect('/');
    }else{
      res.send(fs.readFileSync(__dirname + '/../public/signup.html', 'utf8'));//go to signup
    }
});

app.get('/login.html',(req, res) =>{
    if (req.session.login) {
      res.redirect('/');
    }else{
      res.send(fs.readFileSync(__dirname + '/../public/login.html', 'utf8'));
    }
});

/*Sends all current non-null airplanes to client*/
app.get('/addAirplanes', (req, res) => {
  var url = req.query.regNumb ? "https://aviation-edge.com/v2/public/flights?key="+APIkey+"&regNum="+req.query.regNumb : "https://aviation-edge.com/v2/public/flights?key="+APIkey;
  //var url = "https://aviation-edge.com/v2/public/flights?key="+APIkey;//+"&limit=1000";
  request(url, function(data){
    var planes = [];
    if(data){
      data.forEach((plane) => {
        var lat = plane.geography.latitude;
        var lon = plane.geography.longitude;
        var regNum = plane.aircraft.regNumber;
        var direction = plane.geography.direction; 
        if(lat && lon && direction && regNum){
          var planeObject = {
            planeReg : regNum,
            lat : lat,
            lon : lon,
            direction : direction
          };
          planes.push(planeObject);
        }
        //console.log("plane: ", plane);
      });
      console.log("addAirplanes: Planes found.");
    }
    res.send(planes);
  });
});

app.get('/getAirplane', (req,res) => {
  let data = {};
  let url = "https://aviation-edge.com/v2/public/flights?key="+APIkey;
  if (req.query.callsign) url += "&flightIcao="+req.query.callsign;
  request(url, (planeInfo) => {
    console.log("getAirplane: ", planeInfo);
    if(planeInfo.length > 0){
      let plane = planeInfo[0];
      data.altitude = plane.geography.altitude;
      data.regNumb = plane.aircraft.regNumber;
      data.airline = plane.airline.icaoCode;
      data.callsign = plane.flight.icaoNumber;
      //Should store all airports data in airports table in DB, INCOMPLETE
      request("https://aviation-edge.com/v2/public/airportDatabase?key="+APIkey+"&codeIataAirport="+ plane.arrival.iataCode, (airport) =>{
        if(airport.length > 0){
          console.log("arr airport: ", airport);
          data.arrivalAirport = {
            airportIata : airport[0].codeIataAirport,
            name : airport[0].nameAirport,
            country : airport[0].nameCountry,
            cityIata : airport[0].codeIataCity
          }
        }
        request("https://aviation-edge.com/v2/public/airportDatabase?key="+APIkey+"&codeIataAirport="+ plane.departure.iataCode, (airport) =>{
          if(airport.length > 0){
            console.log("dep airport: ", airport);
            data.depatureAirport = {
              airportIata : airport[0].codeIataAirport,
              name : airport[0].nameAirport,
              country : airport[0].nameCountry,
              cityIata : airport[0].codeIataCity
            }
          }
          res.send(data);
        });
      });
    }
    else{ res.send(""); }
  })
});

function unixTimeToNormal(unix){
  let date = new Date(unix*1000);
  return date.getHours()+":"+date.getMinutes();
}

app.get('/flightToDB', (req, res) => {
  if(req.session.login){
    const query = "INSERT INTO origgo.usersavedplanes (UID, Icao24) VALUES ('"+req.session.userId+"', '"+req.query.icao24+"');";
    DatabaseConn(query).then(function(){
      res.send(true);
    }).catch((err) => {
      console.log("flightToDB error: ", err);
      res.send(false);
    })
  }
  else { res.send(false); }
});

app.get('/updateFlightToDB', (req, res) => {
  if(req.session.login){
    const query = "UPDATE origgo.usersavedplanes SET icao24 = '"+req.query.icao24+"' WHERE UID = '"+req.session.userId+"';";
    DatabaseConn(query).then(() => {
      res.send(true);
    }).catch((err) => {
      console.log("updateFlightToDB error: ",err);
      res.send(false);
    })
  }
  else { res.send(false); }
});

app.get('/checkUserSaved', (req, res) => {
  if(req.session.login){
    const query = "SELECT * FROM origgo.usersavedplanes WHERE UID = '"+req.session.userId+"';";
    DatabaseConn(query).then((rows) => {
      if(rows.length > 0) res.send(true);
      else res.send(false);
    }).catch((err) => {
      console.log("checkUserSaved error: ", err);
      res.send(false);
    })
  }
  else { res.send(false); }
});

app.get('/getIcao24', (req, res) => {
  if(req.query.callSign){
    const query = "SELECT icao24 FROM origgo.airplane WHERE callsign = '"+req.query.callSign+"';";
    DatabaseConn(query).then(function(rows){
      console.log("rows: ",rows);
      if(rows.length > 0){
        res.send(rows[0].icao24);
      }
      else{ res.send("no results"); }
    }).catch((err) => {
      console.log("getIcao24 err: ", err);
    });
  }
  else { res.send("callsign empty"); }
})

/*function for accessing WEB API through https module,
see it as serverside making requests to services*/
function request(link, func){
  var req = https.request(link, function(res){
    //console.log(res.statusCode);
    if(res.statusCode == 301){
      request(res.headers.location, func);
    }
    else if(res.statusCode == 200){
      var datastring = "";
      res.setEncoding('utf8');
      res.on('data', function(data){
        datastring += data;
      });
      res.on('end', function(){
        func(JSON.parse(datastring));
      })      
    }
  });
  req.end();
}

//sets static directory, "root" of homepage
app.use(express.static(__dirname + '/../public')); // if not this is given, give specific adress like : app.get('/', (req, res) => res.send(fs.readFileSync('./index.html', 'utf8')));

//keep server live trough port 3000 // https://stackabuse.com/how-to-start-a-node-server-examples-with-the-most-popular-frameworks/
app.listen(3000, () => console.log('Server running on port 3000.'));
