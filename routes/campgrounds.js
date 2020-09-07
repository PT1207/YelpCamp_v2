var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
const axios = require("axios");
var multer = require('multer');
var cloudinary = require('cloudinary');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})


cloudinary.config({ 
  cloud_name: 'projectinfotor1', 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

router.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});



//OPEN ALL CAMPGROUNDS AND THE FUZZY SEARCH BOX LOGIC!
router.get("/", function(req, res) {
	//stripe logic 
	var noMatch = null;
	if(req.query.search){
	const regex = new RegExp(escapeRegex(req.query.search), 'gi');//gi global something-whatever letter you put it ...
		
			 //Get all campgrounds from DB
		Campground.find({name:regex}, function(err, allCampgrounds) {
			if (err || !allCampgrounds) {
				console.log(err);
				res.redirect("back");
			}
			else {
				if(allCampgrounds.length < 1){
				var	noMatch = "No campground was found,please try again!";
				res.render("campgrounds/index", { campgrounds: allCampgrounds, noMatch:noMatch});
				} else {
					res.render("campgrounds/index", { campgrounds: allCampgrounds,noMatch:noMatch});
				}
					
			}
   			 });
		
	} else {
		//Get all campgrounds from DB
			Campground.find({}, function(err, allCampgrounds) {
				if (err || !allCampgrounds) {
					console.log(err);
					res.redirect("back");
				}
				else {
					res.render("campgrounds/index", { campgrounds: allCampgrounds, noMatch: noMatch});
				}
   				 });
		}
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


//POST REQUEST TO SUBMIT NEW CAMPGROUND DETAIL
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    try{
		
	
	} catch(error){
		
	}
	
	var city = req.body.campground.city;
		axios({
    "method":"GET",
    "url":"https://community-open-weather-map.p.rapidapi.com/weather",
    "headers":{
    "content-type":"application/octet-stream",
    "x-rapidapi-host":"community-open-weather-map.p.rapidapi.com",
    "x-rapidapi-key":"e2bbc1935amshad9d71d7915e7d2p1e6789jsn6f0f65ea08db",
    "useQueryString":true
    },"params":{
    "id":"2172797",
    "units":"%22imperial%22",
    "mode":"",
    "q":`${city}`
    }
    })
	.then((response)=>{
			
	cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
  req.body.campground.image = result.secure_url;
  // add to image a public id -changed some stuff in the model too 
	req.body.campground.imageId=result.public_id;
	 // add author to campground	
  req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  }
	//Create a new campground and save to DB
  Campground.create(req.body.campground , function(err, campground) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    res.redirect('/campgrounds/' + campground.id);
  });
	})
	.catch((err)=>{
				console.log("Campgrounds route! Problems could be with the city ! (i'm in the catch err)");
				req.flash("error","Such a city dosen't exist ! Please try again!")
				res.redirect("back");
			});
		});
});

//FORM FOR NEW CAMPGROUND
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
})

//SHOW MORE DETAILS OF CAMPGROUND WHEN CLICKED
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments likes").exec(function(err, foundCampground) {
        if (err || !foundCampground) {
			console.log(err);
			req.flash("error","Campground not found!")
			return res.redirect("/campgrounds");
        }
        else {
			
			axios({
    "method":"GET",
    "url":"https://community-open-weather-map.p.rapidapi.com/weather",
    "headers":{
    "content-type":"application/octet-stream",
    "x-rapidapi-host":"community-open-weather-map.p.rapidapi.com",
    "x-rapidapi-key":"e2bbc1935amshad9d71d7915e7d2p1e6789jsn6f0f65ea08db",
    "useQueryString":true
    },"params":{
    "id":"2172797",
    "units":"%22imperial%22",
    "mode":"",
    "q":`${foundCampground.city}`
    }
    })
	.then((response)=>{
				
				
				var temp=response["data"]["main"]["feels_like"];
				var temperature = temp - 273.15; 
				
			var cityInfo={
			temp:temperature,
			humidity : response["data"]["main"]["humidity"],
			windSpeed : response["data"]["wind"]["speed"],
			country : response["data"]["sys"]["country"],
			cityName : response["data"]["name"],
		};	
    res.render("campgrounds/show", { campground: foundCampground, cityInfo: cityInfo});
	})
	.catch((err)=>{
				console.log(err);
				req.flash("error","This Campground has some Weather-API problems! We are working hard to solve it right now! Please try again later")
				res.redirect("/campgrounds");
			})
			
        }
    });
});

//EDIT CAMPGROUND ROUTEE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log("error finding ID");
        } else{
          res.render("campgrounds/edit", {campground: foundCampground});

        }
    });
});


//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
   Campground.findById(req.params.id, async function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds")
        } else {
			if(req.file){
			try {
			 	await cloudinary.v2.uploader.destroy(updatedCampground.imageId);
			var result = await cloudinary.v2.uploader.upload(req.file.path);
				 updatedCampground.imageId=result.public_id;
				updatedCampground.image=result.secure_url;
					
			} catch(err){
					req.flash("error",err.message);
					return res.redirect("back");
				}	
				}
		// update and save !
			
			updatedCampground.city=req.body.campground.city;
			updatedCampground.price=req.body.campground.price;
			updatedCampground.name=req.body.campground.name;
			updatedCampground.description=req.body.campground.description;
			updatedCampground.save();
            //redirect somewhere(showPage)
			req.flash("success",updatedCampground.name + " was Updated !");
            res.redirect("/campgrounds/" + req.params.id);
		}
        });
});


//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id,async function(err,campground){
        if(err){
            res.redirect("/campgrounds");
        } else {
			
			try{
			await cloudinary.v2.uploader.destroy(campground.imageId);
			campground.remove();
			req.flash("success",campground.name + " was deleted!");
            res.redirect("/campgrounds");
				
			} catch(err){
				req.flash("error",err.message);
					return res.redirect("back");	
			}
        }
    });
});

router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
				req.flash("error", err.message);
                return res.redirect("/campgrounds");
            }
			
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});

//middleWare


 module.exports = router;
	
	
	
	