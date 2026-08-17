import React from 'react';
import { Award, Lock, CheckCircle2 } from 'lucide-react';

const AchievementsView = ({ profile }) => {
  if (!profile) return null;

  const achievementsList = [
    {
      id: 'first_task',
      title: 'SYS_INITIATED',
      desc: 'Complete your first task to award XP and initialize the matrix.',
      icon: '👾',
      unlocked: profile.xp > 0,
    },
    {
      id: 'streak_3',
      title: 'STREAK_STRIKER',
      desc: 'Maintain a task completion streak of 3 consecutive days.',
      icon: '🔥',
      unlocked: profile.longest_streak >= 3,
    },
    {
      id: 'level_5',
      title: 'MATRIX_ASCENSION',
      desc: 'Earn enough XP to ascend to Level 5 status.',
      icon: '🚀',
      unlocked: profile.level >= 5,
    },
    {
      id: 'mission_commander',
      title: 'MISSION_COMMANDER',
      desc: 'Complete an entire multi-objective AI planned mission.',
      icon: '🎯',
      unlocked: profile.xp >= 250, // Proxy completion or mission XP bonus
    },
  ];

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;

  return (
    <div className="retro-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--neon-amber)', paddingBottom: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1rem', color: 'var(--neon-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-header)' }}>
          🏆 SYSTEM_ACHIEVEMENTS ({unlockedCount} / {achievementsList.length})
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          LONGEST_STREAK: {profile.longest_streak} DAYS
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {achievementsList.map((ach) => (
          <div
            key={ach.id}
            className="retro-card"
            style={{
              padding: '1.25rem',
              backgroundColor: ach.unlocked ? 'rgba(255, 183, 0, 0.04)' : 'rgba(10, 11, 16, 0.6)',
              borderColor: ach.unlocked ? 'var(--neon-amber)' : 'var(--border-dark)',
              borderStyle: ach.unlocked ? 'solid' : 'dashed',
              opacity: ach.unlocked ? 1 : 0.6,
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              boxShadow: ach.unlocked ? '0 0 10px rgba(255, 183, 0, 0.15)' : 'none'
            }}
          >
            {/* Icon Column */}
            <div 
              style={{ 
                fontSize: '2rem', 
                width: '50px', 
                height: '50px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: ach.unlocked ? 'rgba(255, 183, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                border: ach.unlocked ? '1px solid var(--neon-amber)' : '1px dashed var(--border-dark)',
                borderRadius: '4px'
              }}
            >
              {ach.unlocked ? ach.icon : <Lock size={18} color="var(--text-muted)" />}
            </div>

            {/* Description Column */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h3 
                  style={{ 
                    fontSize: '0.8rem', 
                    color: ach.unlocked ? 'var(--neon-amber)' : 'var(--text-muted)', 
                    fontFamily: 'var(--font-header)',
                    margin: 0
                  }}
                  className={ach.unlocked ? 'crt-glow' : ''}
                >
                  {ach.title}
                </h3>
                {ach.unlocked && <CheckCircle2 size={12} color="var(--neon-green)" />}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.2rem' }}>
                {ach.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsView;
