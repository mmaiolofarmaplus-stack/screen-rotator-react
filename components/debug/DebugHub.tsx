import React, { useState } from 'react';
import { DebugHotSale }  from './DebugHotSale';
import { DebugLauncher } from './DebugLauncher';

type Mode = 'hs' | 'fp';

export const DebugHub: React.FC = () => {
  const [mode, setMode] = useState<Mode>('hs');

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {mode === 'hs' ? <DebugHotSale /> : <DebugLauncher />}

      {/* Mode toggle */}
      <button
        onClick={() => setMode(m => m === 'hs' ? 'fp' : 'hs')}
        style={{
          position: 'absolute', bottom: 24, left: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 8,
          background: mode === 'hs'
            ? 'rgba(0,53,166,0.85)'
            : 'rgba(252,91,49,0.85)',
          border: `1px solid ${mode === 'hs' ? '#DDED59' : 'rgba(255,255,255,0.25)'}`,
          borderRadius: 10, padding: '7px 16px',
          color: mode === 'hs' ? '#DDED59' : '#FFFFFF',
          fontSize: 11, fontWeight: 700,
          fontFamily: "'Inter',sans-serif",
          letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: 'pointer', backdropFilter: 'blur(10px)',
        }}
      >
        <span style={{ fontSize: 14 }}>{mode === 'hs' ? '⊞' : '🔥'}</span>
        {mode === 'hs' ? 'FarmaPlus Screens' : 'Hot Sale Screens'}
      </button>
    </div>
  );
};
