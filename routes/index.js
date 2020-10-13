var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
const { isLoggedIn } = require('../middleware');
 var   Campground          = require("../models/campground");
const async =require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");



router.get("/", function(req, res){
    res.render("landing");
});


router.get("/register", function(req, res){
   res.render("register"); 
});


router.post("/register", function(req, res){
   var newUser = new  User({username: req.body.username,
			firstName:req.body.firstName,
		 lastName:req.body.lastName,
		 email:req.body.email,
		 avatar:req.body.avatar});
						   
	
	
	if(req.body.adminCode === "secretcode123"){
		newUser.isAdmin = true;
	}
	
	
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to YelpCamp " + user.username);
           res.redirect("/campgrounds"); 
        });
    });
});


router.get("/login", function(req, res){
   res.render("login"); 
});


router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
		failureFlash:true,
		successFlash:"Welcome to YelpCamp",
    }), function(req, res){
});


router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "You have successfully logged out!");
   res.redirect("/campgrounds");
});


router.get('/checkout', isLoggedIn, (req, res) => {
    if (req.user.isPaid) {
        req.flash('success', 'Your account is already paid');
        return res.redirect('/campgrounds');
    }
    res.render('checkout', { amount: 20 });
});




router.get("/users/:id", (req, res)=>{
	User.findById(req.params.id, (err, foundUser)=>{
		if(err){
			req.flash("error","Something went wrong!");
			res.redirect("/campgrounds");
		} else {
				Campground.find().where("author.id").equals(foundUser._id).exec(function(err,campgrounds){
				if(err){
					req.flash("error","No Campground found for this user");
					res.redirect("back");
				} else {
					res.render("users/showuser",{user:foundUser, campgrounds:campgrounds});
											
					}
					
				})
						
		}
	
	});
});


router.get("/forgot",(req,res)=>{
	res.render("forgot");
});


var generateResetToken = () => {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(20, (err, buf) => {
			if (err) reject(err);
			else {
				let reset_token = buf.toString('hex');
				resolve(reset_token);
			}
		})
	})
}


router.post('/forgot', async (req, res) => {
	try {
		let reset_token = await generateResetToken();
		console.log(reset_token);

		
		let user = await User.findOne({email: req.body.email});
		if (!user) {
      req.flash('error', 'No account with that email address.');
			throw 'user not found.'
		}
		user.resetPasswordToken = reset_token;
		user.resetPasswordExpires = Date.now() + 3600000; 
		
		await user.save();

		
		var smtpTransport = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: 'projectinfotor@gmail.com',
				pass: "process.env.EMAIL_PASS" ,
			}
		});
		
		var mailOptions = {
			to: user.email,
			from: 'projectinfotor@gmail.com',
			subject: 'YelpCamp Password Reset',
			text: 'You are receiving this because you (or someone else) have requested the reset of the password linked to your Yelpcamp account.' +
				'Please click on the following link, or paste this into your browser to complete the process.' + '\n\n' +
				 req.headers.host + '/reset/' + reset_token + '\n\n' + 
				'If you did not request this, please ignore this email and your password will remain unchanged.'
		};
		
		await	smtpTransport.sendMail(mailOptions);
		console.log('mail sent!');
		req.flash("success", 'An email has been sent to ' + user.email + ' with further instructions.');
		res.redirect('/forgot');
	} catch (error) {
		console.log(error);
		res.redirect('/forgot');
	}	
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});


router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'projectinfotor@gmail.com',
          pass: process.env.EMAIL_PASS ,
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'projectinfotor@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email +" with the username: "+user.username + '  ,has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
		  res.redirect("/campgrounds");
        done(err);
      });
    }
  ], function(err) {
		req.flash("error","Something wen wrong! Please Try Again!");
    res.redirect('/login');
  });
});


module.exports = router;
