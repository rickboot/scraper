const express = require('express');
const cors = require('cors');
const app = express();
const port = 5050;

const { spawn } = require('node:child_process');

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db/database.sqlite',
  logging: false,
});

const ProductResult = sequelize.define('ProductResult', {
  name: DataTypes.STRING,
  img: DataTypes.STRING,
  url: DataTypes.STRING,
  price: DataTypes.FLOAT,
  created_at: DataTypes.DATE,
  search_text: DataTypes.STRING,
});

const TrackedProduct = sequelize.define('TrackedProduct', {
  name: DataTypes.STRING,
  created_at: DataTypes.DATE,
  tracked: DataTypes.BOOLEAN,
});

//Todo: sync models to db

(async () => {
  await sequelize.sync({ force: true });
})();

// (async () => {
//   await sequelize.sync({ force: true });

//   const rick = await User.build({
//     username: 'rickboot',
//     birthday: new Date(2001, 4, 1),
//   });

//   await rick.save();
//   console.log(rick.username);
//   console.log(rick.birthday);
// })();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('hello world!');
});

app.post('/start-scraper', (req, res) => {
  const { url, search_text } = req.body; // express.json converts search-text to search_text?

  //todo: refactor python section into function
  const python = spawn('python3', [
    './scraper/__init__.py',
    `${url}`,
    `"${search_text}"`,
    '/results',
  ]);

  python.stdout.on('data', (data) => console.log('output: ', data.toString()));
  python.on('close', (code) => console.log('exited with code: ', code));
  python.on('error', (error) => console.error('error: ', error.message));

  //todo: error checking
  return res.json({ message: 'Scraper started' }).status(200);
});

app.post('/results', (req, res) => {
  const { data, search_text, source } = req.body;

  console.log('reqbody ', req.body.data[0]);
  data.forEach((item) => console.log('item: ', item));
  console.log('data: ', data);
  console.log('source: ', source);
  console.log('search_text: ', search_text);

  //todo: error checking

  return res.json({ message: 'Data receieved and saved successfully' });
});

app.listen(port, () => console.log(`Express running on port ${port}`));
