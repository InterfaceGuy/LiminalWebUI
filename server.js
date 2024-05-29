const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
  const folderName = path.basename(__dirname);
  res.sendFile(path.join(__dirname, 'index.html'), { folderName });
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});