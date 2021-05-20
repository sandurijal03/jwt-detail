import { Schema, model } from 'mongoose';
import { compare, genSalt, hash } from 'bcryptjs';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre('save', async function (next) {
  try {
    const salt = await genSalt(12);
    const hashedPassword = await hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
});

userSchema.methods.isValidPassword = async function (password) {
  try {
    return await compare(password, this.password);
  } catch (err) {
    throw err;
  }
};

const User = model('User', userSchema);

export default User;
