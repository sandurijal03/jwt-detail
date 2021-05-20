import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import client from './init_redis';

export const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};

    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: '1h',
      issuer: 'pickurpage.com',
      audience: userId,
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

export const verifyAccessToken = async (req, res, next) => {
  if (!req.headers['authorization']) {
    return next(createError.Unauthorized());
  }
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader.split(' ');
  const token = bearerToken[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const messsage =
        err.name === 'JsonWebTokenError' ? 'Unauthororized' : err.message;
      return next(createError.Unauthorized(messsage));
    }
    req.payload = payload;
    next();
  });
};

export const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};

    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: '1h',
      issuer: 'pickurpage.com',
      audience: userId,
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(createError.InternalServerError());
      }
      client.set(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
        if (err) {
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  });
};

export const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        const userId = payload.aud;
        client.get(userId, (err, result) => {
          if (err) {
            console.log(err.message);
            reject(createError.InternalServerError());
            return;
          }
          if (refreshToken === result) return resolve(userId);
          reject(createError.Unauthorized());
        });
      },
    );
  });
};
