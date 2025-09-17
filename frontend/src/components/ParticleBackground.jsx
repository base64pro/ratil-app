import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    // --- تم التعديل ليملأ الشاشة بالكامل ---
    fullScreen: {
      enable: true, 
      zIndex: -1 // وضع الجسيمات خلف كل العناصر
    },
    particles: {
      number: {
        value: 120, // عدد مناسب لتغطية الشاشة دون ازدحام
        density: {
          enable: true,
          area: 1200, 
        },
      },
      color: {
        value: "#00FFFF", 
      },
      twinkle: {
        particles: {
            enable: true,
            frequency: 0.05,
            opacity: 1
        }
      },
      shape: {
        type: "circle", // العودة للدائرة لمظهر أنعم
      },
      opacity: {
        value: { min: 0.1, max: 0.6 },
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: 3 },
      },
      links: {
        color: { value: "#00FFFF" }, 
        distance: 150,
        enable: true,
        opacity: 0.2, 
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.2, // سرعة انسيابية
        direction: "none",
        outModes: "out",
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse", 
        },
        // --- تفعيل تخليق الجسيمات عند الضغط ---
        onClick: {
          enable: true,
          mode: "push", 
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
        push: {
            quantity: 4 
        }
      },
    },
    detectRetina: true,
    background: {
      color: "transparent",
    },
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
    />
  );
};

export default ParticleBackground;

