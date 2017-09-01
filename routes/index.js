const express = require("express");
const models = require("../models/index")
const router = express.Router();
const bcrypt = require("bcrypt");

const passport = require('passport');

const isAuthenticated = function (req, res, next) {
  console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error', 'You have to be logged in to access the page.')
    res.redirect('/')
  }

router.get("/", function(req, res) {

  res.render("signup", {
      messages: res.locals.getMessages()
  });
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/feed',
    failureRedirect: '/',
    failureFlash: true
}));

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post("/signup", function(req, res) {
  let username = req.body.username
  let password = req.body.password
  let name     = req.body.name
  let confirmPassword = req.body.confirmPassword

  if (!username || !password) {
    req.flash('error', "Please, fill in all the fields.")
    res.redirect('signup')
  }

  let salt = bcrypt.genSaltSync(10)
  let passwordHash = bcrypt.hashSync(password, salt)

  let newUser = {
    name: name,
    username: username,
    salt: salt,
    passwordHash: passwordHash
  }

  if (password === confirmPassword) {

    models.User.create(newUser)
    .then(function() {

      res.redirect("/");
    })
    .catch(function(error) {
      req.flash('error', "Please, choose a different username.")
      res.redirect('/signup')
    });

  } else {
    req.flash("error", "Password does not match")
    res.redirect("/signup")
  }
});

router.get("/feed", isAuthenticated, function(req, res) {
  // when writing the find for POSTS make sure to sort by created date and DESCENDING
  models.User.find({})
    .then(function(data) {
      currentUser = req.user;
      res.render("feed", {users: data, username: req.user.username})
    })
    .catch(function(err) {
      console.log(err);
      next(err);
    });
});

router.post("/new_post", isAuthenticated, function(req, res) {
  console.log("req.user.id: ", req.user.id);
  console.log("req.body.message: ", req.body.message);

  models.Post.create({
    userId: req.user.id,
    message: req.body.message
  })
  .then(function(data) {
    res.redirect("/feed");
  })
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
