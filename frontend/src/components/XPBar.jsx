import React from 'react';

const XPBar = ({ profile }) => {
  if (!profile) return null;

  const getPrevThreshold = (level) => {
    if (level <= 1) return 0;
    const l = level;
    return (l - 1) * 100 + (l - 2) * (l - 1) * 25;
  };

  const prevThreshold = getPrevThreshold(profile.level);
  const totalInLevel = profile.next_level_xp - prevThreshold;
  const currentInLevel = profile.xp - prevThreshold;
  const percent = Math.max(0, Math.min(100, (currentInLevel / (totalInLevel || 1)) * 100));

  // Retro block bar generation (e.g. 15 blocks total)
  const totalBlocks = 15;
  const activeBlocks = Math.round((percent / 100) * totalBlocks);
  const blockString = '█'.repeat(activeBlocks) + '░'.repeat(totalBlocks - activeBlocks);

  return (
    <div 
      className="xp-bar-container" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem', 
        background: 'rgba(6, 7, 10, 0.6)', 
        border: '1px solid var(--border-dark)', 
        padding: '0.4rem 0.8rem',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Level Badge */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ 
          fontSize: '0.75rem', 
          fontFamily: 'var(--font-header)', 
          color: 'var(--neon-cyan)',
          textShadow: '0 0 3px var(--neon-cyan)'
        }}>
          ⚡ LVL_{profile.level.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Progress Blocks and Numeric XP */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <div style={{ 
          fontSize: '0.7rem', 
          fontFamily: 'monospace', 
          color: 'var(--neon-cyan)',
          letterSpacing: '1px'
        }}>
          {blockString}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {profile.xp} / {profile.next_level_xp} XP
        </div>
      </div>

      {/* Streak Badge */}
      {profile.current_streak > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', borderLeft: '1px dashed var(--border-dark)', paddingLeft: '1rem' }}>
          <span style={{ fontSize: '1rem' }}>🔥</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-header)', color: 'var(--neon-amber)' }}>
              {profile.current_streak} DAY
            </span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              STREAK
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default XPBar;
