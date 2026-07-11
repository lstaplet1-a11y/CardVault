export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body || {};
  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'A valid http(s) calendar URL is required.' });
  }

  try {
    const r = await fetch(url, { headers: { 'Accept': 'text/calendar, text/plain, */*' } });
    if (!r.ok) return res.status(502).json({ error: `Calendar source returned ${r.status}` });
    const text = await r.text();
    res.status(200).json({ text });
  } catch (e) {
    res.status(502).json({ error: 'Could not fetch that calendar URL: ' + e.message });
  }
}
