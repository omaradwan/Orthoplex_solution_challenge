const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const asyncHandler=require('express-async-handler')

module.exports.generateCode = () => {
    return crypto.randomBytes(4).toString('hex'); // 4 bytes = 8 hex digits
};

module.exports.sendConfirmationEmail = asyncHandler(async (email, content) => {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        },
    });

    // Send confirmation email
    const mailOptions = {
        from: process.env.APP_PASSWORD,
        to: email,
        subject: "Confirm your email",
        text: `Please confirm your email by this code ${content} and it will expire in 1 hour`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        }
        else {
            console.log('Email sent:', info.response);
        }
    });
    
});

module.exports.generateToken=asyncHandler(async (obj)=>{
    const token=await jwt.sign({id:obj.id,role:obj.role},process.env.JWT_SECRET,{expiresIn:'1d'})
    return token
})




