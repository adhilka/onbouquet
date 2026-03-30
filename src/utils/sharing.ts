import LZString from "lz-string";
import { BouquetState } from "../types";
import { db } from "../firebase";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";

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
    console.error("Failed to create short link in Firestore", e);
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
    console.error("Failed to resolve short link from Firestore", e);
    return null;
  }
}

export function getShareUrl(state: BouquetState): string {
  const encoded = encodeBouquet(state);
  const url = new URL(window.location.origin);
  url.searchParams.set("b", encoded);
  return url.toString();
}
