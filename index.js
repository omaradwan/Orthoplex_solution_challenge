const exp = require("constants");
const express = require("express");  


const authRoute = require("./routes/authRoute.js")
const userRoute = require("./routes/userRoute.js")


require('dotenv').config();  


const app = express();
app.use(express.json());

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



app.listen(8000,()=>{
    console.log("server is running on port 8000");
})