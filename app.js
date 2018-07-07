/*  Express */

const express = require('express');
const app = express();
var mongoose = require('mongoose');
var mongo = require('mongodb');

mongoose.connect('mongodb://localhost/sampledb');
var db = mongoose.connection;


var User = require('./models/user');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login', (req, res) => res.sendFile('auth.html', { root : __dirname}));

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));

/*  Passport  */

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/profile', (req, res) => res.send("Welcome "+ req.query.username + "!!"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});


/* Register */


app.post('/register', function (req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	
					var newUser = new User({
						name: name,
						email: email,
						username: username,
						password: password
					});
					User.createUser(newUser, function (err, user) {
						if (err) throw err;
						console.log(user);
					});
					console.log("successfull signup");
					res.redirect('/login');
				});

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
      User.findOne({
        username: username 
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

/* Login */

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/profile?username='+req.user.username);
  });
 /* Logout */ 
app.get('/logout', function (req, res) {
	req.logout();

	res.redirect('/login');
});