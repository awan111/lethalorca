import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    return res.status(500).json({ success: false, error: 'Database URI environment variable is missing' });
  }

  let client;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db('lethalorca');
    const collection = db.collection('stakes');

    const { action, wallet } = req.query;

    // 1. List active stakes for wallet
    if (req.method === 'GET' && action === 'list') {
      if (!wallet) return res.status(400).json({ success: false, error: 'Wallet address required' });
      const stakes = await collection.find({ wallet, status: 'active' }).toArray();
      return res.status(200).json({ success: true, stakes });
    }

    // 2. Create a new stake (supports 1 day, 3 days, 7 days, 14 days)
    if (req.method === 'POST' && action === 'create') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { wallet: userWallet, amount, mult, lockDays, apr } = body;

      if (!userWallet || !amount) {
        return res.status(400).json({ success: false, error: 'Missing wallet address or amount' });
      }

      const newStake = {
        wallet: userWallet,
        amount: parseFloat(amount),
        mult: parseInt(mult) || 1,
        days: parseInt(lockDays) || 1,
        apr: parseFloat(apr) || 20,
        createdAt: new Date(),
        status: 'active'
      };

      await collection.insertOne(newStake);
      return res.status(200).json({ success: true, stake: newStake });
    }

    // 3. Claim or Unstake
    if (req.method === 'POST' && action === 'claim') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { stakeId, wallet: userWallet } = body;

      if (!stakeId || !userWallet) {
        return res.status(400).json({ success: false, error: 'Missing stake ID or wallet' });
      }

      const queryId = ObjectId.isValid(stakeId) ? new ObjectId(stakeId) : stakeId;
      const stake = await collection.findOne({ _id: queryId, wallet: userWallet, status: 'active' });

      if (!stake) {
        return res.status(404).json({ success: false, error: 'Active stake not found' });
      }

      const lockDurationDays = stake.days || stake.lockDays || 1;
      const maturesAt = new Date(stake.createdAt).getTime() + lockDurationDays * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const isMatured = now >= maturesAt;

      // Update status in MongoDB
      await collection.updateOne(
        { _id: queryId },
        { $set: { status: isMatured ? 'claimed' : 'unstaked_early', claimedAt: new Date() } }
      );

      return res.status(200).json({ 
        success: true, 
        message: isMatured ? 'Successfully claimed stake and rewards!' : 'Unstaked early successfully.',
        amountReturned: stake.amount 
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Database connection error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
