exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { prompt, systemMsg } = JSON.parse(event.body);

    const messages = [];
    if (systemMsg) messages.push({ role: 'system', content: systemMsg });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.7,
        messages
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ text: data.choices[0].message.content })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Server error' })
    };
  }
};
