import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.DB_URI}/${process.env.DB_NAME}`, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`database connected ${process.env.DB_NAME}`);
  } catch (err) {
    console.log(err.message);
  }
};

export default connectDB;
