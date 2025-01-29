    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(200),
        email VARCHAR(200) UNIQUE,
        password VARCHAR(200),
        no_of_logins INTEGER DEFAULT 0,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role  VARCHAR(200) DEFAULT 'user',
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    -- need indexing on those 3 as the query that get all of them so better to make index for each of them and postgres will do bitmap indexing by ANDING to get the users
       CREATE INDEX idx_userEmail ON users (email);
       CREATE INDEX idx_userUsername ON users (username);
       CREATE INDEX idx_userRole ON users (role);

    CREATE TABLE IF NOT EXISTS verifyUser (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(200) NOT NULL,
        code VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, code)
    );

    -- Create indexes as i will search by email so instead of sequental scan it can search by b+tree so query it faster 
    CREATE INDEX idx_verifyUser_email_code ON verifyUser (email);
 

    


DO $$ BEGIN
IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    RAISE NOTICE 'User table created successfully';
ELSE
    RAISE NOTICE 'User table creation failed';
END IF;
END $$;


DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'verifyUser') THEN
        RAISE NOTICE 'verifyUser table created successfully';
    ELSE
        RAISE NOTICE 'verifyUser table creation failed';
    END IF;
END $$;
