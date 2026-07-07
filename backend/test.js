require('dotenv').config();
const User = require('./models/User');

async function test() {
  try {
    console.log('Testing User.create...');
    const user = await User.create({ name: 'Test', email: 'test@example.com', password: 'password123A' });
    console.log('User created successfully, _id:', user._id);
    
    console.log('Testing user.save()...');
    user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    console.log('User saved successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}
test();
