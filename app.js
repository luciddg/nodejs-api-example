const config = require('./config.json'),
  express = require('express'),
  logger = require('./lib/logger'),
  request = require('request'),
  session = require('express-session'),
  simpleOauth2 = require('simple-oauth2'),
  util = require('util');

var app = express();
app.use(express.static('public'));

// We use Jade for our views
app.set('view engine', 'jade');

// Setup sessions so we can store the auth token
app.use(session({
  secret: '2HD0mWix5CBNoa8szqqTbZu13IBdk2',
  resave: false,
  saveUninitialized: true
}))

const credentials = {
  client: {
    id: config.client_id,
    secret: config.client_secret
  },
  auth: {
    tokenHost: config.api_host,
    tokenPath: '/o/token/',
    authorizePath: '/o/authorize/',

  }
};
const oauth2 = simpleOauth2.create(credentials);

// Authorization uri definition
var authorization_uri = oauth2.authorizationCode.authorizeURL({
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
  logger.info('/callback', req.query);
  oauth2.authorizationCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:3000/callback'
  }, saveToken);

  function saveToken(error, result) {
    if (error) {
      logger.error('Access Token Error:', error.message);
      res.redirect('/');
    } else {
      // stash the token in the user session
      var auth = oauth2.accessToken.create(result);
      logger.info('result', util.inspect(result));
      logger.info('Returned Auth Token', util.inspect(auth.token));
      req.session.access_token = auth.token.access_token;
      res.redirect('/buildings');
    }
  }

});

// root of the app. Just has a link to kick off the auth process
app.get('/', function (req, res) {
  res.render('index');
});

// Lists the buildings for the current user
app.get('/buildings', function (req, res){
  if (!req.session.access_token) {
    res.redirect(authorization_uri);
  }
  logger.info('Session Auth Token', req.session.access_token);
  var options = {
      url: config.api_host + '/buildings',
      headers: {
        'Authorization': 'Bearer ' + req.session.access_token
      }
    };
  request(options, function (error, response, body) {
    var buildings = [];
    if (!error && response.statusCode == 200) {
      buildings = JSON.parse(body).data;
      res.render('buildings', {title: 'Bulidings', buildings: buildings});
    }
  });
});

app.get('/buildings/:id', function (req, res){
  if (!req.session.access_token) {
    res.redirect(authorization_uri);
  }
  logger.info('Session Auth Token', req.session.access_token);
  const id = req.params.id,
    options = {
      url: config.api_host + '/buildings/' + id,
      headers: {
        'Authorization': 'Bearer ' + req.session.access_token
      }
    };
  request(options, function (error, response, body) {
    var data = {};
    if (!error && response.statusCode == 200) {
      data = JSON.stringify(JSON.parse(body).data, null, 4);
      res.render('building_detail', {data: data});
    }
  });
});

// starting up the app and logging the address/port
var server = app.listen(3000, 'localhost', function () {
  var host = server.address().address,
    port = server.address().port;
  process.env.DEBUG=true;
  logger.info('Example app listening at http://%s:%s', host, port);
});
