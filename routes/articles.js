const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Init models
let Article = require('../models/article');
let User = require('../models/user')

// Add article route (GET)
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add article route (POST)
router.post('/add', [
    check('title', 'Title must not be empty').isLength({ min: 1 }),
    //check('author', 'Author must not be empty').isLength({ min: 1 }),
    check('body', 'Body must not be empty').isLength({ min: 1 })
    ], (req, res) => {

    //Get errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save((err) => {
            if(err) {
                console.log(err);
            } else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }

});

// Edit route (GET)
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
      if(article.author != req.user._id){
        req.flash('danger', 'Not Authorized');
        res.redirect('/');
      }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

// Edit route (POST)
router.post('/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.updateOne(query, article, (err) => {
        if(err) {
            console.log(err);
        } else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

// Delete route
router.delete('/:id', (req, res) => {
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      Article.deleteOne(query, (err) => {
          if(err) {
              console.log(err);
          }
          res.send('Success');
      });
    }
  });
});

// Article route
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, function(err, user){
          res.render('article', {
              article: article,
              author: user.name
            });
        });
    });
});

// Access Control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
