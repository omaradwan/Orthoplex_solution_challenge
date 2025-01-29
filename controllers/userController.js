const asyncHandler=require('express-async-handler')
const pool = require('../config/db');
const helper=require('../util/helpers');
const { error } = require('console');
const { use } = require('../routes/authRoute');
const { Verify } = require('crypto');


module.exports.getUser = asyncHandler(async (req, res, next) => {
    
    const { id } = req.params
      
    if (!id) {
        let error=new Error('id not found')
        error.status=404
        return next(error)
    }
    
    let user = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    user = user.rows[0];
    if(!user){
        return res.status(404).json({message:'No user found with this id'})
    }   
    // console.log(user)
    return res.status(200).json({user})
})

module.exports.updateUser = asyncHandler(async (req, res, next) => {
    let error = new Error()
    const { username, email }=req.body
    const { id } = req.params;
    if (!id) {
        error.message = "id not found"
        error.status = 404
        error.isOperational=true
        return next(error)
    }   
  
    if (id != req.payload.id) {
        error.message="user dont have the right privilages for this request"
        error.status = 401;
        error.isOperational = true
        return next(error)
    }
    if (!username && !email ) {
        error.message="No data found to update";
        error.status=400;
        error.isOperational=true
        return new Error(error)
    }
    let counter = 1;
    let updateQuery = `UPDATE users SET updated_at=CURRENT_TIMESTAMP,`;
    let values=[]
    if (username) {
        updateQuery+=`username=$${counter++},`
        values.push(username)
    }
    if(email){
        updateQuery+=`email=$${counter++},`
        values.push(email)
    }
    // to remove the last comma of the update query
    updateQuery=updateQuery.slice(0, -1)
    updateQuery+=` WHERE id=$${counter++} RETURNING *;`
    values.push(id)
    try {
        let updatedUser = await pool.query(updateQuery, values);
        updatedUser = updatedUser.rows[0];
        // dont need this condition i think cuz we are sure the user is in database
        if(updatedUser.length==0){
             return next(new Error({message:"No user found with this id",status:404,isOperational:true}))
        }
    } catch (err) {
        let error = new Error("Error during updating user");
            error.status = 500;
            error.isOperational = true; 
            return next(error);
    }

    return res.status(200).json({message:"user updated successfully",user:updatedUser})
    
})


module.exports.deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {
        let user = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [id]);
        user = user.rows[0];
        if(!user){
            let error = new Error("user not found or already deleted");
            error.status = 404;
            error.isOperational = true; 
            return next(error);
        }
        return res.status(200).json({ message: "user deleted successfully"})
    } catch (err) {
        let error = new Error("Error during deleting user");
            error.status = 500;
            error.isOperational = true; 
            return next(error);
    }
})


module.exports.getAllUsers = asyncHandler(async (req, res, next) => {
    let { username, email, verified, requestedPage, userPerPage,startDate, endDate } = req.query;
    
    requestedPage=parseInt(requestedPage||1)
    userPerPage=parseInt(userPerPage||10)
    let query=`SELECT * FROM users WHERE `;
    let counter = 1;
    let values = [];
    if (username) {
        if (counter > 1) query += ` and username=$${counter++}`
        else query += `username=$${counter++}`
        values.push(username);
    }
    if (email) {
        if(counter>1) query += ` and email=$${counter++}`
        else query += `email=$${counter++}`
        values.push(email);
    }
    if (verified) {
        if (counter > 1) query += ` and verified=$${counter++}`
        else query += `verified=$${counter++}`
        values.push(verified);
    }

    // Add date range filtering if provided
    if (startDate && endDate) {
        query += counter > 1 ? ` AND created_at BETWEEN $${counter++} AND $${counter++} ` : 
                            `created_at BETWEEN $${counter++} AND $${counter++} `;
        values.push(startDate, endDate);
    }
    
    //limit userPerPage offset OFFSET
    //OFFSET=(Page-1)*userPerpPage
    //Pagination
    if (requestedPage && userPerPage) {
        query += ` LIMIT $${counter++} OFFSET $${counter++}`
        values.push(userPerPage)
        values.push((requestedPage-1)*userPerPage)
    }
    
    
    console.log(query)
    let registeredUsersQuery = `SELECT COUNT(*) FROM users`
    let verifiedUsersQuery = `SELECT COUNT(*) FROM users WHERE verified=true`
    let Users, totalNoOfRegistedUsers, totalNoOfVerifiedUsers

    try {
            // will make the three queries run async together and wait for all to finish which give less latency
            [Users, totalNoOfRegistedUsers, totalNoOfVerifiedUsers] = await Promise.all([
            pool.query(query, values),
            pool.query(registeredUsersQuery),
            pool.query(verifiedUsersQuery)
            ])
        
        Users = Users.rows;
        totalNoOfRegistedUsers = totalNoOfRegistedUsers.rows[0].count;
        totalNoOfVerifiedUsers = totalNoOfVerifiedUsers.rows[0].count

    } catch (err) {
        let error = new Error("Error during fetching or counting users");
            error.status = 500;
            error.isOperational = true;
            return next(error);
    }
 
    return res.status(200).json({
        "Users based on filters": Users,
        "Number of registered users": totalNoOfRegistedUsers,
        "Number of verified users": totalNoOfVerifiedUsers,
        
    })
    
})

module.exports.getTopThreeUsersByLoginFreq = asyncHandler(async (req, res, next) => {
    try {
       
        let query = `SELECT * FROM users ORDER BY no_of_logins DESC LIMIT 3`
        query = await pool.query(query)
        if (query.length == 0) {
            let error = new Error("There are no users");
            error.status = 202;
            error.isOperational = true;
            return next(error);
        }
        let topUsers = await query.rows
        console.log(topUsers)
        return res.status(200).json({
            "message":"Top three users",
            "users": topUsers })
    } catch (err) {
        let error = new Error("Error during fetching top users");
            error.status = 500;
        error.isOperational = true;
        return next(error);
    }
})

module.exports.getInactiveUsers = asyncHandler(async (req, res, next) => {
    //NOW get the current time so when subtract it by 1h/1month we can compare it with last login
    try {
        //for pagination
        let pagination, counter = 1,values=[];
        let { requestedPage, userPerPage } = req.query;
        requestedPage=parseInt(requestedPage||1)
        userPerPage = parseInt(userPerPage || 10)

        if (requestedPage && userPerPage) {
            pagination = ` LIMIT $${counter++} OFFSET $${counter++}`
            values.push(userPerPage)
            values.push((requestedPage-1)*userPerPage)
        }
    

        // for hour or month
        let { time } = req.body
        let query 

    
        if (time == "hour") {
            query = `SELECT * FROM users WHERE last_login <= NOW() - INTERVAL '1 hour'`+pagination
        }
        else if (time == "month") {
            query = `SELECT * FROM users WHERE last_login <= NOW() - INTERVAL '1 month'`+pagination
        }
        else {
            let error = new Error("User should select either hour or month");
            error.status = 202;
            error.isOperational = true;
            return next(error);
        }

        // console.log(values)
        query = await pool.query(query,values)
        if (query.length == 0) {
            let error = new Error("There are no inactive users");
            error.status = 202;
            error.isOperational = true;
            return next(error);
        }


        let inactiveUsers = query.rows;
        return res.status(200).json({message:`All inactive user for the past 1 ${time} and more starting from page ${requestedPage}`,inActiveUser:inactiveUsers})
    } catch (err) {
        throw err;
    }

    
})
