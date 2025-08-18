-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL CHECK (char_length(name) >= 20 AND char_length(name) <= 60),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(400),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'owner', 'user'))
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  address VARCHAR(400),
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avg_rating DECIMAL(2,1) DEFAULT 0
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating_value INT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5)
);
