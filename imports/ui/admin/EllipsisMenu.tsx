import React, { useState, useRef, useEffect } from 'react';

interface EllipsisMenuProps {
  onDuplicate?: () => void;
}

const EllipsisMenu: React.FC<EllipsisMenuProps> = ({ onDuplicate }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', fontSize: 22, color: '#552a47', display: 'flex', alignItems: 'center' }}
        title="More options"
      >
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 30,
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          minWidth: 140,
          zIndex: 1000,
          padding: '6px 0',
        }}>
          {onDuplicate && <button onClick={() => { setOpen(false); onDuplicate(); }} style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: '#28211e', fontSize: 15, padding: '9px 18px', textAlign: 'left', cursor: 'pointer' }}>Duplicate</button>}
        </div>
      )}
    </div>
  );
};

export default EllipsisMenu;
