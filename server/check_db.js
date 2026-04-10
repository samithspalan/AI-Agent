const mongoose = require('mongoose');
require('dotenv').config();

async function checkLogs() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // The collection name might be pluralized by mongoose to 'agentlogs'
    // Let's check the schema for the model name too.
    const AgentLog = require('./models/AgentLog');
    const count = await AgentLog.countDocuments();
    console.log('Total logs in AgentLog model:', count);
    
    const logs = await AgentLog.find({}).lean();
    console.log('Logs found:', logs.length);
    // console.log('Logs:', JSON.stringify(logs, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkLogs();
