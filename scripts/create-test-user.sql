-- Delete existing test user if exists
DELETE FROM users WHERE email = 'customer@example.com';

-- Insert test user with properly hashed password (password: customer123)
INSERT INTO users (email, password_hash, role, is_verified) 
VALUES (
  'customer@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- This is the hash for 'customer123'
  'customer',
  TRUE
);

-- Create account for test user if it doesn't exist
INSERT INTO accounts (user_id, balance, account_number)
SELECT u.id, 1000.50000000, 'ACC' || LPAD(u.id::text, 10, '0')
FROM users u
WHERE u.email = 'customer@example.com'
AND NOT EXISTS (SELECT 1 FROM accounts WHERE user_id = u.id); 