const pool = require("../config/db"); // Ensure this points to your database connection
const bcrypt = require("bcrypt");

async function Admins() {
    const adminUsers = [
        { username: "admin1", email: "admin1@example.com", password: "Admin@123" },
        { username: "admin2", email: "admin2@example.com", password: "Admin@456" },
    ];

    try {
        for (let admin of adminUsers) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await pool.query(
                `INSERT INTO users (username, email, password, role, verified) 
                 VALUES ($1, $2, $3, 'admin', true) 
                 ON CONFLICT (email) DO NOTHING`, // Avoid duplicate insertion
                [admin.username, admin.email, hashedPassword]
            );
        }
        console.log("Admin users inserted successfully!");
    } catch (error) {
        console.error("Error inserting admin users:", error);
    } finally {
        pool.end();
    }
}

Admins();
