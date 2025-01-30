const asyncHandler=require('express-async-handler')
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const helper=require('../util/helpers')



module.exports.register = asyncHandler(async (req, res,next) => {

    const { username, email, password } = req.body
    
    //check duplicates emails from the backend side
    let user = `
      SELECT * FROM users WHERE email = $1;
    `
    let foundUser = await pool.query(user,[email]);
    foundUser = foundUser.rows[0]
    
    if (foundUser!==undefined) {
        return res.status(400).json({
            message: 'User already exists with this email'
        })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    let newUser = `
     INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING *;
    `
    let userData = (await pool.query(newUser, [username, email, hashedPassword]));
    userData = userData.rows[0];
    
    const code = helper.generateCode();

    let newCode = `
    INSERT INTO verifyUser (user_id,email, code)
            VALUES ($1, $2,$3)
            RETURNING *;
    `
   
    let codeData = await pool.query(newCode, [userData.id, email, code]);
     
    codeData = codeData.rows[0];


    await helper.sendConfirmationEmail(email, code);

    return res.status(201).json({
        message: 'User created successfully',
        user: userData
    })
    
})

module.exports.login = asyncHandler(async (req, res,next) => {
    const { email, password } = req.body

    let user = `
      SELECT * FROM users WHERE email = $1;
    `
    let foundUser = await pool.query(user,[email]);
    foundUser = foundUser.rows[0]
    if (!foundUser) {
        let error = new Error();
        error.status = 400;
        error.message = "User does not exist with this email"
        error.isOperational=true
        return next(error);

    }
    if(foundUser.verified === false){
        let error = new Error();
        error.status = 400;
        error.message = "User is not verified"
        error.isOperational=true
        return next(error);
    }

    const isMatch = await bcrypt.compare(password, foundUser.password)
    if (!isMatch) {
        let error = new Error();
        error.status = 400;
        error.message = "Invalid password"
        error.isOperational=true
        return next(error);
    }

    const payload={id:foundUser.id,role:foundUser.role}
    const token = await helper.generateToken(payload);

    console.log(foundUser)
    let updatedUser=await updateUserData(foundUser)
   
    
    
    return res.status(200).json({
        message: 'User logged in successfully',
        user: updatedUser,
        token:token
    })

})


// when user is verified then increase the counter and update last date
const updateUserData = async(user) => {
    let updateUser = `
        UPDATE users
        SET last_login = CURRENT_TIMESTAMP,
            no_of_logins = no_of_logins + 1
        WHERE id = $1
        RETURNING *;
    `;
    let updatedUser = await pool.query(updateUser, [user.id]);
    console.log(updatedUser.rows[0]);
}


module.exports.verify = asyncHandler(async (req, res,next) => {
    const { email, code } = req.body

    let user = `
      SELECT user_id FROM verifyUser WHERE email = $1 AND code = $2;
    `
    let foundUser = await pool.query(user, [email, code]);
    foundUser = foundUser.rows[0]

    // in case the code was wrong
    if (foundUser == undefined) {
        let error = new Error();
        error.status = 400;
        error.message = "Invalid code"
        error.isOperational=true
        return next(error);
    }
  

    // 3600000=1h
    // check for expiry of the code
    let currentTime = new Date();
    if (currentTime - foundUser.created_at > 3600000) {
        let error = new Error();
        error.status = 400;
        error.message = "code is expired"
        error.isOperational = true
        // in both cases you will need to delete the row
        deletedUser = deleteCode();
        return next(error);
    }
    // now i want to let the verified bool be true 
    let updatedUser = `
        UPDATE users
        SET verified = true
        WHERE email = $1;
    `
    let userData = await pool.query(updatedUser, [email]);
    userData = userData.rows[0];
   
    deletedUser = deleteCode()

    return res.status(200).json({
        message: 'User verified successfully',
        user: userData
    })
})

const deleteCode = async (req, res, next) => {
    try {
        let deleteUser = `
        DELETE FROM verifyUser
        WHERE email = $1;
    `
        let deletedUser = await pool.query(deleteUser, [email]);
        deletedUser = deletedUser.rows[0];
        return deletedUser
    } catch (err) {
        throw err;
    }
   
}



