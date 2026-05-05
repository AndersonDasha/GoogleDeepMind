/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Menu, ChevronDown, Sparkles, Mic, Pencil, Check, ThumbsUp, ThumbsDown, Loader2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import WaveAnimation from "./components/WaveAnimation";
import DotBackground from "./components/DotBackground";
import ArtifactView from "./components/ArtifactView";
import { useAudioFrequency } from "./hooks/useAudioFrequency";

import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Artifact {
  id: string;
  type: 'code' | 'preview';
  title: string;
  content: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  artifact?: Artifact;
}

const INITIAL_MESSAGES: Message[] = [];

const MODELS = [
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", description: "Fastest and best for daily tasks" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", description: "Complex reasoning & coding" },
];

// Typewriter effect component for smooth text reveal
const TypewriterText = ({ text, delay = 5, onUpdate }: { text: string, delay?: number, onUpdate?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
        onUpdate?.();
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay, onUpdate]);

  // Catch up if streaming is faster than typing
  useEffect(() => {
    if (text.length > displayedText.length + 30) {
      setDisplayedText(text.slice(0, displayedText.length + 10));
      setCurrentIndex(displayedText.length + 10);
      onUpdate?.();
    }
  }, [text, displayedText.length, onUpdate]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

export default function App() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPreppyMode, setIsPreppyMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const intensity = useAudioFrequency();
  const menuRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript = transcript;
          } else {
            currentTranscript += transcript;
          }
        }
        
        setInterimTranscript(currentTranscript);
        
        if (currentTranscript.trim() || finalTranscript.trim()) {
          setIsUserTalking(true);
          // Start the "thinking" intuition as soon as we hear something
          if (!isThinking && !isSpeaking) {
            setIsThinking(true);
          }
        }

        // Delay processing to ensure the user has actually finished
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (finalTranscript.trim() || currentTranscript.trim()) {
            setIsUserTalking(false);
            handleFinalTranscript(finalTranscript || currentTranscript);
          }
        }, 1200);
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'aborted') return;
        
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // Use ref to see the absolute current state
        if (isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Failed to restart recognition:", e);
            setIsListening(false);
          }
        }
      };
    }
  }, []);

  const handleFinalTranscript = async (content: string) => {
    if (!content.trim()) return;
    
    setHasInteracted(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInterimTranscript("");
    
    await streamGeminiResponse([...messages, userMessage]);
  };

  const streamGeminiResponse = async (history: Message[]) => {
    const aiMessageId = (Date.now() + 1).toString();
    setIsThinking(true);
    setIsSpeaking(false);
    
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: ""
    };
    
    setMessages(prev => [...prev, aiMessage]);

    try {
      const response = await ai.models.generateContentStream({
        model: selectedModel.id,
        contents: history.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are Gemini Live. Be extremely concise, conversational, and direct. Use short sentences. Don't use bullet points unless absolutely necessary. Sound like a real person over voice chat. If asked about technical things, give high-level sharp advice. If generating 'Artifacts', wrap the code or preview trigger in a special way or just wait for detection.",
          temperature: 0.7,
        }
      });

      let fullText = "";
      setIsThinking(false);
      setIsSpeaking(true);

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          
          // Simulated artifact detection for prototype
          let artifact: Artifact | undefined;
          if (fullText.toLowerCase().includes("generating a cinematic cyberpunk portrait")) {
            artifact = {
              id: "art-1",
              type: "preview",
              title: "Neural Portrait v4.2",
              content: "// Neural Portrait Engine v4.2\n// Parameters: Cyan, Magenta, High Detail\n\ninterface PortraitConfig {\n  lighting: 'neon' | 'moody';\n  atmosphere: string;\n  faceDetail: number;\n}\n\nexport const config: PortraitConfig = {\n  lighting: 'neon',\n  atmosphere: 'cyberpunk fog',\n  faceDetail: 0.98\n};"
            };
          }

          setMessages(prev => prev.map(m => 
            m.id === aiMessageId ? { ...m, content: fullText, artifact: artifact || m.artifact } : m
          ));
          
          if (artifact && !activeArtifact) {
            setActiveArtifact(artifact);
          }
        }
      }
      setIsSpeaking(false);
    } catch (error) {
      console.error("Gemini Error:", error);
      setIsThinking(false);
      setIsSpeaking(false);
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId ? { ...m, content: "I'm having trouble connecting right now. Can we try again in a second?" } : m
      ));
    }
  };

  const toggleListening = () => {
    setHasInteracted(true);
    if (isPreppyMode) {
      setIsPreppyMode(false);
    }
    
    if (isListening) {
      setIsListening(false);
      isListeningRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.error("Stop error:", e);
      }
    } else {
      // Clear interim transcript on start
      setInterimTranscript("");
      
      // Some browsers need a tiny break between state changes
      setTimeout(() => {
        setIsListening(true);
        isListeningRef.current = true;
        try {
          recognitionRef.current?.start();
        } catch (e) {
          console.log("Start attempted:", e);
          // If it fails, reset state so user can try again
          setIsListening(false);
          isListeningRef.current = false;
        }
      }, 50);
    }
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isListening && interimTranscript) {
      scrollToBottom("auto");
    }
  }, [isListening, interimTranscript]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setHasInteracted(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim()
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    
    await streamGeminiResponse([...messages, userMessage]);
  };

  const resetChat = () => {
    setMessages([]);
    setIsPreppyMode(false);
    setIsListening(false);
  };

  return (
    <motion.div 
      animate={{
        backgroundColor: intensity > 0.3 ? "#030816" : "#000000"
      }}
      transition={{ duration: 1.5 }}
      className={`relative flex flex-col h-screen w-full text-white font-sans selection:bg-gemini-blue selection:text-white transition-all duration-700 ${isPreppyMode ? 'tracking-normal' : 'tracking-tight'}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#112552_0%,_#000000_65%)] z-0 transition-all duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#051128] z-0" />
      
      {/* Background patterns */}
      <DotBackground />
      
      {/* Status Bar Spacer (Simulated for iOS) */}
      <div className="h-12 flex items-center justify-between px-8 z-50">
        <button 
          onClick={resetChat}
          className="text-sm font-semibold tracking-tight text-white/90 cursor-pointer hover:bg-white/5 px-2 py-0.5 rounded transition-colors"
        >
          9:41
        </button>
        <div className="flex gap-1.5 items-center">
          <div className="w-5 h-[11px] rounded-[3px] border border-white/30 relative">
            <div className="absolute top-0.5 left-0.5 bottom-0.5 right-1 bg-white rounded-[1px]" />
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-white/30 rounded-r-sm" />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2 z-50">
        <button id="menu-button" className="w-12 h-12 flex items-center justify-center header-button-dark rounded-[16px] hover:bg-white/10 transition-all shadow-lg active:scale-95">
          <Menu className="w-5 h-5 text-gray-400" />
        </button>

        <div className="relative" ref={menuRef}>
          <div 
            id="model-pill" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="model-pill-gradient-border cursor-pointer hover:brightness-110 transition-all active:scale-95 group shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]"
          >
            <div className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full glass-pill-thin">
              <div className="flex items-center gap-2.5 px-1.5">
                <Sparkles className="w-4 h-4 text-[#8ab4f8] fill-[#8ab4f8]" strokeWidth={2.5} />
                <span className="text-[14px] font-medium tracking-tight text-white/95">
                  {selectedModel.name}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 rounded-full bg-[#1c1f23] flex items-center justify-center text-white/60 group-hover:text-white transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 glass-pill-thick rounded-3xl p-2 border border-white/10 shadow-4xl backdrop-blur-3xl z-50 overflow-hidden"
              >
                <div className="space-y-1">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left ${
                        selectedModel.id === model.id 
                          ? "bg-white/10" 
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded-full ${selectedModel.id === model.id ? "text-purple-400" : "text-white/20"}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{model.name}</span>
                          {selectedModel.id === model.id && <Check className="w-4 h-4 text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-white/40 mt-0.5 leading-tight">{model.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div id="profile-avatar" className="w-[44px] h-[44px] google-avatar-border rounded-[14px] cursor-pointer hover:brightness-110 transition-all active:scale-95 shadow-lg overflow-hidden">
          <div className="w-full h-full rounded-[13px] overflow-hidden bg-[#030712]">
            <img 
              src="/regenerated_image_1777589544331.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-20 overflow-hidden">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              className="flex-1 flex flex-col items-center justify-center px-10 text-center -translate-y-16"
            >
              <div className="space-y-1">
                <h1 className="text-[22px] md:text-[26px] tracking-tight text-white leading-tight font-display font-medium">
                  Think out loud.
                </h1>
                <p className="text-[22px] md:text-[26px] tracking-tight text-white/40 leading-tight font-display font-light">
                  Gemini's listening.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto px-6 py-4 flex flex-col"
            >
              <div className="flex-1" />
              <div className="max-w-2xl mx-auto w-full space-y-6 pb-40">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end mb-1' : 'items-start'}`}
                    >
                      {msg.role === 'user' ? (
                        <div className="max-w-[85%] px-6 py-4 bg-[#1c1f23]/80 backdrop-blur-xl rounded-[28px] border border-white/5 shadow-xl self-end">
                          <p className="text-[17px] leading-[1.6] text-white/90 font-display font-medium">
                            {msg.content}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full pt-2 flex flex-col items-start message-content">
                          <div className="text-[18px] md:text-[20px] leading-[1.6] text-white/95 font-display font-normal max-w-[95%]">
                            {msg.content ? (
                              <TypewriterText text={msg.content} onUpdate={() => scrollToBottom("auto")} />
                            ) : (
                              <div className="flex items-center gap-3 text-white/30 py-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-[18px] italic font-display font-medium">Gemini is thinking...</span>
                              </div>
                            )}
                          </div>
                          
                          {msg.artifact && (
                            <div className="w-full pt-6">
                              <div className="flex items-center gap-3 mb-6">
                                <button className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-semibold hover:bg-white/10 transition-all text-white/40">Preview</button>
                                <button className="px-6 py-2 rounded-full border border-purple-500/30 bg-[#1c1f23] text-sm font-semibold text-white/90 transition-all shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]">Code</button>
                              </div>
                              <ArtifactView 
                                type={msg.artifact.type} 
                                content={msg.artifact.content} 
                              />
                            </div>
                          )}

                          {msg.content && (
                            <div className="flex items-center gap-2 text-white/20 pt-1">
                              <button className="hover:text-white transition-all transform hover:scale-110 active:scale-95">
                                <ThumbsUp className="w-5 h-5 stroke-[1.2]" />
                              </button>
                              <button className="hover:text-white transition-all transform hover:scale-110 active:scale-95">
                                <ThumbsDown className="w-5 h-5 stroke-[1.2]" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Interim Voice Result / Hearing Indicator */}
                  {(isListening && (interimTranscript || isUserTalking)) && (
                    <motion.div
                      key="interim"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-end"
                    >
                      <div className="max-w-[90%] px-5 py-3.5 bg-[#1c1f23]/40 backdrop-blur-md rounded-[24px] border border-white/5 border-dashed">
                        <p className="text-[16px] leading-[1.5] text-white/40 font-display font-normal italic">
                          {interimTranscript || "Listening..."}
                        </p>
                      </div>
                      
                      {isThinking && !isSpeaking && !interimTranscript && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 text-[12px] text-blue-400/50 flex items-center gap-1.5 pr-2 absolute -bottom-6 right-0"
                        >
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Gemini is thinking...</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Wave Animation */}
      <AnimatePresence>
        {!isPreppyMode && (
          <motion.div
            key="waves-mount"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-10"
          >
            <WaveAnimation 
              isListening={isListening} 
              isSpeaking={isSpeaking || isThinking || isUserTalking}
              hasInteracted={hasInteracted}
              hasMessages={messages.length > 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Controls */}
      <footer className="shrink-0 pb-0 flex flex-col items-center z-[60] bg-gradient-to-t from-black via-black/10 to-transparent pt-12 pointer-events-none">
        <div className="w-full max-w-2xl px-6 relative pointer-events-auto">
          <AnimatePresence>
            {isPreppyMode && (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onSubmit={handleSendMessage}
                className="absolute left-6 right-6 bottom-full mb-6 z-50"
              >
                <input 
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Gemini anything..."
                  className="w-full bg-[#1c1f23]/90 backdrop-blur-2xl border border-white/5 rounded-[28px] px-6 py-4 text-white placeholder-white/30 outline-none focus:border-blue-500/40 transition-all shadow-4xl text-lg"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/40 transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          id="controls-container" 
          className="flex items-center p-1 bg-[#111827]/80 backdrop-blur-xl rounded-full border border-white/5 shadow-2xl scale-90 md:scale-100 pointer-events-auto"
        >
          {/* Typing/Edit Mode */}
          <div className="relative">
            {isPreppyMode && (
              <motion.div 
                layoutId="active-pill-bg"
                className="absolute inset-0 mic-active-gradient rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <button 
              id="edit-mode-btn"
              onClick={() => setIsPreppyMode(true)}
              className={`relative z-10 w-14 h-14 rounded-full transition-colors active:scale-95 flex items-center justify-center ${
                isPreppyMode 
                  ? 'bg-[#030712] m-[1.5px] w-[53px] h-[53px] text-blue-400' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <Pencil className="w-5 h-5" />
            </button>
            
            {isPreppyMode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-blue-500/10 rounded-full blur-md -z-10 pointer-events-none" 
              />
            )}
          </div>
          
          {/* Microphone/Voice Mode */}
          <div className="relative">
            {!isPreppyMode && (
              <motion.div 
                layoutId="active-pill-bg"
                className="absolute inset-0 mic-active-gradient rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <button 
              id="mic-mode-btn"
              onClick={toggleListening}
              className={`relative z-10 w-14 h-14 rounded-full transition-all duration-300 active:scale-90 flex items-center justify-center ${
                !isPreppyMode 
                  ? 'bg-[#030712] m-[1.5px] w-[53px] h-[53px]' 
                  : 'text-gray-500 hover:text-white'
              } ${isListening ? 'shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/30' : ''}`}
            >
              <Mic className={`w-6 h-6 transition-all duration-500 ${isListening ? 'text-blue-400 animate-pulse scale-110' : 'text-gray-400'}`} />
            </button>
            
            {!isPreppyMode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-blue-500/10 rounded-full blur-md -z-10 pointer-events-none" 
              />
            )}
          </div>
        </motion.div>
        
        {/* iOS Home Indicator */}
        <div className="mt-36 w-32 h-1 bg-white rounded-full opacity-100 shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
      </footer>
    </motion.div>
  );
}


