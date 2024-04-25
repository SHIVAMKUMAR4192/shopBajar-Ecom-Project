//create and send token and save in the cookie

const sendToken = (user,statuscode,res) =>{
    //create jwt token
    const token = user.getJWTToken();

    const options ={
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    res.status(statuscode).cookie('token', token,options).json({
        success: true,
        token,
        user
    })
}
module.exports = sendToken