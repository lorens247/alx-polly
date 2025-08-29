import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for items
let items = [
  { id: 1, name: 'Item 1', description: 'This is a sample item 1' },
  { id: 2, name: 'Item 2', description: 'This is a sample item 2' },
  { id: 3, name: 'Item 3', description: 'This is a sample item 3' },
  { id: 4, name: 'Item 4', description: 'This is a sample item 4' },
  { id: 5, name: 'Item 5', description: 'This is a sample item 5' },
  { id: 6, name: 'Item 6', description: 'This is a sample item 6' },
  { id: 7, name: 'Item 7', description: 'This is a sample item 7' },
  { id: 8, name: 'Item 8', description: 'This is a sample item 8' },
  { id: 9, name: 'Item 9', description: 'This is a sample item 9' },
  { id: 10, name: 'Item 10', description: 'This is a sample item 10' }
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
