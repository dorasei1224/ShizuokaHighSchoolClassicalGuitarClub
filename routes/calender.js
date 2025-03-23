const express = require('express'); // Import express
const router = express.Router(); // Create a router

router.get('/', (req, res) => {
  res.render('calender'); // Render the calender view
});

module.exports = router; // Export the router