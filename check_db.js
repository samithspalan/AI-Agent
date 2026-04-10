const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    const collection = mongoose.connection.db.collection('agentlogs');
    const count = await collection.countDocuments();
    console.log('Total logs in agentlogs collection:', count);
    
    const logs = await collection.find({}).toArray();
    console.log('Logs:', JSON.stringify(logs, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkLogs();
