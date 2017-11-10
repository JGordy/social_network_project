const express         = require("express");
const mustacheExpress = require("mustache-express");
const path            = require("path");
const routes          = require("./routes/index");
const morgan          = require("morgan");
const bodyParser      = require("body-parser");
const passport        = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const session         = require('express-session');
const flash           = require('express-flash-messages');
const model           = require("./models/index");
const bcrypt          = require("bcrypt");
const cookieParser    = require('cookie-parser');
const pg              = require('pg');

const app             = express();

app.set('port', (process.env.PORT || 3000));

app.use(express.static(path.join(__dirname, "public")));

app.engine("mustache", mustacheExpress());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "mustache");
app.set("layout", "layout");

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(morgan("dev"));

app.use(cookieParser())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash())
app.use(function(req, res, next) {
    res.locals.errorMessage = req.flash('error')
    next()
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    model.User.findOne({
      where: {
        'username': username
      }
    }).then(function (user) {
      if (user == null) {
        return done(null, false, { message: 'Incorrect credentials.' })
      }

      let hashedPassword = bcrypt.hashSync(password, user.salt)

      if (user.passwordHash === hashedPassword) {
        return done(null, user)
      }

      return done(null, false, { message: 'Incorrect credentials.' })
    })
  }
))

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  model.User.findOne({
    where: {
      'id': id
    }
  }).then(function (user) {
    if (user == null) {
      done(new Error('Wrong user id.'))
    }

    done(null, user)
  })
})

app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
})

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

app.use(routes);

if (require.main === module) {
  app.listen(app.get('port'), function() {
    console.log('App is running on ', app.get('port'))
  })
};
