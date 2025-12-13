"use client";

import { useEffect, useRef } from "react";

interface EnhancedAnimatedBackgroundProps {
  variant?: "particles" | "gradient" | "matrix" | "tech";
  density?: "low" | "medium" | "high";
  speed?: "slow" | "medium" | "fast";
  color?: "blue" | "purple" | "green" | "cyan" | "primary";
  opacity?: number;
}

export const EnhancedAnimatedBackground = ({
  variant = "particles",
  density = "medium",
  speed = "medium",
  color = "primary",
  opacity = 0.3,
}: EnhancedAnimatedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Create canvas element programmatically
  useEffect(() => {
    // Clean up any existing canvas first
    if (document.querySelector(".animated-background-canvas")) {
      document.querySelector(".animated-background-canvas")?.remove();
    }

    const canvas = document.createElement("canvas");
    canvas.className = `fixed inset-0 z-[-2] bg-transparent pointer-events-none animated-background-canvas`;
    canvas.style.opacity = opacity.toString();
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    return () => {
      if (canvas && document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, [opacity]);

  // Set up and animate the canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    let animationFrameId: number;

    // Configure color
    const getColor = () => {
      switch (color) {
        case "blue":
          return "rgba(59, 130, 246, 0.5)"; // blue-500
        case "purple":
          return "rgba(139, 92, 246, 0.5)"; // purple-500
        case "green":
          return "rgba(16, 185, 129, 0.5)"; // green-500
        case "cyan":
          return "rgba(6, 182, 212, 0.5)"; // cyan-500
        case "primary":
        default:
          return "rgba(79, 70, 229, 0.5)"; // indigo-600
      }
    };

    // Configure density
    const getDensity = () => {
      switch (density) {
        case "low":
          return Math.max(15, window.innerWidth / 80);
        case "high":
          return Math.max(50, window.innerWidth / 25);
        case "medium":
        default:
          return Math.max(30, window.innerWidth / 40);
      }
    };

    // Configure animation speed
    const getSpeed = () => {
      switch (speed) {
        case "slow":
          return 0.2;
        case "fast":
          return 0.8;
        case "medium":
        default:
          return 0.4;
      }
    };

    // Set up animation based on variant
    switch (variant) {
      case "particles": {
        // Particle animation
        type Particle = {
          x: number;
          y: number;
          size: number;
          speedX: number;
          speedY: number;
        };

        const particles: Particle[] = [];
        const particleCount = getDensity();
        const baseSpeed = getSpeed();
        const particleColor = getColor();

        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * baseSpeed,
            speedY: (Math.random() - 0.5) * baseSpeed,
          });
        }

        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Update and draw particles
          particles.forEach((particle) => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Boundary check with bounce
            if (particle.x < 0 || particle.x > canvas.width)
              particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height)
              particle.speedY *= -1;

            // Draw particle
            ctx.fillStyle = particleColor;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          });

          // Connect particles with lines
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 100) {
                const opacity = 1 - distance / 100;
                ctx.strokeStyle = particleColor.replace(
                  "0.5",
                  `${opacity * 0.15}`
                );
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }

          animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        break;
      }

      case "matrix": {
        // Matrix-like falling characters animation
        const fontSize = 12;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = [];
        const baseSpeed = getSpeed() * 3;
        const matrixColor = getColor();

        // Initialize drops at random positions above the canvas
        for (let i = 0; i < columns; i++) {
          drops[i] = Math.random() * -canvas.height;
        }

        const characters = "01";

        const animate = () => {
          // Add semi-transparent black rectangle to create fade effect
          ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = matrixColor;
          ctx.font = `${fontSize}px monospace`;

          // Loop through drops
          for (let i = 0; i < drops.length; i++) {
            // Draw a random character
            const char = characters.charAt(
              Math.floor(Math.random() * characters.length)
            );
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            // Move the drop down
            drops[i] += baseSpeed;

            // Reset drop to top with random offset when it reaches bottom
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
              drops[i] = 0;
            }
          }

          animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        break;
      }

      case "tech": {
        // Technical pattern background
        const gridSize = 20;
        const dotSize = 1;
        const baseSpeed = getSpeed();
        const techColor = getColor();

        // Create a grid of dots
        const grid: { x: number; y: number; pulse: number; speed: number }[] =
          [];

        for (let x = 0; x < canvas.width; x += gridSize) {
          for (let y = 0; y < canvas.height; y += gridSize) {
            grid.push({
              x,
              y,
              pulse: Math.random() * Math.PI * 2, // Random starting point for pulse
              speed: 0.02 + Math.random() * 0.03 * baseSpeed, // Random pulse speed
            });
          }
        }

        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw and update each dot
          grid.forEach((dot) => {
            const size = dotSize + Math.sin(dot.pulse) * dotSize;

            ctx.fillStyle = techColor;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
            ctx.fill();

            // Connect some dots
            for (const other of grid) {
              const dx = dot.x - other.x;
              const dy = dot.y - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < gridSize * 2) {
                const opacity = 1 - distance / (gridSize * 2);
                ctx.strokeStyle = techColor.replace("0.5", `${opacity * 0.15}`);
                ctx.lineWidth = 0.3;
                ctx.beginPath();
                ctx.moveTo(dot.x, dot.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
              }
            }

            // Update pulse
            dot.pulse += dot.speed;
          });

          animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        break;
      }

      case "gradient":
      default: {
        // Animated gradient background
        let hue = 0;
        const baseSpeed = getSpeed() * 0.5;

        const animate = () => {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Create gradient
          const gradient = ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
          );
          gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.2)`);
          gradient.addColorStop(0.5, `hsla(${hue + 40}, 100%, 50%, 0.1)`);
          gradient.addColorStop(1, `hsla(${hue + 80}, 100%, 50%, 0.2)`);

          // Fill canvas with gradient
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Update hue
          hue = (hue + baseSpeed) % 360;

          animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        break;
      }
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, density, speed, color]);

  // No DOM element needed here since we create it in useEffect
  return null;
};

export default EnhancedAnimatedBackground;
