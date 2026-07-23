import React, { useEffect } from 'react';

const ParticleTrail = () => {
  useEffect(() => {
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const handleClick = (e) => {
      const particleCount = 6;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'retro-particle';
        
        const size = Math.floor(Math.random() * 6) + 4;
        const color = ['#00f3ff', '#ff007f', '#00ff66', '#ffb700'][Math.floor(Math.random() * 4)];
        
        particle.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          box-shadow: 0 0 6px ${color};
          pointer-events: none;
          z-index: 10000;
          transition: transform 0.4s ease-out, opacity 0.4s ease-out;
        `;

        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = Math.floor(Math.random() * 30) + 15;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        requestAnimationFrame(() => {
          particle.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
          particle.style.opacity = '0';
        });

        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 450);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return null;
};

export default ParticleTrail;
