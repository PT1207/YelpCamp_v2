// all the middle wares goes here
var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comments");


middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){    
    Campground.findById(req.params.id, function(err, foundCampground){
       if(err || !foundCampground){
           req.flash("error", "Campground not found")
           res.redirect("back");
       } else{
           //does user own the campground?(Authorization)
          if(foundCampground.author.id.equals(req.user.id) || req.user.isAdmin){ //this was the line to check if you are the real author !
              next();
          } else{
              req.flash("error", "You dont have permission to do that")
              res.redirect("back");
          }
       }
    });
} else {
    res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){    
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err || !foundComment){
		   req.flash("error","Comment not found!");
           res.redirect("/campgrounds");
       } else{
           //does user own the comment?(Authorization)
          if(foundComment.author.id.equals(req.user.id)|| req.user.isAdmin){
              next();
          } else{
        req.flash("error", "You dont have permission to do that")

              res.redirect("back");
          }
       }
    });
} else {
       req.flash("error", "You need to be logged in to do that")

    res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
		return next()
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;