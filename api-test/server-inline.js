import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for items
let items = [
  { id: 1, name: 'Sample Item 1', description: 'This is a sample item' },
  { id: 2, name: 'Sample Item 2', description: 'Another sample item' }
];

// GET /items - Retrieve all items
app.get('/items', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve items'
    });
  }
});

// POST /items - Create a new item
app.post('/items', (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }
    
    const newItem = {
      id: items.length + 1,
      name,
      description: description || ''
    };
    
    items.push(newItem);
    
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create item'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GET /items - available at http://localhost:${PORT}/items`);
  console.log(`POST /items - available at http://localhost:${PORT}/items`);
});

export default app;
