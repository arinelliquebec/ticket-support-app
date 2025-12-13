"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function FuturisticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mouse follower effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Particle network animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Particle configuration
    const particles: Particle[] = [];
    const particleCount = Math.floor(window.innerWidth / 30);
    const connectionDistance = 150;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Don't render on server
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Particle Network Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />

      {/* Cyber Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none cyber-grid opacity-30" />

      {/* Mesh Gradient Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none mesh-gradient-2026 opacity-70" />

      {/* Aurora Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none aurora-2026 opacity-50" />

      {/* Mouse Follower Orbs */}
      <motion.div
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)",
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
        animate={{
          x: 0,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 30,
          mass: 0.5,
        }}
      />

      <motion.div
        className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)",
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
        }}
        animate={{
          x: 0,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 30,
          damping: 20,
          mass: 1,
        }}
      />

      {/* Corner Accents */}
      <div className="fixed top-0 left-0 w-64 h-64 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-32 h-px bg-gradient-to-r from-primary/50 to-transparent" />
        <div className="absolute top-0 left-0 h-32 w-px bg-gradient-to-b from-primary/50 to-transparent" />
      </div>

      <div className="fixed top-0 right-0 w-64 h-64 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-32 h-px bg-gradient-to-l from-primary/50 to-transparent" />
        <div className="absolute top-0 right-0 h-32 w-px bg-gradient-to-b from-primary/50 to-transparent" />
      </div>

      <div className="fixed bottom-0 left-0 w-64 h-64 pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 w-32 h-px bg-gradient-to-r from-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 h-32 w-px bg-gradient-to-t from-primary/50 to-transparent" />
      </div>

      <div className="fixed bottom-0 right-0 w-64 h-64 pointer-events-none z-0">
        <div className="absolute bottom-0 right-0 w-32 h-px bg-gradient-to-l from-primary/50 to-transparent" />
        <div className="absolute bottom-0 right-0 h-32 w-px bg-gradient-to-t from-primary/50 to-transparent" />
      </div>

      {/* Floating Orbs */}
      <motion.div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="fixed top-1/2 right-1/3 w-64 h-64 rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 60%)",
          filter: "blur(30px)",
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, -15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Scan Line Effect (subtle) */}
      <motion.div
        className="fixed left-0 right-0 h-px pointer-events-none z-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.15), transparent)",
        }}
        animate={{
          top: ["0%", "100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Vignette Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.4) 100%)",
        }}
      />
    </>
  );
}

