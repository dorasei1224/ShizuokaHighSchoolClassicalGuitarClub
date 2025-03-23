const express = require('express'); // Import express
const app = express(); // Create an Express app
const port = process.env.PORT || 3000; // Use environment variable PORT or default to 3000

// Import the routers
const calenderRouter = require('./routes/calender'); // Import the calender router
const attendanceRouter = require('./routes/attendance'); // Import the attendance router
const logoutRouter = require('./routes/logout'); // Import the logout router

app.set('view engine', 'ejs'); // Use ejs as the view engine

// Serve static files from the "public" directory
app.use(express.static('public'));

// Add this line to serve static files from the "views" directory
app.use(express.static('views'));

app.get('/', (req, res) => {
  res.render('home'); // Render the home view
});

// Use router
app.use('/calender', calenderRouter); // Use the calender router
app.use('/attendance', attendanceRouter); // Use the attendance router
app.use('/logout', logoutRouter); // Use the logout router

app.listen(port, '0.0.0.0', () => {
  console.log('Server is running on http://0.0.0.0:' + port); // Print a message when the server is running
});



