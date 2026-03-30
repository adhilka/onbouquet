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
      <div className="fixed inset-0 flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 text-stone-400 animate-spin" />
      </div>
    );
  }

  if (isViewer && state) {
    return <Viewer initialState={state} />;
  }

  return <Editor />;
}
