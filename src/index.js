import express from 'express';
import morgan from 'morgan';
import createError from 'http-errors';

import authApi from './api/auth.route';
import connectDB from './helpers/connectDB';
import { verifyAccessToken } from './helpers/jwtHelpers';
require('./helpers/init_redis');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', verifyAccessToken, async (req, res, next) => {
  res.send('<h1>hello world</h1>');
});

app.use('/auth', authApi);

app.use(async (req, res, next) => {
  // const error = new Error('Not found');
  // error.status = 404;
  // next(error);

  next(createError.NotFound('This route doesnot exist'));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`listening on port `, port));
