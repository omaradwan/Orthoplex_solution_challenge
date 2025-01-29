const asynchandler=require('express-async-handler')
const jwt=require('jsonwebtoken')

module.exports.verifyToken = asynchandler(async (req, res, next) => {
    let checkHeader = req.headers["Authorization"] || req.headers["authorization"];
    
    if (!checkHeader || checkHeader.split(' ')[0] !== 'Bearer') {
        let error = new Error('Bearer is missing');  
        error.status = 401;
        error.isOperational=true
        return next(error);
    }

    try {
        const token = checkHeader.split(' ')[1];
        
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        req.payload = payload;
        return next();
    } catch (err) {
        let error = new Error('Token is invalid'); 
        error.status = 401;
        error.details = err;
        error.isOperational=true
        return next(error);  // Use next() to pass the error to the next middleware
    }
});

module.exports.verifyAdmin = asynchandler(async (req, res, next) => {
    let role = req.payload.role;
    if (role !== "admin") {
        let error = new Error("Unauthorized request, Only admins can delete users");
        error.status = 401;
        error.isOperational = true;
        return next(error);
    }
    next()
})
