// Node.js backend example (using Express & OpenAI package)
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.get('/api/getPluralQuestion', async (req, res) => {
  const prompt = "Provide a random English noun and four plural forms, exactly one correct...";
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }]
  });
  const result = parseGPTResponse(response.choices[0].message.content);
  res.json(result);
});

app.listen(3000, () => console.log('API server running on port 3000'));
