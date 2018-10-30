var express = require('express'); // https://expressjs.com/en/guide/routing.html
var mysql = require('mysql');// https://www.npmjs.com/package/mysql
var bodyParser = require('body-parser');// https://www.npmjs.com/package/body-parser
var fs = require('fs'); // https://www.w3schools.com/nodejs/nodejs_filesystem.asp
var db = require('./DBinfo');
var https = require('https');
var session = require('express-session');
var app = express();

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
  })  
});

app.post('/signupForm', (req, res) =>{

  const hash = crypto.createHmac('sha256', req.body.Password).digest('hex');
  const QueryString = 'INSERT INTO `origgo`.`users` (`Name`, `Password`, `eMail`, `compName`) VALUES ('+'"'+req.body.Username+'"'+', '+'"'+hash+'"'+', '+'"'+req.body.Mail+'"'+', '+'"'+req.body.Company+'"'+');';

  DatabaseConn(QueryString).then(function(data){
    res.send(data.affectedRows.toString());
  })
});

app.post('/check',(req, res) =>{
    res.send(req.session.name);
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

//request to go to map site, only allowed if loged in 

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
  request("https://opensky-network.org/api/states/all", function(data){
    var states = data.states || undefined;
    var planes = [];
    if(states){
      states.forEach(function(plane){
        /*Boolean if plane is on ground*/
        var planeGrounded = plane[8];
        /*Indexes 5,6 contains coordinates for the plane*/
        var lat = plane[6];
        var lon = plane[5];
        if(!planeGrounded && lat && lon && plane[1]!=""){

          /*Index 10 contains plane rotation in degrees
          North is 0 degrees. Index 0 has unique icao24 code*/
          var planeObject = { 
            icao24: plane[0],
            callsign: plane[1].trim(),
            lat: lat,
            lon: lon,
            direction: plane[10],
             };
          planes.push(planeObject);
        }
      });
      console.log("States true");
    }
    else{
      console.log("States null");
    }
    res.send(planes);
  });
});

app.get('/getAirplane', (req, res) => {
  let data = {};
      request("https://opensky-network.org/api/states/all?icao24="+req.query.q, function(statesData) {
          let plane = statesData.states[0];
          //Time in unix stamp, 43200 is 12 hours
          let currentTime = Math.floor(Date.now()/1000);
          let begin =  currentTime - 43200;
          let end = currentTime + 43200;
          request("https://opensky-network.org/api/flights/aircraft?icao24="+req.query.q+"&begin="+begin+"&end="+end, function(flightsData){ 
            data = { 
              estArrival : unixTimeToNormal(flightsData[0].lastSeen),
              estDeparture : unixTimeToNormal(flightsData[0].firstSeen),
              callsign : flightsData[0].callsign.trim(),
              velocity : plane[9],
              origin : plane[2],
              altitude : plane[7]
            };   
            DatabaseConn("SELECT * FROM origgo.airport WHERE icaoCode = '"+flightsData[0].estDepartureAirport+"'").then(function(airport){
              if(airport.length > 0) { 
                data.depatureAirport = { 
                    iataCode : airport[0].iataCode, 
                    city : airport[0].city,
                    country : airport[0].country }
              }else 
                data.depatureAirport = flightsData[0].estDepartureAirport;       
              DatabaseConn("SELECT * FROM origgo.airport WHERE icaoCode = '"+flightsData[0].estArrivalAirport+"'").then(function(airport){
                if(airport.length > 0) { 
                  data.arrivalAirport = { 
                    iataCode : airport[0].iataCode, 
                    city : airport[0].city,
                    country : airport[0].country }
                }else 
                  data.arrivalAirport = flightsData[0].estArrivalAirport;
                console.log("DATA: \n", data);
                res.send(data);
              });
            });
          });
      });
});

function unixTimeToNormal(unix){
  let date = new Date(unix*1000);
  return date.getHours()+":"+date.getMinutes();
}

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
