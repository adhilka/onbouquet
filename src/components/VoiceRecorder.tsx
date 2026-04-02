import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Square, Play, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { storage } from "../lib/supabase";
import { cn } from "../lib/utils";

interface VoiceRecorderProps {
  onVoiceUpload: (url: string) => void;
  currentVoiceUrl?: string;
  accentColor: string;
  showToast: (message: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onVoiceUpload, currentVoiceUrl, accentColor, showToast }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(currentVoiceUrl || null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        
        // Automatically upload after recording
        await uploadVoice(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVoice = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const fileName = `voice-${Date.now()}.webm`;
      await storage.upload('bouquets', fileName, blob);
      const publicUrl = storage.getPublicUrl('bouquets', fileName);
      onVoiceUpload(publicUrl);
      showToast("Voice message saved! 🎙️");
    } catch (err: any) {
      console.error("Error uploading voice:", err);
      if (err.message?.includes("Bucket not found")) {
        alert("Supabase Storage Error: The 'bouquets' bucket was not found. Please create a public bucket named 'bouquets' in your Supabase dashboard.");
      } else if (err.message?.includes("row-level security policy")) {
        alert("Supabase Security Error: Row-Level Security (RLS) is blocking the upload. \n\nPlease go to your Supabase Dashboard -> Storage -> Policies and add an 'INSERT' policy for the 'bouquets' bucket to allow public/anonymous uploads.");
      } else {
        alert("Failed to upload voice message: " + (err.message || "Unknown error"));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVoice = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    onVoiceUpload("");
  };

  return (
    <div className="space-y-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-rose-800">Voice Message</h4>
        {audioUrl && !isRecording && (
          <button onClick={deleteVoice} className="text-rose-400 hover:text-rose-600 transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        {!audioUrl && !isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg sketch-border", accentColor)}
          >
            <Mic size={28} />
          </motion.button>
        ) : isRecording ? (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg"
            >
              <Square size={24} onClick={stopRecording} className="cursor-pointer" />
            </motion.div>
            <span className="text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-widest">Recording...</span>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <audio src={audioUrl!} controls className="w-full h-10" />
            
            {!currentVoiceUrl && audioBlob && (
              <button
                onClick={uploadVoice}
                disabled={isUploading}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all sketch-border",
                  accentColor,
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Save Voice Message
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-[9px] text-rose-400 text-center italic">
        {isRecording ? "Tap the square to stop recording" : !audioUrl ? "Tap the mic to record a voice message" : "Preview your message before saving"}
      </p>
    </div>
  );
};
