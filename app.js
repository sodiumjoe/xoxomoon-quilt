var express = require('express'),
    config = require('./lib/config.js'),
    app = express(),
    routes = require('./lib/routes');

app.set('views', __dirname + '/views');
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/img', express.static(__dirname + '/public/img'));

app.get('/', function(req, res){
    config.Blog.find({}).sort('-date').exec(function(err, posts){
        if(err){
            console.log(err);
        }else{
            res.render('blog.jade', {
                posts: posts
            });
        }
    });

});

app.get('/blog/post', function(req, res){
    res.render('post.jade');
});

//app.use(routes.errorHandler);

app.listen(process.env.VCAP_APP_PORT || 3000);
