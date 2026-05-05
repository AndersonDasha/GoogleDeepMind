import { motion } from "motion/react";
import { useAudioFrequency } from "../hooks/useAudioFrequency";

interface WaveAnimationProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  hasInteracted?: boolean;
  hasMessages?: boolean;
}

export default function WaveAnimation({ 
  isListening = false, 
  isSpeaking = false,
  hasInteracted = false,
  hasMessages = false 
}: WaveAnimationProps) {
  const intensity = useAudioFrequency();
  
  // Wave configuration
  const waves = [
    { base: 180, amp: 20, speed: 0.45, color: "#3b82f6", opacity: 0.7 },
    { base: 210, amp: 30, speed: 0.65, color: "#60a5fa", opacity: 0.8 },
    { base: 235, amp: 18, speed: 0.95, color: "#93c5fd", opacity: 0.9 },
  ];

  const getWavePath = (baseHeight: number, amplitude: number, speed: number, phase: number) => {
    const time = Date.now() / 1000;
    const h = baseHeight;
    
    // Manual pulses for voice states - calibrated for smooth, polished transitions
    const speakingPulse = isSpeaking ? (0.15 + Math.sin(time * 8) * 0.06) : 0;
    const listeningPulse = isListening ? 0.25 : 0;
    const effectiveIntensity = Math.max(intensity, speakingPulse, listeningPulse);
    
    // Scale amplitude slightly - base movement always gentle and steady
    const interactionMultiplier = hasInteracted ? 1 : 0.7;
    const activeMultiplier = (isListening || isSpeaking) 
      ? (1.3 + effectiveIntensity * 6) 
      : (0.85 * interactionMultiplier + Math.sin(time * 1.5) * 0.08);
    
    const a = amplitude * activeMultiplier;
    
    // Shift is dampened to avoid jumping, feels liquid and smooth
    const shift = (isListening || isSpeaking) ? (effectiveIntensity * 70) : (45 * interactionMultiplier); 
    
    // Smooth liquid rolling
    const rollSpeed = hasInteracted ? 0.45 : 0.25;
    const cp1x = 360 + Math.cos(time * rollSpeed + phase) * shift;
    const cp1y = h - a * Math.sin(time * speed + phase);
    const cp2x = 1080 + Math.sin(time * rollSpeed + phase) * shift;
    const cp2y = h + a * Math.sin(time * (speed * 0.7) + phase + Math.PI / 2);
    
    return `M-40,${h} C${cp1x},${cp1y} ${cp2x},${cp2y} 1480,${h} L1480,600 L-40,600 Z`;
  };

  return (
    <motion.div 
      initial={false}
      animate={{
        y: 0,
        opacity: hasInteracted ? 1 : 0.8,
      }}
      transition={{ 
        opacity: { duration: 1.2 }
      }}
      className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none"
    >
      {/* Background radial glow */}
      <motion.div 
        animate={{
          opacity: (isListening || isSpeaking) ? [0.4, 0.7, 0.4] : (hasInteracted ? 0.3 : 0.15),
          scale: (intensity > 0.1 || isSpeaking) ? [1, 1.2, 1] : 1,
          backgroundColor: isSpeaking ? "rgba(219, 234, 254, 0.25)" : "rgba(147, 197, 253, 0.15)"
        }}
        transition={{ duration: 2, repeat: (isListening || isSpeaking) ? Infinity : 0 }}
        className="absolute inset-x-0 bottom-0 h-full blur-[140px] translate-y-32"
      />
      
      <svg
        viewBox="0 0 1440 320"
        className="absolute bottom-0 left-0 w-full h-[80%] transform translate-y-12"
        preserveAspectRatio="none"
      >
        {waves.map((wave, i) => (
          <motion.path
            key={i}
            animate={{
              d: [
                getWavePath(wave.base, wave.amp, wave.speed, i * Math.PI / 2),
                getWavePath(wave.base, wave.amp * 1.3, wave.speed, i * Math.PI / 2 + Math.PI),
                getWavePath(wave.base, wave.amp, wave.speed, i * Math.PI / 2),
              ],
              fill: isSpeaking ? "#ffffff" : (isListening ? "#60a5fa" : wave.color)
            }}
            transition={{ 
              d: { duration: (hasInteracted ? 6 : 14) - i * 1.5, repeat: Infinity, ease: "easeInOut" },
              fill: { duration: 0.6 }
            }}
            fill={wave.color}
            fillOpacity={(isListening || isSpeaking) ? wave.opacity : (hasInteracted ? wave.opacity * 0.9 : wave.opacity * 0.4)}
          />
        ))}
      </svg>
      
      {/* Subtle grounding gradient */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent pointer-events-none" />
    </motion.div>
  );
}
