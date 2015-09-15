var express = require('express');
var morgan=require('morgan');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
var port =process.env.PORT || 3000
app.listen(port);
console.log('listening on ',port)