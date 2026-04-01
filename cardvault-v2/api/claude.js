export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const body = req.body;
  
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  
  const data = await r.json();
  
  if (data.stop_reason === 'tool_use') {
    const toolUse = data.content.find(b => b.type === 'tool_use');
    if (toolUse && toolUse.name === 'web_search') {
      const messages = [
        ...body.messages,
        { role: 'assistant', content: data.content },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: `Search completed for: ${toolUse.input.query}. Please provide your best answer about recent eBay sold prices for this sports card based on your knowledge.` }] }
      ];
      const r2 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ ...body, messages, tools: body.tools }),
      });
      const data2 = await r2.json();
      return res.status(r2.status).json(data2);
    }
  }
  
  res.status(r.status).json(data);
}
