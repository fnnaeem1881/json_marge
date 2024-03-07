const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for merging JSON files
app.post('/merge', upload.array('files'), (req, res) => {
  // Get uploaded files
  const files = req.files;
  const mergedData = [];

files.forEach(file => {
    const jsonData = JSON.parse(fs.readFileSync(file.path, 'utf8'));
    console.log(jsonData, 'log');
    
    // Push jsonData into mergedData array
    mergedData.push(jsonData);
});

  console.log('marge data',mergedData);
  // Write merged data to a new file
  const outputFile = 'merged_asddata.json';
  fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2));

  // Send the merged file as a response
  res.download(outputFile, err => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).end();
    } else {
      console.log('Merged JSON file downloaded successfully.');
      // Clean up uploaded files
      files.forEach(file => fs.unlinkSync(file.path));
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
