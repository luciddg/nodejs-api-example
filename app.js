var util = require('util');
var express = require('express');
var app = express();

// Used to make requests to the BOS API
var request = require('request');

// Expose our public static folder
app.use(express.static('public'));

// We use Jade for our views
app.set('view engine', 'jade');

// Setup sessions so we can store the auth token
var session = require('express-session')
app.use(session({
  secret: '2HD0mWix5CBNoa8szqqTbZu13IBdk2',
  resave: false,
  saveUninitialized: true
}))
 
// Our custom app configs
// Contains Oauth2 key/secret
var config = require('./config_example.json');

var oauth2 = require('simple-oauth2')({
  clientID: config.client_id,
  clientSecret: config.client_secret,
  site: 'https://api.buildingos.com',
  authorizationPath: '/o/authorize/',
  tokenPath: '/o/token/',
  revocationPath: '/oauth2/revoke/'
});
 
// Authorization uri definition 
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
  scope: 'read',
  state: 'simple_state'
});
 
// Initial page redirecting to BuildingOS 
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});
 
// Callback service parsing the authorization token and asking for the access token 
app.get('/callback', function (req, res) {
  var code = req.query.code;
  console.log('/callback');
  console.log(req.query);
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/callback'
  }, saveToken);
 
  function saveToken(error, result) {
    console.log('result', util.inspect(result));
    console.log('error', util.inspect(error));
    if (error) { 
      console.log('Access Token Error', error.message); 
    }
    else {
      // stash the token in the user session
      var auth = oauth2.accessToken.create(result);
      console.log('Returned Auth Token', util.inspect(auth.token));
      req.session.access_token = auth.token.access_token;
      res.redirect('/buildings');
    }
  }

});
 
// root of the app. Just has a link to kick off the auth process
app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

// Lists the buildings for the current user
app.get('/buildings', function (req, res){
  console.log('Session Auth Token', req.session.access_token);
  var buildings = [];
  var options = {
    url: 'https://api.buildingos.com/buildings',
    headers: {
      'Authorization': 'Bearer ' + req.session.access_token
    }
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      buildings = JSON.parse(body).data;
      res.render('buildings', {title: 'Bulidings', buildings: buildings});
    }
  });
});

// Experiment with Chart.js
app.get('/chart_demo', function (req, res){
  res.render('chart_demo', {title: 'Demo'});
});

// Experiment with generating data readings for charting demo
app.get('/data', function (req, res){
  var moment = require('moment');
  require('moment-range');
  var start = new Date(2014, 1, 1);
  var end   = new Date(2015, 1, 1);
  var timespan = moment.range(start, end);
  var readings = [];

  timespan.by('months', function(moment) {
    var ts = moment.format();
    var vals = {'a':1, 'b': 2, 'c': 3};
    var ts_reading = {};
    ts_reading[ts] = vals;
    readings.push(ts_reading); 
  }); 
  
  res.json({"data": readings});
});
 
// starting up the app and logging the address/port
var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;
  process.env.DEBUG=true;
  console.log('Example app listening at http://%s:%s', host, port);

});
