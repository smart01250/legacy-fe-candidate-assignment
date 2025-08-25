export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = {
      DYNAMIC_ENVIRONMENT_ID: process.env.DYNAMIC_ENVIRONMENT_ID || '623128fa-dcc7-4708-b599-880890d60566',
      API_BASE_URL: '/api'
    };

    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load configuration' });
  }
}
