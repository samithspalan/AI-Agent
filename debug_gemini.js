const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'g:\\AIAgent\\server\\.env' });

async function test() {
  const key = process.env.GEMINI_API_KEY;
  try {
    // Note: The standard SDK doesn't have a direct 'listModels' in some versions 
    // but we can try to find what's wrong.
    console.log("Testing with key:", key.substring(0, 10) + "...");
    const genAI = new GoogleGenerativeAI(key);
    // Let's try gemini-1.5-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("ping");
    console.log("SUCCESS with gemini-1.5-flash-latest!");
  } catch (err) {
    console.error("ERROR DETAIL:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
}

test();
