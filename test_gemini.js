const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'g:\\AIAgent\\server\\.env' });

async function test() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Loaded Key:", key);
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello?");
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("Direct Test Error:", err.message);
  }
}

test();
