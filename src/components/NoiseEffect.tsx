import React, { useEffect, useRef } from 'react';

type ThemeType = 'bunny' | 'water';

interface GradientBackgroundProps {
  theme: ThemeType;
  children: React.ReactNode;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ theme, children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Gradient colors for each theme
  const gradients = {
    bunny: {
      colors: [
        { offset: 0, color: 'rgba(249, 240, 251, 1)' },  // Light pink
        { offset: 0.5, color: 'rgba(255, 230, 250, 1)' }, // Slightly different pink
        { offset: 1, color: 'rgba(244, 226, 246, 1)' }   // Another pink variation
      ],
      direction: { x: 0, y: 1 } // top to bottom
    },
    water: {
      colors: [
        { offset: 0, color: 'rgba(99, 33, 238, 1)' },    // Deep blue/purple
        { offset: 0.5, color: 'rgba(120, 50, 255, 1)' }, // Different purple
        { offset: 1, color: 'rgba(80, 20, 200, 1)' }     // Darker purple
      ],
      direction: { x: 1, y: 0 } // left to right
    }
  };

  // Draw gradient on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        drawGradient();
      }
    };

    const drawGradient = () => {
      const currentGradient = gradients[theme];
      const { width, height } = canvas;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(
        0, 
        0, 
        width * currentGradient.direction.x, 
        height * currentGradient.direction.y
      );
      
      // Add color stops
      currentGradient.colors.forEach(({ offset, color }) => {
        gradient.addColorStop(offset, color);
      });
      
      // Fill with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };
    
    // Initial setup
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme]);

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: '24px',
      overflow: 'hidden' 
    }}>
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />
      <div style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;