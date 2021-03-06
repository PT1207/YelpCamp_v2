var mongoose = require("mongoose"),
Campground = require("./models/campground"),
Comment = require("./models/comments")

const seeds = [ //what ever you call it ,it has to be a plural and make sense!
    {
        name: "Felix xnaw",
        image:"https://images.unsplash.com/photo-1468914627279-5d80a88fcd43?dpr=1&auto=format&fit=crop&w=767&h=511&q=60&cs=tinysrgb&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem IpsumWhy do we use it?It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    },
    {
        name: "Lucy Health",
        image:"https://images.unsplash.com/photo-1482017276394-d2ddc6d4c978?dpr=1&auto=format&fit=crop&w=767&h=511&q=60&cs=tinysrgb&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D",
        description: "What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Why do we use it?It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    },
    {
        name: "ChutterSnap",
        image:"https://images.unsplash.com/photo-1493540554008-8e3008329feb?dpr=1&auto=format&fit=crop&w=767&h=512&q=60&cs=tinysrgb&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D",
        description: "What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.hy do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    }
]

async function seedDB(){
	try {
    //Remove all campgrounds
    await Campground.remove({});
	//console.log("Campgrounds Removed!");
	//Remove all comments
	await Comment.remove({});
	//console.log("Comments Removed!");
	//for each seed of seeds do something! 
		for( const seed of seeds){
			let campground = await Campground.create(seed);
			//console.log("Campground created!");
			let comment = await Comment.create(
						{
							text: "this place is great, but i wish there was internet",
							author: "Homer"
						});
			console.log("Comment created!");
			campground.comments.push(comment);
			campground.save();
			//console.log("Comment added to campground!");
		
		}
	} catch(err) {
		console.log(err);
		
 }
}
    
  

//export seed function
module.exports = seedDB;