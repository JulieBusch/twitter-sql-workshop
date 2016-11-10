'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
const client = require('../db/');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    var allTheTweets = tweetBank.list();
    res.render('index', {
      title: 'Twitter.js',
      tweets: allTheTweets,
      showForm: true
    });
  }


  router.get('/',function(req, res, next){
        client.query('SELECT tweets.id, users.name, tweets.content FROM tweets inner join users on users.id = tweets.userid', function (err, result) {
          if (err) return next(err); // pass errors to Express
          var tweets = result.rows;
          res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
      });
  });

  // here we basically treet the root view and tweets view as identical
  // router.get('/', respondWithAllTweets);
  // router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
      client.query('SELECT tweets.id, users.name, tweets.content FROM tweets inner join users on users.id = tweets.userid WHERE name=$1', [req.params.username], 
        function (err, result) {
         var tweets = result.rows;
          res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
      });

    // var tweetsForName = tweetBank.find({ name: req.params.username });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweets,
    //   showForm: true,
    //   username: req.params.username
    // });
  });


  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){

    client.query('SELECT  users.name, tweets.content FROM tweets inner join users on users.id = tweets.userid WHERE tweets.id=$1', [req.params.id], 
        function (err, result) {
         var tweets = result.rows;
          res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
      });


    // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsWithThatId // an array of only one element ;-)
    // });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var usersObj;
      client.query('select id, name from users', function (err, data) {
            // console.log("user names from table", data);
            usersObj = data.rows;
          });
    console.log(usersObj);

      var isUser = false;
      usersObj.forEach(function(elem){
          if(elem.name === req.body.name){
              isUser = true;
          } 
          
      });
      if(!isUser){

       client.query('INSERT INTO users (name) VALUES ($1)',  [req.body.name], 
            function (err, data) {
            console.log("row added", data.row);
          });
      }

      client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2)', [req.body.name, req.body.content], 
            function (err, data) {
            
          });
   
    var newTweet = tweetBank.add(req.body.name, req.body.content);
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
