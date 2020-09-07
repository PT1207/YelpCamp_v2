//require("dotenv").config(); //for stripe payment-to save the secret key in a other file!!
var express                = require("express");
var  app                   = express();
 var   bodyParser          = require("body-parser");
 var   methodOverride      = require("method-override");
 var   mongoose            = require("mongoose");
 var flash 				   = require("connect-flash");
var   passport             = require("passport");
var    LocalStrategy       = require("passport-local");
 var   Campground          = require("./models/campground");
var    Comment             = require("./models/comments");
 var   User                = require("./models/user");
 var    seedDB             = require("./seeds");
	const axios = require("axios");
var multer = require('multer');
var cloudinary = require('cloudinary');
var parse = require('json-parse');
const nodemailer = require('nodemailer');
var async=require("async");
var crypto=require("crypto");
   app.locals.moment = require('moment'); 
mongoose.Promise = global.Promise; 

var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var authRoutes =require("./routes/index");


//seedDB(); //seed the database

var url=process.env.DATABASEURL || process.env.DATABASELOCALURL ;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!')) 
.catch(error => console.log(error.message)); 


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash()); //this is for the npm connect-flash! has to come before your passport authentif ! 
app.use(express.static( __dirname + "/public"));



//PASSPORT CONFIGURATION
app.use(require("express-session")({ //session configuration
    secret: "Once again Rusty  wins cutest dog",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use( async function(req, res, next){
	 res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);









app.get("*",(req,res)=>{
	res.render("PageNotFound");
});
var port = process.env.PORT || 3000;
app.listen(port,()=>{
	console.log("Server Yelp Camp_v2 has Started!")
});