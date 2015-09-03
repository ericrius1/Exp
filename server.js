var express = require('express');
var morgan = require('morgan');
var app = express();
var directory = require('serve-index');
var path = __dirname+"/";
app.use(directory(path,{icons:true}))
app.use(express.static(path))
app.use(morgan('dev'));
var port = process.env.PORT || 3000
app.listen(port);
console.log('listening on ', port)