import User from '../models/User.model';
import createError, { NotExtended } from 'http-errors';

import { authSchema } from '../helpers/validation.schema';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../helpers/jwtHelpers';
import client from '../helpers/init_redis';

export const registerController = async (req, res, next) => {
  try {
    // const { email, password } = req.body;
    // if (!email || !password) throw createError.BadRequest();

    let { email, password } = await authSchema.validateAsync(req.body);

    const doesExist = await User.findOne({ email });
    if (doesExist)
      throw createError.Conflict(`${email} is already registered.`);

    const newUser = new User({ email, password });
    const user = await newUser.save();
    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);
    res.send({ accessToken, refreshToken });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email });
    if (!user) throw createError.NotFound('User not registered');

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) throw createError.Unauthorized('Username/Password not valid');

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    res.send({ accessToken, refreshToken });
  } catch (err) {
    if (err.isJoi === true)
      return next(createError.BadRequest('Invalid username/password'));
    next(err);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.send({ accessToken, refreshToken: refToken });
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    client.DEL(userId, (err, value) => {
      if (err) {
        console.log(err.message);
        throw createError.InternalServerError();
      }
      console.log(value);
      res.sendStatus(204);
    });
  } catch (err) {
    next(err);
  }
};
