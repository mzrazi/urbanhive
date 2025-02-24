// Example: userRoutes.js
const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  res.send('User route');
});

// Export the router
module.exports = router;

