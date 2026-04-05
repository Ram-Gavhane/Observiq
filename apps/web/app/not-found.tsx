"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeft, LucideRadar, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  
  // Mouse position for the radial glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[oklch(0.12_0.015_240)] font-sans text-[oklch(0.98_0.005_240)] flex flex-col items-center justify-center selection:bg-white/20">
      {/* ─── Background Elements ─── */}
      
      {/* Interactive Radial Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          background: `radial-gradient(600px circle at ${smoothX}px ${smoothY}px, oklch(0.5_0.15_240 / 0.15), transparent 80%)`,
        }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
             backgroundSize: '40px 40px' 
           }} 
      />

      {/* Floating Particles (Simplified) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            initial={{ 
              x: Math.random() * 2000, 
              y: Math.random() * 2000,
            }}
            animate={{
              y: [null, Math.random() * -500],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
            }}
          />
        ))}
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Animated Brand Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl"
        >
          <LucideRadar className="h-8 w-8 text-white animate-pulse" />
        </motion.div>

        {/* 404 Heading with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <h1 className="text-[12rem] md:text-[20rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none">
            404
          </h1>
          {/* Subtle reflection/shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full h-12 bg-white/5 blur-3xl rounded-full opacity-50 px-20 px-20"></div>
        </motion.div>

        {/* Text Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-md space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Signal Lost
            </h2>
            <p className="text-[oklch(0.65_0.015_240)] text-lg leading-relaxed font-medium">
              We couldn't find the page you're looking for. It might have been moved, or it never existed in this dimension.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              asChild
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-semibold px-8 rounded-full h-12 transition-transform active:scale-95 group"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                Back to Dashboard
              </Link>
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.location.reload()}
              className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 font-semibold px-8 rounded-full h-12 transition-all active:scale-95 group"
            >
              <RefreshCcw className="h-4 w-4 mr-2 transition-transform group-hover:rotate-180 duration-500" />
              Retry Signal
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ─── Footer-like Link ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 z-10 flex items-center gap-4 text-xs font-mono tracking-widest uppercase"
      >
        <span>Error_Code: 0x404_NOT_FOUND</span>
        <div className="h-1 w-1 rounded-full bg-white/30" />
        <span>System: Observiq_v1.0</span>
      </motion.div>
    </div>
  );
}
