import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, Maximize2, X, Code2, Play } from "lucide-react";

interface ArtifactViewProps {
  type: "code" | "preview";
  content: string;
  onClose?: () => void;
  isFullScreen?: boolean;
}

export default function ArtifactView({ 
  type: initialType, 
  content, 
  onClose,
  isFullScreen: initialFullScreen = false 
}: ArtifactViewProps) {
  const [type, setType] = useState<"code" | "preview">(initialType);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(initialFullScreen);

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-[100] bg-[#030712] flex flex-col" 
    : "relative w-full rounded-[32px] bg-[#1c1f23]/40 border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl";

  const headerClasses = "flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]";

  return (
    <motion.div 
      layout
      className={containerClasses}
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={headerClasses}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1">
            <button 
              onClick={() => setType("preview")}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                type === "preview" ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white/50"
              }`}
            >
              Preview
            </button>
            <button 
              onClick={() => setType("code")}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                type === "code" ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white/50"
              }`}
            >
              Code
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleFullScreen}
            className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all transform active:scale-90"
          >
            {isFullScreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {!isFullScreen && (
            <button className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={type + isFullScreen}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 flex flex-col"
          style={{ height: isFullScreen ? "calc(100vh - 80px)" : 450 }}
        >
          <div className="flex-1 overflow-auto p-8 font-mono text-sm scrollbar-hide">
            {type === "code" ? (
              <pre className="text-blue-300/80 leading-relaxed">
                <code>{content}</code>
              </pre>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1d]/50 rounded-[32px] border border-white/5 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 opacity-30" />
                
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="z-10 text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-1 ring-white/20">
                    <Code2 className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-white mb-2 tracking-tight">Generated Interface</h3>
                  <p className="text-white/30 text-sm font-medium">Build 2024.12.01 • Active</p>
                </motion.div>

                <div className="absolute bottom-6 flex gap-3 z-10">
                  <button className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-xs flex items-center gap-2 hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95 shadow-xl">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Launch
                  </button>
                  <button className="px-6 py-2.5 bg-[#1c1f23]/60 text-white/70 rounded-full font-bold text-xs border border-white/5 hover:bg-white/10 transition-all transform hover:scale-105 active:scale-95 backdrop-blur-md">
                    Inspect
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
