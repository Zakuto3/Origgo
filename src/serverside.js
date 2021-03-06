"use strict"
var express = require('express'); // https://expressjs.com/en/guide/routing.html
var mysql = require('mysql');// https://www.npmjs.com/package/mysql
var bodyParser = require('body-parser');// https://www.npmjs.com/package/body-parser
var fs = require('fs'); // https://www.w3schools.com/nodejs/nodejs_filesystem.asp
var db = require('./DBinfo');
var https = require('https');
var session = require('express-session');
var app = express();
var APIkey= "a407e4-2ee284";
const uuidv4 = require('uuid/v4');
uuidv4(); //⇨ '10ba038e-48da-487b-96e8-8d3b99b6d18a'
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
  console.log(req.body.emptype);
  const hash = crypto.createHmac('sha256', req.body.Pass).digest('hex');
  console.log(hash);
  let emptype = (req.body.Name.includes("adm-")) ? "admin" : req.body.emptype;
  const QueryString = `SELECT * FROM ${emptype} WHERE name= '${req.body.Name}' AND password='${hash}'`;

    DatabaseConn(`SELECT password FROM ${emptype} WHERE name= '${req.body.Name}';`).then(function(data){
      if (data[0].password == null) {
        res.send("goPass");
      }else{
        DatabaseConn(QueryString).then(function(data){
        console.log("DATA: ",data);
        if (data.length > 0){
         req.session.login = true;
         req.session.name = data[0].name;
         req.session.userId = data[0].UID;
         req.session.email = data[0].email;
         req.session.tracking = data[0].trackingIcao24;
         req.session.companyName = data[0].companyName;
         req.session.employer = data[0].employer;
         req.session.usertype = emptype;
        }
      console.log("req.session: ",req.session.login,"\nreq:",req.body.Name, req.body.Pass, req.body.emptype); 
      res.send(req.session.usertype);
      }).catch((err) => {
        console.log("login err: ",err);
        res.send("");
      })
    }
  }).catch((err) => {
        console.log("passNullCheck err: ",err);
        res.send("");
      })
});

app.post('/setPasswd', (req,res) => {
   const hash = crypto.createHmac('sha256', req.body.Pass).digest('hex');
  const query = `UPDATE ${req.body.emptype} SET password = '${hash}' WHERE name = '${req.body.Name}'`;
  DatabaseConn(query).then(() => {
    res.send("success");
  }).catch((e)=>{
    console.log("resetPass err: ", e);
    res.send(e);
  })
});

app.post('/signupForm', (req, res) =>{
  const hash = crypto.createHmac('sha256', req.body.Password).digest('hex');
  const QueryString = 'INSERT INTO `origgo`.`employer` (`name`, `password`, `email`, `companyName`, `certifiedKey`) VALUES ('+'"'+req.body.Username+'"'+', '+'"'+hash+'"'+', '+'"'+req.body.Mail+'"'+', '+'"'+req.body.CompSelector+'"'+', '+'"'+req.body.keycode+'"'+');';
  const QueryStringCheck = "SELECT count(*) AS HITS FROM origgo.company_code WHERE company = '"+req.body.CompSelector+"' AND code = '"+req.body.keycode+"';"
  DatabaseConn(QueryStringCheck).then(function(data){
    if (data[0].HITS) {
      DatabaseConn(QueryString).then(function(row){
      res.send(row.affectedRows.toString());
      }).catch(function(error){console.log(error); res.send(error);}) 
    }else{
      res.send(data[0].HITS.toString())
    }
  }).catch(function(error){ 
    console.log(error);
    res.send(error);
  })
});

app.post('/checkuser',(req,res) => {
  if (req.session.login) {
    res.send(req.session);
  }else{
    res.send("");
  }
});

