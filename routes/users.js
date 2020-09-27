const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')

//user model
const User = require('../models/Users');

//login
router.get('/login', (req,res) =>
   res.render('login'));

//register
router.get('/register', (req,res) =>
   res.render('register'));   

//register
router.post('/register', (req,res) =>{
    const { name, email, password, password2 } = req.body;
    let errors = [];

//check required fields
if(!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all the fields'});  
}
//check password match
if(password !== password2) {
    errors.push({ msg: 'Password do not match'});  
};

//check password length
if(password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters'});   
}

if(errors.length > 0){
    res.render('register', {
        errors,
        name,
        email,
        password,
        password2
    });

} else{
User.findOne({ email: email})
    .then(user =>{
        if(user){
            //user exist 
            errors.push({ msg: 'Email is already registered'})
            res.render('register', {
                errors,
                name,
                email,
                password,
                password2
            });
        } else{
            const newUser = new User({
                name: name,
                email: email,
                password: password
            });
            //Hash password
            bcrypt.genSalt(10, (err, salt) =>
             bcrypt.hash(newUser.password, salt, (err, hash) =>{
                if(err) throw err;
                //set password to hashed
                newUser.password = hash;
                //save user
                newUser.save()
                    .then(user => {
                        req.flash('success_msg', 'You are now registered and can login')
                        res.redirect('/users/login')
                    })
                    .catch(err => console.log(err));
            }))
        }
    });    
}
    
});  
//login handle
router.post('/login', (req,res,next)=>{
  passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect:'/users/login',
      failureFlash: true
  })  (req,res, next);
});
//logout handle
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;