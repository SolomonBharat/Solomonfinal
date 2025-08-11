const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate summary and category suggestions using OpenAI
exports.summarizeRequirement = async (reqData) => {
  const prompt = `You are a sourcing expert. Given the following buyer requirement,\nreturn JSON with keys: summary (one sentence) and categories (comma separated HS codes).\nRequirement: ${JSON.stringify(reqData)}`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });

  const text = completion.choices[0].message.content;
  try {
    const data = JSON.parse(text);
    return { summary: data.summary || '', categories: data.categories || '' };
  } catch (err) {
    return { summary: '', categories: '' };
  }
};
