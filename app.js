var passportLocalMongoose = require('passport-local-mongoose'),
    LocalStrategy         = require('passport-local'),
    User                  = require('./models/user'),
    bodyParser            = require('body-parser'),
    mongoose              = require('mongoose'),
    passport              = require('passport'),
    express               = require('express'),
    app                   = express();
    port                  = 3000;

// =======================================
//              APP SETUP
// =======================================
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost:27017/auth_demo_app", {useNewUrlParser: true});

app.set('view engine', 'ejs');
app.use(require("express-session")({
    secret: "This secret would normally be stored in Environment Vars not as a hardcoded string",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================================
//               ROUTES
// =======================================

app.get("/", (req, res) => {
    res.render("home");
});

// ==========================
// REGISTER ROUTES
// ===========================
// render register form
app.get("/register", (req, res) => {
    res.render("register");
});
// submit registration details
app.post("/register", (req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, ()=>{
            res.redirect("/secret");
        });
    });
});
// ===========================

// ===========================
// LOGIN ROUTES
// ===========================
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), (req, res) => {
});
// ===========================

// ===========================
// LOGOUT ROUTES
// ===========================
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});
// ===========================

// ===========================
// SECRET ROUTES
// ===========================
app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});
// ===========================

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// ===========================
// ENABLE SERVER LISTENING
// ===========================
app.listen(port, () => {
    console.log(`Server listening on port: ${port}.`);
});