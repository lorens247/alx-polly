import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data storage (in-memory for simplicity)
const itemsDatabase = new Map();
let nextId = 1;

// Initialize with some sample data
itemsDatabase.set(1, { id: 1, name: 'Laptop', description: 'High-performance laptop for development' });
itemsDatabase.set(2, { id: 2, name: 'Mouse', description: 'Wireless ergonomic mouse' });
nextId = 3;

// Utility function to get all items as array
const getAllItems = () => Array.from(itemsDatabase.values());

// GET /items endpoint
app.get('/items', (req, res) => {
  try {
    const items = getAllItems();
    
    res.status(200).json({
      message: 'Items retrieved successfully',
      data: items,
      total: items.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving items:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Failed to retrieve items'
    });
  }
});

// POST /items endpoint
app.post('/items', (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        message: 'Validation failed',
        error: 'Item name is required and must be a non-empty string'
      });
    }
    
    // Create new item
    const newItem = {
      id: nextId++,
      name: name.trim(),
      description: description ? description.trim() : '',
      createdAt: new Date().toISOString()
    };
    
    // Store item
    itemsDatabase.set(newItem.id, newItem);
    
    res.status(201).json({
      message: 'Item created successfully',
      data: newItem,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Failed to create item'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /items',
      'POST /items',
      'GET /health'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: 'Something went wrong on the server'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('🚀 Simple REST API Server Started!');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log(`   GET  /items  - Retrieve all items`);
  console.log(`   POST /items  - Create a new item`);
  console.log(`   GET  /health - Server health check`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

export default app;
