
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Service = require('./models/Service');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Service.deleteMany();

    const provider = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'provider',
      phone: '1234567890',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      }
    });

    const services = [
      {
        provider: provider._id,
        title: 'Gardening',
        description: 'Professional lawn mowing service.',
        price: 50,
        category: 'Gardening'
      },
      {
        provider: provider._id,
        title: 'Home Cleaning',
        description: 'Complete house cleaning service.',
        price: 100,
        category: 'Cleaning'
      },
      {
        provider: provider._id,
        title: 'Plumbing',
        description: 'Fixing leaky pipes and faucets.',
        price: 150,
        category: 'Plumbing'
      }
    ];

    await Service.insertMany(services);

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(`${err}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Service.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(`${err}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
