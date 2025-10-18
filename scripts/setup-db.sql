-- Create database for Communication Broker Tool
CREATE DATABASE communication_broker;

-- Create user (optional, you can use existing postgres user)
-- CREATE USER communication_user WITH PASSWORD 'your_password';
-- GRANT ALL PRIVILEGES ON DATABASE communication_broker TO communication_user;

-- Connect to the database
\c communication_broker;

-- The Prisma schema will handle table creation
-- This script just sets up the database
