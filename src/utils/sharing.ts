import LZString from "lz-string";
import { BouquetState } from "../types";
import { db, auth } from "../firebase";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function encodeBouquet(state: BouquetState): string {
  const json = JSON.stringify(state);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeBouquet(encoded: string): BouquetState | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode bouquet", e);
    return null;
  }
}

export async function getShortUrl(longUrl: string): Promise<string> {
  try {
    // Generate a random ID for the short link
    const shortId = Math.random().toString(36).substr(2, 8);
    const shortLinkRef = doc(db, "shortLinks", shortId);
    
    await setDoc(shortLinkRef, {
      longUrl,
      createdAt: new Date().toISOString()
    });
    
    const url = new URL(window.location.origin);
    url.searchParams.set("s", shortId);
    return url.toString();
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, "shortLinks");
    return longUrl;
  }
}

export async function resolveShortLink(shortId: string): Promise<string | null> {
  try {
    const shortLinkRef = doc(db, "shortLinks", shortId);
    const docSnap = await getDoc(shortLinkRef);
    
    if (docSnap.exists()) {
      return docSnap.data().longUrl;
    }
    return null;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, "shortLinks");
    return null;
  }
}

export function getShareUrl(state: BouquetState): string {
  const encoded = encodeBouquet(state);
  const url = new URL(window.location.origin);
  url.searchParams.set("b", encoded);
  return url.toString();
}
