const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require('express-validator');
const {checkResultsMiddleware} = require("./checkResultsMiddleware");





module.exports.validateRegister = [
    check('username').notEmpty().withMessage('Username is required').isLength({min:4}).withMessage('Username should be at least 4 characters long'),
    check('email').isEmail().trim().withMessage('Email is required'),
    check('password').trim().notEmpty().withMessage('password is required').isLength({min:6}).withMessage('Password must be at least 6 characters long'),
    check('confirmPassword').trim().custom((value,{req})=>{ 
         if (value !== req.body.password) {
            throw new Error('Password and confirm password must match');
        }
        return true; 
    
    }),
    checkResultsMiddleware
    
]

module.exports.validateLogin = [
    check('email').isEmail().trim().withMessage('Email is required'),
    check('password').trim().notEmpty().withMessage('password is required').isLength({min:6}).withMessage('Password must be at least 6 characters long'),
    checkResultsMiddleware
    
]

