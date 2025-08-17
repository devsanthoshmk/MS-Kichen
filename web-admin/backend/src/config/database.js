import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, '../../database/orders.db');

// Initialize database
export async function initializeDatabase() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      available BOOLEAN DEFAULT 1,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      order_items TEXT NOT NULL, -- JSON string
      address TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      total_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert default category if not exists
    INSERT OR IGNORE INTO categories (name, description) VALUES ('tiffen', 'Traditional South Indian breakfast items');
    INSERT OR IGNORE INTO categories (name, description) VALUES ('side-dish', 'Accompaniments and side dishes');
    INSERT OR IGNORE INTO categories (name, description) VALUES ('beverages', 'Drinks and beverages');
  `);

  console.log('✅ Database initialized successfully');
  return db;
}

// Database query functions
export async function getAllRows(query, params = []) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  return await db.all(query, params);
}

export async function getRow(query, params = []) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  return await db.get(query, params);
}

export async function runQuery(query, params = []) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  return await db.run(query, params);
}