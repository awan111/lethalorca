// /api/orca-runner/claim.js
// Vercel serverless function — receives a claim submission from orca-dash.html
// and stores it in MongoDB so it can be reviewed and paid out manually.
//
// SETUP (GitHub web UI):
// 1. Put this file at api/orca-runner/claim.js in your repo (same "api/" folder
//    style you already use for the other LethalOrca endpoints).
// 2. In Vercel → Project → Settings → Environment Variables, make sure
//    MONGODB_URI is already set (you already use this for staking/spin).
// 3. That's it — Vercel auto-detects any file under /api as a serverless function.
//
// This does NOT send any tokens automatically. It only records the claim so
// an admin can verify the score/level/coins and pay out manually or via a
// separate withdrawal script — same "screenshot is proof, not truth" approach
// used elsewhere in LethalOrca.

const { MongoClient } = require('mongodb');

let cachedClient = null;
async function getDb() {
  if (cachedClient) return cachedClient.db();
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client.db();
}

module.exports = async (req, res) => {
  // basic CORS so the game page can call this from the same domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { playerId, level, coins, score, wallet, screenshot, submittedAt } = req.body || {};

    if (!wallet || typeof wallet !== 'string' || wallet.length < 20) {
      return res.status(400).json({ error: 'A valid wallet address is required' });
    }
    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    // Basic sanity caps so an obviously spoofed client payload gets flagged
    // instead of silently queued for payout. Tune these to your real limits.
    const safeLevel = Math.min(Math.max(Number(level) || 0, 0), 999);
    const safeCoins = Math.min(Math.max(Number(coins) || 0, 0), 5_000_000);
    const safeScore = Math.min(Math.max(Number(score) || 0, 0), 500_000);
    const flagged = safeCoins > 200_000 || safeLevel > 100; // adjust thresholds as needed

    const db = await getDb();
    const doc = {
      playerId: String(playerId),
      level: safeLevel,
      coins: safeCoins,
      score: safeScore,
      wallet: wallet.trim(),
      hasScreenshot: !!screenshot,
      screenshot: screenshot || null,   // base64 data URL; move to object storage later if it grows large
      status: 'pending',                // pending | approved | rejected | paid
      flagged,
      submittedAt: submittedAt || new Date().toISOString(),
      createdAt: new Date()
    };

    const result = await db.collection('orca_dash_claims').insertOne(doc);

    return res.status(200).json({ ok: true, claimId: result.insertedId });
  } catch (err) {
    console.error('orca-runner/claim error:', err);
    return res.status(500).json({ error: 'Server error while saving claim' });
  }
};
