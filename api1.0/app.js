const express = require('express');
const connectionPromise = require('./utils/mysql').connectionPromise;
const tasksRouter = require('./router/tasksRouter');
const port = 3000;

const app = express();
app.use('/api/1.0/tasks', tasksRouter);
app.use('/api/1.0/users', tasksRouter);

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server Error' });
  });
  
  
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  // Listen for the termination event of the application
  process.on('SIGINT', function() {
    connectionPromise.end(function(err) {
      if (err) {
        console.error('Error closing MySQL connection:', err);
        return;
      }
      console.log('MySQL connection closed.');
      process.exit(); // Terminate the application
    });
  });