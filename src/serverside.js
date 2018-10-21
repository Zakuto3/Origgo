let express = require('express');
let mysql = require('mysql');
let bodyParser = require('body-parser');
let http = require('http');
let fs = require('fs');
let db = require('./DBinfo');

let app = express();
//sets connection to Database with the specifics given from DBinfo.js
let connection = mysql.createConnection(db.connectionstring);
//sets static directory, "root" of homepage


//use for complex json parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//allows for navigation from exteral ip(gateway), not needed if ran on localhost
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



app.use(express.static(__dirname + '/../public')); // if not this is given, give specific adress like : app.get('/', (req, res) => res.send(fs.readFileSync('./index.html', 'utf8')));

//keep server live trough port 3000
app.listen(3000, () => console.log('Server running on port 3000.'));

