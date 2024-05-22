import express from 'express';
import axios from 'axios';
import Cheerio from 'cheerio';
import mysql from 'mysql';

const PORT = process.env.PORT || 5000;

const connection = mysql.createConnection({
  host: 'localhost', // Your MySQL host
  user: 'root',      // Your MySQL username
  password: '',      // Your MySQL password
  database: 'web_scrapping' // Your MySQL database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
  
  // Create the 'quotes' table if it doesn't exist
  connection.query(`CREATE TABLE IF NOT EXISTS quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255)
  )`, (error, results, fields) => {
    if (error) {
      console.error('Error creating table: ' + error.stack);
      return;
    }
    console.log('Table created or already exists');
  });
});

const app = express();

axios('https://www.bbc.com/news')
  .then(res => {
    const htmlData = res.data;
    const $ = Cheerio.load(htmlData);
    const articles = [];

    $('h2.sc-4fedabc7-3.zTZri', htmlData).each((index, element) => {
      const title = $(element).text().trim();
      // const titileUrl = $(element).children('sc-4fedabc7-3 zTZri')
      articles.push({
        title
      });
      // Inserting into MySQL
      connection.query('INSERT INTO quotes (title) VALUES (?)', [title], (error, results, fields) => {
        if (error) throw error;
        console.log('Inserted: ', title);
      });
    });
    console.log(articles);
  }).catch(err => console.error(err));

app.listen(PORT, () => console.log('Server is running'));
