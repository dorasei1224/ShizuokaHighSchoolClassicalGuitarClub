const express = require('express'); // Import express
const router = express.Router(); // Create a router

router.get('/', (req, res) => {
  res.render('logout'); // Render the logout view
});

module.exports = router; // Export the router