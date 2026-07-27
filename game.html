import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import bs58 from 'bs58';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { receiverAddress, amount } = req.body;

  if (!receiverAddress || !amount) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  try {
    // Solana Mainnet Connection
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

    // Admin Keypair from Vercel ENV
    const secretKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
    const adminKeypair = Keypair.fromSecretKey(secretKey);

    // LORCA Token Details (6 Decimals Precision)
    const LORCA_MINT_ADDRESS = new PublicKey("7RqpgT532tsYakbgnTXECC4MHTEGu5HzBxVAkAAHpump");
    const receiverPublicKey = new PublicKey(receiverAddress);
    const decimals = 6;

    // 1. Admin Token Account
    const adminTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      LORCA_MINT_ADDRESS,
      adminKeypair.publicKey
    );

    // 2. Receiver Token Account
    const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      LORCA_MINT_ADDRESS,
      receiverPublicKey
    );

    // 3. Convert Amount to Raw Units (Decimal = 6)
    const rawAmount = Math.floor(Number(amount) * Math.pow(10, decimals));

    // 4. Transfer LORCA Tokens
    const txHash = await transfer(
      connection,
      adminKeypair,
      adminTokenAccount.address,
      receiverTokenAccount.address,
      adminKeypair.publicKey,
      rawAmount
    );

    return res.status(200).json({
      success: true,
      message: 'LORCA Tokens transferred successfully!',
      data: { txHash }
    });

  } catch (error) {
    console.error("LORCA Transfer Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Token transfer failed' 
    });
  }
}
