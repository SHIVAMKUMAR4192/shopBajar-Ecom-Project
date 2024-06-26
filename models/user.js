const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
        maxLength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
        maxLength: [100, 'Email cannot exceed 100 characters']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
    },
    avatar: {
        public_id:{
            type:String,
            required:true
        },
        url: {
            type:String,
            required: true 
    
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

//Encrypting password before saving user
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
       return next()
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
});

//compare user password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

//Return JWT Token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_TIME 
    });
}


//Generate password reset token
userSchema.methods.generateResetPasswordToken = function(){
    //genertoken
    const resetPasswordToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetPasswordToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 3600000;

    return resetPasswordToken;
}
module.exports = mongoose.model('User', userSchema);
