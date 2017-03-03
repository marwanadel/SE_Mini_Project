var mongoose = require('mongoose');

// User Schema
var PortofolioSchema = mongoose.Schema({
	username: {
		type: String
	},
		name: {
		type: String
	},
	foto:{
		type: String
	},
	email:{
        type: String    
	},
	links :[String]
,
screenshots:[String]
	});

var Portofolio = module.exports = mongoose.model('Portofolio', PortofolioSchema);

module.exports.createPortofolio= function(newPortofolio, callback){
	
	newPortofolio.save(callback);
	};
module.exports.getPortofolioByUsername = function(username, callback){
	var query = {username: username};
	Portofolio.findOne(query, callback);
};

module.exports.summary= [
function(req,res,next){
	var page = req.params.page;
	Portofolio.find({}).populate({path:'portofolio'})
	.limit(10)
	.skip(10*page)
	.exec(function(err,portofolios){
		Portofolio.count().exec(function(err,count){
			if(err){
				return next(err);
			}
			res.render('portofolios',{
	
				data:portofolios,
				current: page,
				count : Math.ceil(count/10)

			});
		});
	});
}
];