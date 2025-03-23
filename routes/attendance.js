const express = require('express'); // Import express
const router = express.Router(); // Create a router

router.get('/', (req, res) => {
  res.render('attendance'); // Render the attendance view
});

module.exports = router; // Export the router