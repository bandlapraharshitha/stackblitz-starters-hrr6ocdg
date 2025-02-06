const express = require('express');
const mongoose = require('mongoose');
const { resolve } = require('path');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3010; // Use environment port or 3010

app.use(express.static('static'));
app.use(express.json()); // Enable parsing JSON request bodies

// MongoDB Atlas Connection
const uri = process.env.MONGODB_CONNECTION_STRING; // Get connection string from .env
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));


// Define MenuItem schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});


// --- Update Menu Item ---
app.put('/menu/:id', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const itemId = req.params.id;

    // Basic validation (can be improved)
    if (!name && !description && !price) {
      return res.status(400).json({ error: 'At least one field (name, description, or price) must be provided for update.' });
    }


    const updatedItem = await MenuItem.findByIdAndUpdate(
      itemId,
      { name, description, price }, // Only update provided fields
      { new: true, runValidators: true } // Return the updated document and validate
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(updatedItem);

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// --- Delete Menu Item ---
app.delete('/menu/:id', async (req, res) => {
  try {
    const itemId = req.params.id;

    const deletedItem = await MenuItem.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});