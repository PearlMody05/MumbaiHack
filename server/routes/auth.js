const express = require('express')
const {body,validationResult} = require('express-validator')
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mailtransport = nodemailer.createTransport({
    service:"gmail",
    auth:{
user :"nodemailing05@gmail.com",
pass: process.env.Pass,
    },
})


const jwt = require('jsonwebtoken');
require('dotenv').config();



//signup
router.post('/signup',[
    body("name","Enter valid name").isLength({min:3}),
    body("email","Enter valid email").isEmail(),
    body("password","password must be 8 charecters long").isLength({min:8}),
],
async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()) return res.status(400).json({error});
    //now we hv got correct info in server we need to check if present if not 
    let user = await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).send("This email already exists");
    }
    //not present therefore save it to database 
    let secPass = await bcrypt.hash(req.body.password,10); //encripting password
    //saving it
    user =await User.create({
        name : req.body.name,
        email:req.body.email,
        password:secPass,
        isVerified:false,
    })
    return res.status(200).send("saved to db");
    //data saved 
    
}
);


//otp genrate
const generateOTP = () => new Promise((res,rej) =>
    crypto.randomBytes(3, (err, buffer) => {
        if(err) return rej(err);
        res(
            parseInt(buffer.toString("hex"), 16)
                .toString()
                .substring(0, 6)
        );
    })
);

//end point for otp sending
router.post('/sendOtp',async (req,res)=>{
    try{
    const email = req.body.email;
    let user = await User.findOne({email});
    if(!user) return res.status(404).send("There was some problem cant get the email you entered...");
    let otp = await generateOTP();
    if(otp){
        //now this otp will be sent in the mail
        details = {
            from: "nodemailing05@gmail.com",
            to: req.body.email,
            subject: "Welcome to Tasker!",
            html: `
              <p><h3>Hi ${user.name},</h3></p>
              <p>Thanks for signing up on <strong>Tasker!</strong> We're excited to help you streamline your inventory management and give you great insights!.</p>
              <p>Your otp is ${otp}. Please do not share it with anyone!</p>
              <p>To get started, explore our features and create your first project. If you need assistance, you can <a href="mailto:nodemailing05@gmail.com">send an email</a> to nodemailing05@gmail.com.</p>
              <p>Regards,<br>Pearl Mody</p>
            `,
          };
        await mailtransport.sendMail(details,(err)=>{
            if(err) {
                console.log("Some problem occured while sending mail\n",err);
                return res.status(500).send("Failed to send email. Please try again later.");}
            else console.log("mail sent");
        });
        
        const expiretime = 15*60*1000;
        //since in the mail we got otp  we need to store it in otp database
        let userotp = await Otp.create({
            userId : user.id,
            code: otp,
            expiry: new Date(Date.now() + expiretime),
        });
        //otp is sent and stored 
        if (otp) {
            return res.status(200).send("OTP sent successfully!");
        }


    }
}catch(err){
    console.log("Some error occured: ",err);
    return res.status(500).send("Some error is processing request!");
}
});




//now verifying the otp 
router.post('/verifyOtp/:id',async (req,res)=>{
    //now i hv to check otp generated is correct or not
    try{
    const enteredOtp = req.body.code;
    let userid = req.params.id;
    let user = await User.findById(userid);
    if (!user) {
        return res.status(404).send("User not found");
    }
    //finding otp of user
    let otp = await Otp.findOne({userId:userid});
    if(!otp)  return res.status(404).json({message : "Otp Not Found"});
    //now we have user ka otp and ours
    if(otp.expiry<Date.now())    return res.status(400).json({message:"Otp has been expired"});
    if(otp.code=== enteredOtp) {
        user.isVerified=true;
        await user.save();
        let data = {
            user:{
                id : user.id
            }
        }
        let success = false;
        const secret = process.env.JWT_SECRET;
        const authToken = jwt.sign(data,secret);
        if(authToken) {
            success=true;
           return res.status(200).json({success,authToken});
        }
        else return res.status(500).json({success,message:"something went wrong"});
    }}
    catch(err){
        return res.status(500).send("Something went wrong!");
    }

});

//login 
router.post('/login', [
    body("email", "Enter a valid email").isEmail(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  ], async (req, res) => {
    let success = false;
  
    // Check if there are validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
  
    const { email, password } = req.body;
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success, error: "Please login with correct credentials" });
      }
  
      // Check if the password matches
      const passCompare = await bcrypt.compare(password, user.password);
      if (!passCompare) {
        return res.status(400).json({ success, error: "Please login with correct credentials" });
      }
  
      // Check if the user is verified
      if (!user.isVerified) {
        return res.status(403).json({ success, error: "Your account is not verified. Please verify your email." });
      }
  
      // Generate JWT token
      const data = {
        user: {
          id: user.id
        }
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);
  
      // Send success response
      success = true;
      return res.json({ success, authToken });
  
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  

module.exports = router;