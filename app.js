var express = require('express'),
    async = require('async'),
    config = require('./lib/config.js'),
    app = express(),
    routes = require('./lib/routes');

app.set('views', __dirname + '/views');
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/img', express.static(__dirname + '/public/img'));

app.get('/assets/*', function(req, res){
    res.redirect(301, config.assets + req.url);
});


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

app.get('/about', function(req, res){
    res.render('about.jade');
});

app.get('/archive', function(req, res){
    var postArray = [];
    config.Blog.findOne({}, {}, { sort: { 'date' : 1 } }, function(err, post){
        config.Blog.findOne({}, {}, { sort: { 'date': -1 } }, function (err, post2){
            var currentYear = post.year;
            async.whilst(
                function() { return currentYear <= post2.year },
                function(callback){
                    config.Blog.find().where('year').equals(currentYear).sort('date').exec(function(err, posts){
                        postArray.push({year: currentYear, posts: posts});
                        currentYear++;
                        callback(null);
                    });
                },
                function(err){
                    console.log(postArray);
                    res.render('archive.jade', {
                        posts: postArray
                    });
            });
        });
    });
});

app.get('/:year', function(req, res){
    config.Blog.find({year: req.params.year}).sort('-date').exec(function(err, posts){
        if(err){
            console.log(err);
        }else{
            res.render('blog.jade', {
                posts: posts
            });
        }
    });
});

app.get('/:year/:month', function(req, res){
    config.Blog.find({year: req.params.year, month: req.params.month}).sort('-date').exec(function(err, posts){
        if(err){
            console.log(err);
        }else{
            res.render('blog.jade', {
                posts: posts
            });
        }
    });
});

app.get('/:year/:month/:slug', function(req, res){
    config.Blog.findOne({year: req.params.year, month: req.params.month, slug: req.params.slug}, function(err, post){
        if(err){
            res.send(err);
        }else{
            res.render('post.jade', {
                post: post
            });
        }
    });
});

//app.use(routes.errorHandler);

app.listen(process.env.VCAP_APP_PORT || 3000);
