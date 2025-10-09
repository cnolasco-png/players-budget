export default (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const site = process.env.SITE_URL || 'http://localhost:8080';
  const sessionId = `mock_${Date.now()}`;
  const url = `${site}/#/claim?session_id=${sessionId}`;
  res.json({ url, session_id: sessionId });
};
