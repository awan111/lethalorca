const { MongoClient } = require('mongodb');

let cachedClient = null;

async function getDb() {
  if (cachedClient) return cachedClient.db();
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client.db();
}

// Disable default Vercel body parser size limit to handle screenshots
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { playerId, level, coins, score, wallet, screenshot, submittedAt } = req.body || {};

    if (!wallet || typeof wallet !== 'string' || wallet.trim().length < 20) {
      return res.status(400).json({ error: 'A valid wallet address is required' });
    }

    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    // Sanity Checks
    const safeLevel = Math.min(Math.max(Number(level) || 0, 0), 999);
    const safeCoins = Math.min(Math.max(Number(coins) || 0, 0), 5_000_000);
    const safeScore = Math.min(Math.max(Number(score) || 0, 0), 500_000);
    const flagged = safeCoins > 200_000 || safeLevel > 100;

    const db = await getDb();

    const doc = {
      playerId: String(playerId),
      level: safeLevel,
      coins: safeCoins,
      score: safeScore,
      wallet: wallet.trim(),
      hasScreenshot: Boolean(screenshot),
      screenshot: screenshot || null,
      status: 'pending',
      flagged,
      submittedAt: submittedAt || new Date().toISOString(),
      createdAt: new Date()
    };

    const result = await db.collection('orca_dash_claims').insertOne(doc);

    return res.status(200).json({ ok: true, claimId: result.insertedId });
  } catch (err) {
    console.error('orca-runner/claim error:', err);
    return res.status(500).json({ error: err.message || 'Server error while saving claim' });
  }
};