app.post('/check',(req, res) =>{
    if(req.session.login) //{
      // const query = "SELECT * FROM origgo.usersavedplanes WHERE UID = '"+req.session.userId+"';";
      // DatabaseConn(query).then(function(rows){
      //   console.log("rows: ", rows);

      //   if(rows.length > 0){
      //     let userData = { plane : rows[0].Icao24, username : req.session.name };
      //     res.send(userData);
      //   }
        //else 
        res.send(req.session.name);
      // }).catch((err) => {
      //   console.log("check error: ", err);
      //   res.send(false);
      // })
      // }
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

function reroute(usertype, url){
      console.log("reroute usertype: ",usertype);
      switch(url){
        case "/signup.html":
        case "/login.html":
          if(usertype) return __dirname + `/../public/Index_${usertype}.html`;
          else return __dirname + `/../public/${url}`;
          break;
        case "/Index.html":
        case "/Index_admin.html":
        case "/Index_employer.html":
        case "/Index_employee.html":
        case "/":
          if(!usertype) return __dirname + `/../public/Index.html`;
            else return __dirname + `/../public/Index_${usertype}.html`;
            break;
        case "/map.html":
          if(usertype) return __dirname + `/../public/${url}`;
          else return __dirname + `/../public/Index.html`;
          break;
        case "/contact.html":
          return __dirname + `/../public/${url}`;
          break;
      }
}

app.get("/",(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  res.send(fs.readFileSync(page, 'utf8'));
});

app.get("/Index.html",(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  res.send(fs.readFileSync(page, 'utf8'));
});

app.get("/Index_admin.html",(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  res.send(fs.readFileSync(page, 'utf8'));
});

app.get("/Index_employer.html",(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  res.send(fs.readFileSync(page, 'utf8'));
});

app.get("/Index_employee.html",(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  res.send(fs.readFileSync(page, 'utf8'));
});

app.get("/map.html",(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  res.send(fs.readFileSync(page, 'utf8'));
});

app.get("/contact.html",(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  res.send(fs.readFileSync(page, 'utf8'));
});

app.get('/signup.html',(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  res.send(fs.readFileSync(page, 'utf8'));
});

app.get('/login.html',(req, res) =>{
  console.log(req.url);
  let page = reroute(req.session.usertype, req.url);
  console.log("page: ",page);
  res.send(fs.readFileSync(page, 'utf8'));
});

/*Sends all current non-null airplanes to client*/
app.get('/addAirplanes', (req, res) => {
  var url = "https://aviation-edge.com/v2/public/flights?key="+APIkey;
  if(req.query.flightIcao) { url += ("&flightIcao="+req.query.flightIcao); }
  if(req.query.limit) {url += ("&limit="+req.query.limit);}
  request(url, function(data){
    var planes = [];
    if(data.constructor === Array){
      data.forEach((plane) => {
        var lat = plane.geography.latitude;
        var lon = plane.geography.longitude;
        var flightIcao = plane.flight.icaoNumber;
        var direction = plane.geography.direction; 
        var inAir = (plane.status == "en-route" || plane.status == "started") ? true : false;
        if(lat && lon && direction && flightIcao && inAir){
          var planeObject = {
            flightIcao : flightIcao,
            lat : lat,
            lon : lon,
            direction : direction
          };
          planes.push(planeObject);
        }
      });
      console.log("addAirplanes: Planes found.");
    }
    res.send(planes);
  });
});

//gets a bunch of info on a plane
app.get('/getAirplane', (req, res) => {
  let data = {};
  let url = "https://aviation-edge.com/v2/public/flights?key="+APIkey;
  if (req.query.flightIcao) url += "&flightIcao="+req.query.flightIcao;
  request(url, (planeInfo) => {
    console.log("getAirplane: ", planeInfo);
    if(planeInfo.length > 0){
      let plane = planeInfo[0];
      data.altitude = plane.geography.altitude;
      data.regNumb = plane.aircraft.regNumber;
      data.airline = plane.airline.icaoCode;
      data.flightIcao = plane.flight.icaoNumber;
      DatabaseConn("SELECT * FROM airport WHERE iataCode = '"+plane.arrival.iataCode+"';").then((port)=>{
        if(port.length > 0){
          console.log("airport: ", port[0]);
          data.arrivalAirport = {
            name : port[0].name,
            country : port[0].country,
            city : port[0].city
          }
        }
        DatabaseConn("SELECT * FROM airport WHERE iataCode = '"+plane.departure.iataCode+"';").then((port)=>{
          if(port.length > 0){
            data.depatureAirport = {
              name : port[0].name,
              country : port[0].country,
              city : port[0].city
            }
          }
          res.send(data);
        }).catch((err) => {console.log("depatureAirport err: ", err);}); 
      }).catch((err) => {console.log("arrivalAirport err: ", err);})
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
    let query;
    if(req.query.usertype && req.query.name) { 
      query = `UPDATE ${req.query.usertype} SET trackingIcao24 = '${req.query.flightIcao}' WHERE NAME = '${req.query.name}';`; 
    }
    else{
      query = `UPDATE ${req.session.usertype} SET trackingIcao24 = '${req.query.flightIcao}' WHERE UID = '${req.session.userId}';`;
    }
    
    DatabaseConn(query).then(function(){
      req.session.tracking = req.query.flightIcao;
      res.send(true);
    }).catch((err) => {
      console.log("flightToDB error: ", err);
      res.send(false);
    })
  }
  else { res.send(false); }
});

app.get("/getCompanies", (req,res)=>{
  let companies = [];
  let query = `SELECT * FROM company_code`;
  if(req.query.company) query += ` WHERE company = '${req.query.company}'`
  DatabaseConn(query).then((rows)=>{
    res.send(rows);
  }).catch((err) => {
    console.log("getCompanies err: ", err);
  });
});

app.get("/getEmployers", (req,res) =>{
  let employers = [];
  let query = `SELECT UID, name, email, companyName, trackingIcao24 FROM employer`
  if(req.query.employer) query += ` WHERE name = '${req.query.employer}'`
    DatabaseConn(query).then((rows) => {
      res.send(rows);
    })
})

app.get("/getEmployees", (req,res) =>{
  let employers = [];
  let query = `SELECT UID, name, email, employer, trackingIcao24 FROM employee`
  if(req.query.employer) query += ` WHERE employer = '${req.query.employer}'`;
  else if(req.query.employee) query += ` WHERE name = '${req.query.employee}'`;
    DatabaseConn(query).then((rows) => {
      console.log("getEmployees: ", rows);
      res.send(rows);
    })
})

app.get(`/addEmployer`, (req,res) =>{
  const query = 
    `INSERT INTO employer (name, email, companyName, certifiedKey) VALUES ('${req.query.empName}', '${req.query.empMail}', '${req.query.compName}', '${req.query.compCode}')`;
  DatabaseConn(query).then(() =>{
    res.send("success")
  }).catch((err) => {
    console.log("addEmployer err: ",err);
    res.send(err.code);
  })
})

app.get(`/addEmployee`, (req,res) =>{
  const query = 
    `INSERT INTO employee (name, email, employer) VALUES ('${req.query.empName}', '${req.query.empMail}', '${req.query.employer}')`;
  DatabaseConn(query).then(() =>{
    res.send("success")
  }).catch((err) => {
    console.log("addEmployer err: ",err);
    res.send(err.code);
  })
})

app.get('/resetPass', (req,res) => {
  const query = `UPDATE ${req.query.usertype} SET password = NULL WHERE name = '${req.query.user}'`;
  DatabaseConn(query).then(() => {
    res.send("success");
  }).catch((e)=>{
    console.log("resetPass err: ", e);
    res.send(e);
  })
});

app.get('/transferEmployee', (req, res) =>{
  const query = `UPDATE employee SET employer = '${req.query.employer}' WHERE name = '${req.query.employee}'`;
  DatabaseConn(query).then(() => {
    res.send("success");
  }).catch((e) => {
    console.log("transferEmployee err: ", e);
    res.send(e);
  })
});

app.get('/transferEmployer', (req,res) =>{
  const query = `UPDATE employer SET companyName = '${req.query.company}' WHERE name = '${req.query.employer}'`;
  DatabaseConn(query).then(() => {
    res.send("success");
  }).catch((e) => {
    console.log("transferEmployer err: ", e);
    res.send(e);
  })
});

app.get("/deleteEmployee", (req, res) =>{
  const query = `DELETE FROM employee WHERE name = '${req.query.employee}'`;
  DatabaseConn(query).then(() =>{
    res.send("success");
  }).catch((e) => {
    console.log("deleteEmployee err: ",e);
    res.send(e);
  })
})

app.get(`/addCompany`, (req, res) =>{
  let newCode = uuidv4();
  const query = `INSERT INTO company_code (company, code) VALUES ('${req.query.newcompany}', '${newCode}');`;
  DatabaseConn(query).then(() =>{
    res.send(newCode);
  }).catch((e) =>{
    console.log("addCompanyErr: ", e);
    res.send("fail");
  })
})

app.get("/deleteEmployer", (req, res) =>{
  const query = `DELETE FROM employer WHERE name = '${req.query.employer}'`;
  DatabaseConn(query).then(() =>{
    DatabaseConn(`UPDATE employee SET employer = 'None' WHERE employer = '${req.query.employer}'`).then(()=>{
      res.send("success");
    }).catch((err) =>{
      console.log("deleteEmployer2 err: ", err);
      res.send(err);
    })
  }).catch((e) => {
    console.log("deleteEmployer err: ",e);
    res.send(e);
  })
})

app.get("/deleteCompany", (req, res) =>{
  const query = `DELETE FROM company_code WHERE company = '${req.query.company}'`;
  DatabaseConn(query).then(() =>{
    DatabaseConn(`UPDATE employer SET companyName = 'None', certifiedKey = 'None' WHERE companyName = '${req.query.company}'`).then(()=>{
      res.send("success");
    }).catch((err) =>{
      console.log("deleteCompany err: ", err);
      res.send(err);
    })
  }).catch((e) => {
    console.log("deleteCompany2 err: ",e);
    res.send(e);
  })
});

app.get("/checkUserType", (req,res) => {
  res.send({ name : req.session.name, type : req.session.usertype });
});

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
        //console.log("request datastring: ", datastring);
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
