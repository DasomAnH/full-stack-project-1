var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models');


// router.get('/register', function(req, res, next) {
//     res.send('respond with a resource');
//   });

//dasom wrote//
/* GET users listing. */



router.get('/', (req, res) => {
  res.render('register', {
    partials: {
      head: "/partial/head"
    },
    locals: {
      title: "register",
      error: null,
    },
  });
});

router.post('/', (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.name) {
    res.render('register', {
      
      locals: {
        error: 'please submit all required fields',
      },
    });
    return;
  }
  const { email, name, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    console.log('User', password, hash);
    db.User.create({
      email: email,
      name: name,
      password: hash,
    }).then(user => {
      res.redirect('/');
    });
  });
});

module.exports = router;
