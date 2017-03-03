var x ;
var y ;
var z = '';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var Portofolio = require('../models/portofolio');
var userUploadsPath = path.resolve(__dirname,"user_uploads");
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/user_uploads');
  },
  filename: function (req, file, callback) {
  	if(file.originalname != null || file.originalname !=''){
  	//console.log(file.originalname);
  	var filename = file.originalname;
  	var arr = filename.split(".");
  	var filetype = arr[arr.length-1];
  	var newfilename = req.user.username + '-' + Date.now()+'.'+filetype;
  	console.log(newfilename);
    callback(null, newfilename);
    if(storagetype=="profile")
    {
    	y=newfilename;
    	req.user.foto=newfilename;
    	req.user.save();
    	req.flash('success_msg','Your profile picture uploaded successfully');

    }else if(storagetype=="screenshot"){
    	z= newfilename ;
    	console.log(z);
    	req.flash('success_msg','Your screenshot uploaded successfully');
    }
    }

  }
});

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

//create portofolio
router.get('/createportofolio',ensureAuthenticated,function(req,res){
	res.render('createportofolio');
});


//add work
router.get('/addproject',ensureAuthenticated,function(req,res){
	res.render('addproject');
});
//profile
router.get('/profile',ensureAuthenticated,function(req,res){
	res.render('profile');
});

router.get('/addlink',ensureAuthenticated,function(req,res){
	res.render('addlink');
});

router.get('/addscr',ensureAuthenticated,function(req,res){
	res.render('addscr');
});

router.get('/myprojects',ensureAuthenticated,function(req,res){
	res.render('myprojects');
});


//paging
router.get('/portofolios',function(req,res,next){
	res.redirect('/users/portofolios/page/0');
});
router.get('/portofolios/page/:page',Portofolio.summary);

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

//

//router.post('/',function(req,res) {
  //  upload(req,res,function(err) {
    //    if(err) {
      //      return res.end("Error uploading file.\n"+err);
        //}
        //res.redirect('/users/profile/'+req.user.id);
    //});
//});

// Register User
router.post('/register', function(req, res){
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var name = req.body.name;

	// Validation
	//req.checkBody('name','Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name:"",
			email:email,
			username: username,
			password: password,
			projects: 0,
			foto:'http://placehold.it/380x500'
		});

		User.createUser(newUser, function(err, user){
			if(err){
			if(err.name == 'MongoError'){ 	
				req.flash('error_msg', 'username already exists');
				res.redirect('/users/register');
			}}
			else{
			console.log(user);
				req.flash('success_msg', 'You are registered successfully');

		res.redirect('/users/login');
		}
		});

	
	}
});

// create portofolio
var upload = multer({ storage: storage}).single('fileToUpload');

router.post('/createportofolio',function(req, res){
	storagetype='profile';
	upload(req,res,function(err){
		if(err){
			return res.end("Error uploading file.\n+err");
		}
	
	var name = req.body.name;
	//storagetype = "profile";
	//var foto = req.body.fileToUpload;
	req.checkBody('name', 'Name is required').notEmpty();

	
	var errors = req.validationErrors();

	if(errors){
		res.render('createportofolio',{
			errors:errors
		});
	}else{
	 x= name ;
	 //y= foto;
	 console.log(name);			
	 req.user.name = name ;
	 req.user.save();
	 //req.user.foto = y ;

		req.flash('success_msg', 'Done !');

		res.redirect('/users/addproject');
	} 
	});
});

//add Link
router.post('/addlink',function(req,res){
	var link = req.body.link ;
  
     Portofolio.getPortofolioByUsername(req.user.username,function(err,portofolio){
      if(err) throw err ;

      if(req.user.links[0]==''){
      portofolio.links=[link];
    portofolio.save();	
    req.user.links=[link];
	req.user.projects +=1;
	req.user.save();
}
else {

	portofolio.links.push(link);
    portofolio.save();	
    req.user.links.push(link);
	req.user.projects +=1;
	req.user.save();
}

		req.flash('success_msg', 'Done !');

		res.redirect('/users/profile');
  })  ;
});

//add screenshot
router.post('/addscr',function(req,res){
	storagetype='screenshot';
	upload(req,res,function(err){
		if(err){
			return res.end("Error uploading file.\n+err");
		}

		if(z == ''){
			req.flash('error_msg', 'You did not chooose anything !');

		res.redirect('/users/addscr');
		}
		else{
		Portofolio.getPortofolioByUsername(req.user.username,function(err,portofolio){
      if(err) throw err ;
       if(req.user.screenshots[0]==''){
      portofolio.screenshots=[z];
    portofolio.save();	
    req.user.screenshots=[z];
	req.user.projects +=1;
	req.user.save();
}
else {

	portofolio.screenshots.push(z);
    portofolio.save();	
    req.user.screenshots.push(z);
	req.user.projects +=1;
	req.user.save();
}

     z='';
		req.flash('success_msg', 'Done !');

		res.redirect('/users/profile');
		});
	}

	});
});


//add work
router.post('/addproject',function(req, res){
storagetype='screenshot';
	upload(req,res,function(err){
		if(err){
			return res.end("Error uploading file.\n+err");
		}
	
	var link = req.body.link;
   // var screenshot = req.body.fileToUpload;
    //console.log(link);
    //console.log(screenshot);
	// Validation
	//req.checkBody('name', 'Name is required').notEmpty();
	//req.checkBody('email', 'Email is required').notEmpty();
	//req.checkBody('link', 'link is not valid').isAlpha();
	//req.checkBody('name', 'Name is required').notEmpty();
if(link == '' && z == '' ){
	req.checkBody('link','You have to add at least one project (link or screenshot)').notEmpty();
}

var errors = req.validationErrors();

	if(errors){
		res.render('addproject',{
			errors:errors
		});
	}else{
	var newPortofolio = new Portofolio({
		    username:req.user.username,
		    name:x,
		    foto:y,
			links:[link],
			screenshots:[z],
			email: req.user.email

		});	
	if(link!=''&& z!= ''){
	req.user.projects +=2;
	req.user.save();
}
else{
	req.user.projects +=1;
	req.user.save();
}
	req.user.links = [link];
	req.user.screenshots = [z];
    req.user.save();	 
	y = '' ;
	
		Portofolio.createPortofolio(newPortofolio, function(err, portofolio){
			if(err) throw err;
			console.log(portofolio);
		

		req.flash('success_msg', 'You made your portofolio successfully');
		
        z= '' ;
		res.redirect('/users/profile');
	}); }

});
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
  	req.flash('success_msg', 'You are logged in');
  	if(req.user.projects==0)
   res.redirect('/');
else
	res.redirect('/users/profile')
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});


module.exports = router;