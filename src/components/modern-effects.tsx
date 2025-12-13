"use client";

import React, { useEffect, useState } from "react";

const ModernEffects = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: { clientX: any; clientY: any }) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Background grid effect */}
      <div className="fixed inset-0 z-[-1] bg-grid-pattern pointer-events-none opacity-5" />

      {/* Gradient orbs that follow cursor */}
      <div
        className="fixed w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 blur-3xl pointer-events-none"
        style={{
          left: `${mousePosition.x - 128}px`,
          top: `${mousePosition.y - 128}px`,
          transition: "transform 0.2s ease-out",
          transform: "translate3d(0, 0, 0)",
        }}
      />
      <div
        className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-primary/5 to-blue-500/5 blur-3xl pointer-events-none"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
          transition: "transform 0.5s ease-out",
          transform: "translate3d(0, 0, 0)",
        }}
      />

      {/* Custom styles injected into the page */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-size: 50px 50px;
          background-image: linear-gradient(
              to right,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            );
        }

        .card-gradient {
          position: relative;
          overflow: hidden;
        }

        .card-gradient::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(79, 70, 229, 0.03),
            transparent
          );
          transition: all 0.7s;
        }

        .card-gradient:hover::before {
          left: 100%;
        }

        .futuristic-border {
          position: relative;
        }

        .futuristic-border::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            45deg,
            rgba(79, 70, 229, 0.1),
            rgba(96, 165, 250, 0.1),
            rgba(79, 70, 229, 0.1)
          );
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
          pointer-events: none;
        }

        .hover-translate {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-translate:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05),
            0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }

        .animate-pulse-slow {
          animation: pulse 5s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
};

export default ModernEffects;
