import { motion } from "motion/react";

export default function DotBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base Grid - Subtle dots */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Larger Mesh Grid - Very faint connections */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Subtle Node Circles */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1.5px, transparent 0)`,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Static Glows for depth */}
      <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]" />
      
      {/* Animated Glowing Accents - Reduced and refined */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: -20, 
            opacity: 0 
          }}
          animate={{ 
            y: ["0%", "120%"],
            opacity: [0, 0.4, 0]
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 20,
            ease: "linear"
          }}
          className="absolute w-[2px] h-[2px] bg-blue-400 rounded-full blur-[1px]"
        />
      ))}
      
      {/* Vignette mask to fade the dots towards the edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-transparent to-[#030712]" />
    </div>
  );
}
