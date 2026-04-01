import React, { useState, useEffect } from "react";
import { BouquetState } from "./types";
import { decodeBouquet, resolveShortLink } from "./utils/sharing";
import { Editor } from "./components/Editor";
import { Viewer } from "./components/Viewer";
import { Loader2 } from "lucide-react";

export default function App() {
  const [state, setState] = useState<BouquetState | null>(null);
  const [isViewer, setIsViewer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("b");
      const shortId = params.get("s");

      if (encoded) {
        const decoded = decodeBouquet(encoded);
        if (decoded) {
          setState(decoded);
          setIsViewer(true);
        }
      } else if (shortId) {
        const longUrl = await resolveShortLink(shortId);
        if (longUrl) {
          const url = new URL(longUrl);
          const b = url.searchParams.get("b");
          if (b) {
            const decoded = decodeBouquet(b);
            if (decoded) {
              setState(decoded);
              setIsViewer(true);
            }
          }
        }
      }
      setIsLoading(false);
    };

    handleUrl();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-pink-100 gap-4">
        <img src="/logo.svg" alt="OnBouquet Logo" className="w-20 h-20 animate-pulse drop-shadow-sm" />
        <h1 className="text-2xl font-sketch font-bold text-stone-800">OnBouquet</h1>
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    );
  }

  if (isViewer && state) {
    return <Viewer initialState={state} />;
  }

  return <Editor />;
}
