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

router.get("/signup", isAuthenticated, function(req, res) {
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
  models.Post.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      {model: models.User, as: 'Users'},
      {model: models.Like, as: 'Likes'}
    ]
})
    .then(function(data) {
      console.log(data[0].userId);
      // if (req.user.username === ) {
      //
      // }

      res.render("feed", {posts: data, currentUser: req.user.username})
    })
    .catch(function(err) {
      console.log(err);
      next(err);
    });
});

router.post("/new_post", isAuthenticated, function(req, res) {

  models.Post.create({
    userId: req.user.id,
    message: req.body.message
  })
  .then(function(data) {
    res.redirect("/feed");
  })
});





const getPost = function (req, res, next) {
    models.Post.findById(req.params.Id).then(function (post) {
        if (post) {
            req.post = post;
            next();
        } else {
            res.status(404).send('Not found.');
        }
    })
}


router.get("/like/:id", isAuthenticated, getPost, function(req, res) {

  req.post.likes += 1;
  req.post.save().then(function () {
      res.redirect(req.link.url);
  });

  models.Like.create({
    userId: req.user.id,
    postId: req.params.id
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
