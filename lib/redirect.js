var express = require('express'),
    app = express();

app.get('*', function(req, res){
    res.redirect(301, 'http://xoxomoon.com' + req.url);
});

exports.app = app;
