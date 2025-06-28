-- Insert admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, is_verified) 
VALUES ('admin', 'admin@cryptobank.com', '$2a$10$rOzJqQZQXQXQXQXQXQXQXu', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample customer (password: customer123)
INSERT INTO users (username, email, password_hash, role, is_verified) 
VALUES ('customer', 'customer@example.com', '$2a$10$rOzJqQZQXQXQXQXQXQXQXu', 'customer', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create accounts for users
INSERT INTO accounts (user_id, balance, account_number)
SELECT u.id, 1000.50000000, 'ACC' || LPAD(u.id::text, 10, '0')
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE user_id = u.id);
