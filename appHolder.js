// Get modules
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');



// Connect to Mongo
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection

// Check Connection to Mongo
db.once('open', function(){
  console.log('Connected to MongoDB');
})

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

// Bring in Models
let Article = require('./models/article');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set Public Folder (you wont have to specifiy the "public" directory in the web address to reach these files)
app.use(express.static(path.join(__dirname, 'public')));

// Middlwares -------------------------------

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express Session Middleware (copypasta)
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

// Express Messages Middleware
app.use(require('connect-flash'))
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req,res);
  next();
});

// Express Validator Middeleware (copypasta)
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Home Route
app.get('/', function(req,res){
  Article.find({}, function(err,  articles){

    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });
});

// Get Single Article
app.get('/article/:id', function(req,res){
  Article.findById(req.params.id, function(err, article){
    res.render('article', {
      article:article
    });
  });
});

//Add Route
app.get('/articles/add', function(req,res){
  res.render('add_article', {
    title:'Add Article'
  });
});

// Add Submit POST Route
app.post('/articles/add', function(req,res){
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err){
    if(err){
      console.log(err);
    } else {
      req.flash('success', 'Article Added')
      res.redirect('/');
    }
  });
});

// Load Edit Form
app.get('/article/edit/:id', function(req,res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article', {
      title: 'Edit Article',
      article:article
    });
  });
});

// Update Submit POST Route
app.post('/articles/edit/:id', function(req,res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      res.redirect('/');
    }
  });
});

app.delete('/article/:id', function(req,res){
  let query = {_id:req.params.id}

  Article.remove(query, function(err){
    if(err){
      console.log(err);
    }
    res.send('Success');
  });
});

//Start Server
app.listen(3002, function(){
  console.log('Server started on port 3002');
});

/////////////////////////////

// Dependencies ----------------------------------------
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

// Connect to database
mongoose.connect('mongodb://localhost/nodekb', {useNewUrlParser: true});
let db = mongoose.connection;

db.once('open', () => {
    console.log('Connected to MongoDB');
});

db.on('error', (err) => {
    console.log(err);
});

// Init app
const app = express();

// Init models
let Article = require('./models/article');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Midlewares ----------------------------------------

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'pug');

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Routes ----------------------------------------------

// Home route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if(err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

// Article route
app.get('/article/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('article', {
            article: article
        });
    });
});

// Add article route (GET)
app.get('/articles/add', (req, res) => {
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add article route (POST)
app.post('/articles/add', [
    check('title', 'Title must not be empty').isLength({ min: 1 }),
    check('author', 'Author must not be empty').isLength({ min: 1 }),
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
        article.author = req.body.author;
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
app.get('/article/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

// Edit route (POST)
app.post('/articles/edit/:id', (req, res) => {
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
app.delete('/article/:id', (req, res) => {
    let query = {_id:req.params.id}

    console.log(query);
    Article.deleteOne(query, (err) => {
        if(err) {
            console.log(err);
        }
        res.send('Success');
    });
});

// Port listening --------------------------------------
app.listen(3002, () => {
    console.log('Server started on port 3002');
});
