const express = require('express');
const app = express();

const routesQuiz = require('./router/quizes');
const db = require('./DB/db');

app.use(routesQuiz);

db.connect((err) => {
  if (err) console.log(err);
  else console.log('database connected');
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('The app is running on ' + port);
});
