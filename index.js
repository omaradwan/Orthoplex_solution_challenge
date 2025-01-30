const exp = require("constants");
const express = require("express");  
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests pre 15 min
});


const authRoute = require("./routes/authRoute.js")
const userRoute = require("./routes/userRoute.js")





const app = express();
app.use(cors());  
app.use(compression())
app.use(express.json());
app.use(limiter); 

app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)

app.use((err, req, res, next) => {
    // If the error was thrown by me
    if (err.isOperational==true) {
        return res.status(err.status).json({
            success: false,
            message: err.message,
            details: err.details || null,
        });
    }
    // For unexpected errors
    console.error(err);  
    return res.status(500).json({
        success: false,
        message: 'Something went wrong! Please try again later.',
    });
});


let port=process.env.PORT || 3030
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})