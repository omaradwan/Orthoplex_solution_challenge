const express=require('express')
const route = express.Router();
const authController = require('../controllers/authController')
const { validateRegister } = require('../middlewares/authMiddleware')
const {validateLogin} = require('../middlewares/authMiddleware')


route.post('/register', validateRegister, authController.register)
route.post('/login', validateLogin, authController.login)
route.post('/verify',authController.verify)





module.exports=route;