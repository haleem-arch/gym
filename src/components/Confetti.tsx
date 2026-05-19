

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Confetti = ({ count = 30 }: { count?: number }) => {
  const particles = Array.from({ length: count }).map((_, i) => {
    // Random angle between 0 and 360
    const angle = Math.random() * Math.PI * 2;
    // Random distance
    const velocity = 50 + Math.random() * 100;
    
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    const rot = Math.random() * 360;
    
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = 4 + Math.random() * 6; // 4px to 10px

    return (
      <div
        key={i}
        className="confetti-particle"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          // @ts-ignore - Setting CSS variables for the animation
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          '--rot': `${rot}deg`
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-50">
      {particles}
    </div>
  );
};
