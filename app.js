var express = require('express'),
    async = require('async'),
    config = require('./lib/config.js'),
    app = express(),
    routes = require('./lib/routes');

app.set('views', __dirname + '/views');
app.use(express.vhost('www.xoxomoon.aws.af.cm', require('./lib/redirect').app));
app.use(express.vhost('www.xoxomoon.com', require('./lib/redirect').app));
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
                post: null,
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
                        post: { title: "Archive" },
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
        }else if(posts.length > 0){
            res.render('blog.jade', {
                posts: posts
            });
        }else{
            res.render('404.jade', {
                message: "Sorry, there aren't any posts for " + req.params.year
            });
        }
    });
});

app.get('/:year/:month', function(req, res){
    if(req.params.month.length < 2){
        res.redirect(301, '/' + req.params.year + '/' + '0' + req.params.month);
    }else if(req.params.month < 1 || req.params.month > 12){
        res.render('404.jade', {
            message: "That's not really a month."
        });
    }else{
        config.Blog.find({year: req.params.year, month: req.params.month}).sort('-date').exec(function(err, posts){
            if(err){
                console.log(err);
            }else if(posts.length > 0){
                res.render('blog.jade', {
                    posts: posts
                });
            }else{
                var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                res.render('404.jade', {
                    message: "Sorry, there aren't any posts for " + month[req.params.month-1] + ', ' + req.params.year
                });
            }
        });
    }
});

app.get('/:year/:month/:slug', function(req, res){
    if(req.params.month.length < 2){
        res.redirect(301, '/' + req.params.year + '/' + '0' + req.params.month + '/' + req.params.slug);
    }else if(req.params.month < 1 || req.params.month > 12){
        res.render('404.jade', {
            message: "That's not really a month."
        });
    }else{
        config.Blog.findOne({year: req.params.year, month: req.params.month, slug: req.params.slug}, function(err, post){
            if(err){
                res.send(err);
            }else{
                config.Blog.find({date: {$lt: post.date}}).sort('-date').limit(1).exec(function(err, prev){
                    if(err){
                        res.send(err);
                    }else{
                        config.Blog.find({date: {$gt: post.date}}).sort('date').limit(1).exec(function(err, next){
                            if(err){
                                res.send(err);
                            }else{
                                res.render('post.jade', {
                                    post: post,
                                    prev: prev[0],
                                    next: next[0]
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

app.use(routes.errorHandler);

app.listen(process.env.VCAP_APP_PORT || 3000);
