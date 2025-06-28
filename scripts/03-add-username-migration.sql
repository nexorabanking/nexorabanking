-- Migration script to add username column to existing users table
-- Run this if you have an existing database without the username column

-- Add username column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(50);
        
        -- Update existing users with default usernames based on email
        UPDATE users 
        SET username = COALESCE(
            LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')),
            'user' || id
        )
        WHERE username IS NULL;
        
        -- Make username NOT NULL and UNIQUE after populating
        ALTER TABLE users ALTER COLUMN username SET NOT NULL;
        ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
        
        -- Create index for username
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    END IF;
END $$; 