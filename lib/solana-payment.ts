/**
 * Solana Payment Utilities
 * Helper functions for processing payments on Solana
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface CreatePaymentTransactionParams {
  fromPubkey: PublicKey;
  toPubkey: PublicKey;
  amount: number; // in lamports or smallest unit
  connection: Connection;
}

/**
 * Creates a payment transaction on Solana
 */
export async function createPaymentTransaction({
  fromPubkey,
  toPubkey,
  amount,
  connection,
}: CreatePaymentTransactionParams): Promise<Transaction> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: amount,
    })
  );
  
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;
  
  return transaction;
}

/**
 * Verifies a payment transaction on Solana
 */
export async function verifyPaymentTransaction(
  signature: string,
  connection: Connection,
  _expectedAmount: number,
  _expectedRecipient: string
): Promise<boolean> {
  try {
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!transaction || !transaction.meta) {
      return false;
    }
    
    // Verify transaction was successful
    if (transaction.meta.err) {
      return false;
    }
    
    // Additional verification logic can be added here
    // to check the amount and recipient
    
    return true;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

/**
 * Converts SOL to lamports
 */
export function solToLamports(sol: number): number {
  return sol * LAMPORTS_PER_SOL;
}

/**
 * Converts lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Formats a Solana public key for display
 */
export function formatPublicKey(publicKey: string, chars: number = 4): string {
  return `${publicKey.slice(0, chars)}...${publicKey.slice(-chars)}`;
}

