// Dependencies
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const methodOverride = require('method-override');

// Models
const User = require('../models/users.js');
const Artist = require('../models/artists.js');
const Album = require('../models/albums.js');

// Middleware
router.use(methodOverride('_method'));
router.use(express.static('public'));

// Routes

// // 'Root' Redirect
// router.get('/', (req, res) => {
//   if (req.session.logged) {
//     res.redirect('/user/' + req.session.username);
//   } else {
//     res.redirect('login');
//   }
// })

// Login Page
router.get('/login', (req, res) => {
  const user = {};
  if (req.session.logged) {
    user = req.session.username;
  } else {
    user.logged = false;
  }
  res.render('user/login.ejs', {
    message: req.session.message,
    user
  });
});

// Login Post
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({username: req.body.username});
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.username = req.body.username;
      req.session.logged = true;
      res.redirect('/user/' + req.session.username);
    } else {
      req.session.message = "Username/password combination is invalid";
      res.redirect('/login');
    }
  } catch (err) {
    console.log(err.message);
    req.session.message = "Username/password combination is invalid";
    res.redirect('/login');
  }
});

// Register Post
router.post('/register', async (req, res) => {
  const password = req.body.password;
  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const username = req.body.username;
  const userDbEntry = {};
  userDbEntry.username = username;
  userDbEntry.password = passwordHash;
  try {
    const user = await User.create(userDbEntry);
    console.log(user);
    req.session.username = user.username;
    req.session.logged = true;
    res.redirect('/user/' + req.session.username);
  } catch (err) {
    res.send(err.message);
  }
});

// Settings Page
router.get('/:id/settings', async (req, res) => {
  const userToEdit = await User.findOne({username: req.params.id});
  let user = {};
  if (req.session.logged) {
    user = req.session.username;
  } else {
    user.logged = false;
  }
  res.render(
    'user/edit.ejs',
    {
      user: userToEdit,
      index: req.params.id,
      user
    }
  );
});

// Update Route
router.put('/:id', async (req, res) => {
  req.body.followedBands = req.body.followedBands.split(',');
  try {
    const userToUpdate = await
    User.update(
      {username: req.params.id},
      {
        $set: {
          followedBands: req.body.followedBands
        }
      });
    res.redirect('/user/' + req.session.username);
  } catch (err) {
    res.send(err.message);
  }
});

// Logout/Destroy Session
router.get('/logout', (req, res) => {
  req.session.destroy();
  console.log(req.session);
  res.redirect('/login');
});

// Test
router.get('/test', (req, res) => {
  res.send(req.session);
});

// Delete User Route
router.delete('/:id/', async (req, res) => {
  console.log(req.params.id);
  const user = await User.findOne({username: req.params.id});
  console.log(user);
  await user.remove();
  // await Comment.remove({user: user._id});
  res.redirect('/login');
})

// User Dashboard Route
router.get('/user/:id', async (req, res) => {
  if (req.session.logged) {
    const userToShow = await User.find({username: req.params.id});
    console.log(userToShow);
    const bands = await userToShow[0].followedBands;
    console.log(bands);
    res.render('user/show.ejs', {
      user: req.session,
      bands: bands
    });
  } else {
    res.redirect('login');
  }
});

// Controller Export
module.exports = router;
