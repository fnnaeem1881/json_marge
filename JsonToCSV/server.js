const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Parser } = require('json2csv');

const app = express();
const port = 3002;

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('.')); // Serve static files (HTML)

app.post('/convert', upload.single('jsonFile'), (req, res) => {
    try {
        const jsonData = JSON.parse(req.file.buffer.toString());

        // Initialize an array to store all keys (headers)
        const headers = new Set();

        // Flatten the JSON data and prepare CSV headers dynamically
        const flattenedData = jsonData.flat().map(item => {
            const flattenedItem = {};
            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    // Add keys to headers
                    headers.add(key);
                    // Print key and value to the console
                    console.log(`Key: ${key}, Value: ${item[key]}`);
                    // Include the key and its value in the flattened item
                    flattenedItem[key] = item[key];
                }
            }
            return flattenedItem;
        });

        // Convert Set to Array and create a final data array with proper structure
        const headerArray = Array.from(headers);
        const finalData = flattenedData.map(item => {
            const finalItem = {};
            headerArray.forEach(header => {
                finalItem[header] = item[header] !== undefined ? item[header] : ''; // Use empty string for missing values
            });
            return finalItem;
        });

        // Convert JSON to CSV
        const json2csvParser = new Parser({ fields: headerArray });
        const csv = json2csvParser.parse(finalData);

        // Set the correct encoding for UTF-8
        const utf8Csv = "\ufeff" + csv; // Add BOM for UTF-8

        // Send CSV as response
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('converted.csv');
        res.send(utf8Csv);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).send('Error parsing JSON');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
