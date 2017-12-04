const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const bcrypt = require('bcrypt');

// Database - Connect
const mongoURI = 'mongodb://localhost:27017/jam_sesh';
mongoose.connect(mongoURI, { useMongoClient: true });
mongoose.Promise = global.Promise;

// Database - Test
const db = mongoose.connection;
db.on = ('error', () => console.log(err.message));
db.on = ('connected', () => console.log('Mongo running: ', mongoURI));
db.on = ('disconnected', () => console.log('Mongo disconnected'));

// Middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(morgan('dev'));
app.use(session({
  secret: "wortesindgutwennworkefolgen",
  resave: false,
  saveUninitialized: false
}));

// Controllers
// Controllers Dependencies
const albumsController = require('./controllers/albums.js');
const artistsController = require('./controllers/artists.js');
const sessionsController = require('./controllers/session.js');
// Controller Middleware
app.use('/albums', albumsController);
app.use('/artists', artistsController);
app.use('/user', sessionsController);

// Root Redirect
app.get('/', (req, res) => res.redirect('/user'));


// Config
const PORT = 3002;
// Listen
app.listen(PORT, () => {
  console.log('=============================');
  console.log('Server app on port: ', PORT);
  console.log('=============================');
});