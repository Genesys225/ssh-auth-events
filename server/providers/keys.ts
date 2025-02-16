import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose';
import { writeFile, readFile, access, mkdir } from 'fs/promises';
import { join } from 'path';

const KEY_DIR = process.env.KEY_DIR || './server/keys';
const PRIVATE_KEY_PATH = join(KEY_DIR, 'private.key');
const PUBLIC_KEY_PATH = join(KEY_DIR, 'public.key');

export async function getOrCreateKeys() {
  try {
    // Try to read existing keys
    await access(PRIVATE_KEY_PATH);
    await access(PUBLIC_KEY_PATH);
    
    const privateKey = await readFile(PRIVATE_KEY_PATH, 'utf-8');
    const publicKey = await readFile(PUBLIC_KEY_PATH, 'utf-8');
    
    return {
      privateKey,
      publicKey
    };
  } catch {
    // Generate new key pair if they don't exist
    const { privateKey, publicKey } = await generateKeyPair('ES256');
    
    // Export keys in PEM format
    const privateKeyExport = await exportPKCS8(privateKey);
    
    const publicKeyExport = await exportSPKI(publicKey);
    
    // Save keys
    await mkdir(KEY_DIR, { recursive: true });
    await writeFile(PRIVATE_KEY_PATH, privateKeyExport);
    await writeFile(PUBLIC_KEY_PATH, publicKeyExport);
    
    return {
      privateKey: privateKeyExport,
      publicKey: publicKeyExport
    };
  }
}