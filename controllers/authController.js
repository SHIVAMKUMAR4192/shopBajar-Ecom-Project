
const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require ('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors( async (req,res,next) => {

    const { name,email,password } = req.body;

    const defaultAvatar = {
        public_id: 'default_avatar', 
        url: 'https://example.com/default_avatar.jpg', 
    };

    const user = await User.create({
        name,
        email,
        password,
        avatar:defaultAvatar, 
    })

    const token = user.getJWTToken();

    res.status(201).json({
        success: true,
        token
    })
    sendToken(user,200,res);
})

exports.loginUser = catchAsyncErrors( async (req, res, next) => {
     const { email, password } = req.body;

     //checks if email nd password is entered by user
     if(!email || !password){
        return next(new ErrorHandler('Please enter email & password',400))
     }

     //finding user in database
     const user = await User.findOne({email}).select('+password')

     if(!user){
        return next (new ErrorHandler('Invalid Email or Password', 401));
     }
     //checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next (new ErrorHandler('Invalid Email or Password', 401));

    }

    sendToken(user,200,res);

     
});

//forgot password = /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors( async(req,res,next) =>{
  
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next (new ErrorHandler('Invalid Email or Password', 404));
    }

    const resetPasswordToken = user.generateResetPasswordToken();

   await user.save({ validateBeforeSave: false });

   //create reset password url
   const resetUrl = `${req.protocol} ://${req.get('host')}/api/v1/password/reset/${resetPasswordToken}`;

   const message = ` your password reste token is as follow:\n\n${resetUrl}\n\n If you have not requested this email, thn igone it.`

   try{
    await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        message
    })

    res.status(200).json({
        success: true,
        message: 'An email has been sent to your email'
    })
   }catch(error){
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false});

    return next(new ErrorHandler(error.message,500));
   }

  })

  //Reset password = /api/v1/password/reset/:token
  exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Extract reset token from request
    const resetToken = req.params.token;

    // Hash the reset token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find user by reset token
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() } // Check if reset token is not expired
    });

    if (!user) {
        return next(new ErrorHandler('Invalid or expired reset token', 400));
    }

    if(req.body.resetPassword !== req.body.confirmPassword){
        return next(new ErrorHandler('Passwords do not match', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Encrypt the new password
    await user.save();

    // Send response
   sendToken(user,200,res)
});


//Get Currently logged user details = /api/v1/me
exports.getUserProfile = catchAsyncErrors( async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    })
})


// Update Password = /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password entered is correct
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect', 400));
    }

    // Set new password
    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

//update user profile = /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req,res,next) =>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }

    //update avatar: TODO

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
        user
    })
})

//Logout user = /api/v1/logout
exports.logout = catchAsyncErrors ( async(req,res,next) =>{
    res.cookie('token', null, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: 'Successfully logged out'
    })

})

//Admin Routes

//Get all users = /api/v1/admin/users
exports.allUsers = catchAsyncErrors ( async(req,res,next) =>{
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
});

//Get user details = /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req,res,next) =>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next (new ErrorHandler(`user does not found with id: ${req.params.id}`))
    }
     res.status(200).json({
        success: true,
        user
    })
})

//update user profile = /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req,res,next) =>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }

    //update avatar: TODO

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
        
    })
})


//Delete user  = /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    try {
        // Remove user from the database
        await User.deleteOne({ _id: user._id });
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error); // Log the specific error
        return next(new ErrorHandler('Error deleting user', 500));
    }
});
