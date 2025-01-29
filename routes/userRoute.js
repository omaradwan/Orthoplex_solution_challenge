const express=require('express')
const route = express.Router();
const userController = require('../controllers/userController')
const { verifyToken } = require('../middlewares/userMiddleware')
const {verifyAdmin}=require('../middlewares/userMiddleware')



route.get('/topThree', verifyToken, verifyAdmin, userController.getTopThreeUsersByLoginFreq)
route.get('/inactive',verifyToken,verifyAdmin,userController.getInactiveUsers)
route.get('/:id', verifyToken, userController.getUser)
route.patch('/:id', verifyToken, userController.updateUser)
route.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser)
route.get('/', verifyToken, verifyAdmin, userController.getAllUsers)




module.exports=route

