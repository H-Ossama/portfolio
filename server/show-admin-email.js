const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/portfolio';

// Define the User schema just for this script
const UserSchema = new mongoose.Schema({
  username: String,
  email: String
}, { strict: false }); // Use strict: false to avoid issues if other fields exist

const User = mongoose.model('User', UserSchema);

async function showAdminEmail() {
  console.log('Starting script...'); // Added start log
  try {
    console.log(`Attempting to connect to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // Add a timeout
    });
    console.log('Successfully connected to MongoDB.');

    console.log('Searching for admin user...');
    const admin = await User.findOne({ username: 'admin' });

    if (admin) {
      console.log(`Admin user found. Current email: ${admin.email}`);
    } else {
      console.log('Admin user not found in the database.');
    }

  } catch (error) {
    console.error('--- SCRIPT ERROR ---');
    console.error('Error occurred:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('--------------------');
  } finally {
    try {
        console.log('Attempting to disconnect from MongoDB...');
        await mongoose.disconnect();
        console.log('Successfully disconnected from MongoDB.');
    } catch (disconnectError) {
        console.error('Error disconnecting from MongoDB:', disconnectError.message);
    }
    // Ensure logs are flushed before exiting
    console.log('Script finished.');
    process.stdout.on('finish', () => process.exit(0));
    process.stderr.on('finish', () => process.exit(1));
    process.stdout.end();
    process.stderr.end();
    // Fallback exit in case finish event doesn't fire
    setTimeout(() => process.exit(0), 1000);
  }
}

showAdminEmail();
