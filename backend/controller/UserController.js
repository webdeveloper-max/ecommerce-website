const User = require("../models/UserModel");
const ErrorHandler = require("../utils/ErrorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken.js");
const cloudinary = require("cloudinary");

// Register user
exports.createUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
    });

    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
    });
    
    sendToken(user, 201, res);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// // Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
   const { email, password } = req.body;

  if (!email || !password) {
     return next(new ErrorHandler("Please enter the email & password", 400));
  }

   const user = await User.findOne({ email }).select("+password");

   if (!user) {
     return next(
       new ErrorHandler("User is not found with this email & password", 401)
     );
  }
  const isPasswordMatched = await user.comparePassword(password);

   if (!isPasswordMatched) {
    return next(
      new ErrorHandler("User is not find with this email & password", 401)
    );
  }

   sendToken(user, 201,res)
 });

 //  Log out user
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {    
    expires: new Date(Date.now()),
    httpOnly: true,
  });

   res.status(200).json({
     success: true,
     message: "Log out success",
   });
 });

// //  Get user Details
exports.userDetails = catchAsyncErrors(async (req, res, next) => {
   const user = await User.findById(req.user.id);

   res.status(200).json({
     success: true,
     user,
   });
 });



 // Get All users ---Admin
 exports.getAllUsers = catchAsyncErrors(async (req,res,next) =>{
     const users = await User.find();

     res.status(200).json({
         success: true,
         users,
     });
 });

 // Get Single User Details ---Admin
 exports.getSingleUser = catchAsyncErrors(async (req,res,next) =>{
     const user = await User.findById(req.params.id);
   
     if(!user){
         return next(new ErrorHandler("User is not found with this id",400));
     }

     res.status(200).json({
         success: true,
         user,
     });
 });



// // Delete User ---Admin
 exports.deleteUser = catchAsyncErrors(async(req,res,next) =>{
  
    const user = await User.findById(req.params.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

     if(!user){
         return next(new ErrorHandler("User is not found with this id",400));
     }

     await user.remove();

     res.status(200).json({
         success: true,
         message:"User deleted successfully"
    })
 });