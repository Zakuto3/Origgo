let express = require('express'); // https://expressjs.com/en/guide/routing.html
let mysql = require('mysql');// https://www.npmjs.com/package/mysql
let bodyParser = require('body-parser');// https://www.npmjs.com/package/body-parser
let fs = require('fs'); // https://www.w3schools.com/nodejs/nodejs_filesystem.asp
let db = require('./DBinfo');
let https = require('https');
let session = require('express-session');
let app = express(); //---

app.use(session({secret: 'ALDO4923ALFO2QIA', resave: false, saveUninitialized : true, cookie:{ maxAge: 3600000}}));

//sets connection to Database with the specifics given from DBinfo.js
let connection = mysql.createConnection(db.connectionstring);

//use for complex json parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//allows for navigation from exteral ip(gateway), not needed if ran on localhost
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var checklogin = function(req){ 
  return new Promise(function(resolve, reject) { //makes a promise for sequential exection
   connection.query('SELECT IF(EXISTS(SELECT * from origgo.users where Name = '+'"'+req.body.Name+'"'+' AND Password = '+'"'+req.body.Pass+'"'+'),1,0) AS result;',
    (error, results, fields) => {   
      if (error) return reject (error);
      return resolve(results[0].result);
    });
  });
};
  
app.post('/loginbtn',(req, res) =>{ 

  checklogin(req).then(function(data){
    if (Number(data)){
     req.session.login = true;
     req.session.name = req.body.Name;
  }
  console.log("req.session: ",req.session.login,"\nreq:",req.body.Name, req.body.Pass); 
  res.send(req.session.login);
  })  
});

app.post('/check',(req, res) =>{
    res.send(req.session.name);
});

app.get('/logout',function(req,res){
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

/*Sends all current non-null airplanes to client*/
app.get('/addAirplanes', (req, res) => {
  request("https://opensky-network.org/api/states/all", function(data){
    let states = data.states || undefined;
    let planes = [];
    if(states){
      states.forEach(function(plane){
        /*Boolean if plane is on ground*/
        let planeGrounded = plane[8];
        /*Indexes 5,6 contains coordinates for the plane*/
        let lat = plane[6];
        let lon = plane[5];
        if(!planeGrounded && lat && lon){
          /*Index 10 contains plane rotation in degrees
          North is 0 degrees. Index 0 has unique icao24 code*/
          let planeObject = { 
            icao24: plane[0],
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

/*function for accessing WEB API through https module,
see it as serverside making requests to services*/
function request(link, func){
  let req = https.request(link, function(res){
    //console.log(res.statusCode);
    if(res.statusCode == 301){
      request(res.headers.location, func);
    }
    else if(res.statusCode == 200){
      let datastring = "";
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

