const User = require('../models/user'); //collection of Database
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user){
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret) //sub = subject
}

exports.signin = function(req, res, next){
  // User has already had their email and password autho'd
  // We just need to give them a token
  res.send({ token: tokenForUser(req.user)})
}

exports.signup = function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password){
    return res.status(422).send({error: 'You must provide email/password'})
  }
  // See if a user with a given email exists
  User.findOne({ email: email }, function(err, existingUser){
    if (err) { return next(err) ;}
    // If it does exist, return an error
    if (existingUser){
      console.log(existingUser, "DOES THIS EXIST?")
      return res.status(422).send({error: "Email is in use?!"}) //422 means an error
    }
    // If a user with email that does not exist, create and save user
    // record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err){
      if (err) { return next(err);}
      // Respond to requst indicating the user was created
        res.json({token: tokenForUser(user) });
    })
  })
}
