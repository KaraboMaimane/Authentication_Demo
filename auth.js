let express                 = require('express'),
      mongoose              = require('mongoose'),
      bodyParser            = require('body-parser'),
      passport              = require('passport'),
      LocalStrategy         = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose'),
      User                  = require('./models/user'),
      app                   = express();

mongoose.connect('mongodb://localhost/auth_demo');

app.set('view engine', 'ejs');
app.use(require('express-session')({
    secret: 'We are creating a new session for the auth demo',
    resave: false,
    saveUninitialized: false
}))
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());


let isLoggedIn = (request, response, next) => {
    if(request.isAuthenticated()){
        return next();
    } else {
        response.redirect('/login');
    }
}

// =================================================
// Routes
// =================================================

app.get('/', (request, response) => {
    response.render('home');
})

app.get('/secret', isLoggedIn, (request, response) => {
    response.render('secret')
})

// =================================================
// Auth Routes
// =================================================

//show form for sign up
app.get('/register', (request, response) => {
    response.render('register');
})
app.post('/register', (request, response) => {
    User.register(new User({ username: request.body.username}), request.body.password, (error, user) => {
        if(!error){
            passport.authenticate('local')(request, response, () => {
                response.redirect('/secret');
            })
        } else {
            console.error(error);
            response.render('/register')
        }
    })
})

app.get('/login', (request, response) => {
    response.render('login');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}),(request, response) => {

});

app.get('/logout', (request, response) => {
    request.logout();
    response.redirect('/');
})

app.listen(2000, ()=>{
    console.log('server fired up!!')
})
