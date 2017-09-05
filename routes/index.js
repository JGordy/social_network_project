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
  models.Post.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      {model: models.User, as: 'Users'},
      {model: models.Like, as: 'Likes'}
    ]
})
    .then(function(data) {
      // console.log(data[0].userId);
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
console.log("Likes.length: ", models.Like.length);
  models.Post.create({
    userId: req.user.id,
    message: req.body.message,
    likes: models.Like.length
  })
  .then(function(data) {
    res.redirect("/feed");
  })
});





// const getPost = function (req, res, next) {
//     models.Post.findOne({
//       where: {id: req.params.id},
//       include: [
//         {model: models.User, as: 'Users'},
//         {model: models.Like, as: 'Likes'}
//       ]
//     })
//     .then(function (data) {
//
//         if (data) {
//             req.post = data;
//             next();
//         } else {
//             res.status(404).send('Not found.');
//         }
//     })
// };


router.get("/like/:id", isAuthenticated,  function(req, res) {

  models.Like.create({
    userId: req.user.id,
    postId: req.params.id
  })
  .then(function(data) {

    res.redirect("/feed");
  })
});



router.get("/see_post/:userId/:id", isAuthenticated, function(req, res) {

  let likedById = [];
  let likedByName = [];

  models.Post.findOne({
    where: {id: req.params.id},
    include: [
      {model: models.User, as: 'Users'},
      {model: models.Like, as: 'Likes'}
    ]
  })
  .then(function(data) {
    let post = data;
    let postId = data.id;
    let dataLikes = data.Likes;
    for (var i = 0; i < dataLikes.length; i++) {
      likedById.push(data.Likes[i].userId);
    };

    models.User.findAll({
      where: {id: likedById}
    })
      .then(function(data) {
        let userData = data;
        userData.forEach(function(entry) {
          likedByName.push(entry.name)
        })
        if (req.params.userId == req.user.id) {
          res.render("my_single_post", {userData: userData, post: post, postId: postId,  data: data, likeNames: likedByName, currentUser: req.user.username});
        } else {
          res.render("single_post", {userData: userData, post: post, postId: postId,  data: data, likeNames: likedByName, currentUser: req.user.username});
        }
      })
      .catch(function(err) {
        console.log(err);
        res.redirect("/feed")
      });
  })
  .catch(function(err) {
    console.log(err);
    res.redirect("/feed");
  })
});

router.get("/remove/:postId", isAuthenticated, function(req, res) {
// console.log(req.params.postId);
  models.Post.destroy({
    where: {
      id: req.params.postId
    }
  })
  .then(function(data) {
    res.redirect("/feed");
  })
  .catch(function(err) {
    res.redirect("/feed");
  })
});


router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
