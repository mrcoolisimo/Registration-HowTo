let mongoose = require('mongoose');

//Article Schema
let articleSchema = mongoose.Schema({
  title:{
    type: String,
    reqiured: true
  },
  author: {
    type: String,
    require: true
  },
  body:{
    type: String,
    required: true
  }
});

let Article = module.exports = mongoose.model('Article', articleSchema);
