import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';


const Sidebar = ({ history, loadingHistory, onSelectHistory, currentHistoryId, onNewChat, onDeleteHistory, onRenameHistory, isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useContext(AuthContext);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRenameStart = (item) => {
    setRenamingId(item._id);
    setRenameValue(item.title || '');
    setOpenMenuId(null);
  };

  const handleRenameSubmit = (id) => {
    if (renameValue.trim()) {
      onRenameHistory(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(id);
    } else if (e.key === 'Escape') {
      setRenamingId(null);
      setRenameValue('');
    }
  };

  const filteredHistory = history.filter(item => 
    (item.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      width: isCollapsed ? '60px' : '260px',
      height: '100%',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      transition: 'width 0.3s ease-in-out',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '0.5rem 0 1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', gap: '0.5rem' }}>
        {!isCollapsed && (
          <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            <Logo width={28} height={28} />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.35rem',
            borderRadius: 'var(--border-radius-sm)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/>
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onNewChat}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <svg style={{marginRight: '8px'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Chat
          </button>

          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.45rem 0.45rem 2rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--text-tertiary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '0.25rem', letterSpacing: '0.05em' }}>Previous Searches</h3>
        
        {loadingHistory ? (
           <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '0.5rem' }}>Loading...</p>
        ) : filteredHistory.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '0.25rem' }}>
            {searchQuery ? 'No matching chats.' : 'No history yet.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {filteredHistory.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: currentHistoryId === item._id ? 'var(--bg-tertiary)' : 'transparent',
                  borderRadius: 'var(--border-radius-md)',
                  transition: 'background var(--transition-fast)',
                  paddingRight: '0.25rem',
                  position: 'relative'
                }}
                onMouseEnter={(e) => { if(currentHistoryId !== item._id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={(e) => { if(currentHistoryId !== item._id) e.currentTarget.style.background = 'transparent'; }}
              >
                {renamingId === item._id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(item._id)}
                    onKeyDown={(e) => handleRenameKeyDown(e, item._id)}
                    style={{
                      flex: 1,
                      border: '1px solid var(--text-tertiary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--border-radius-md)',
                      outline: 'none',
                      fontFamily: 'inherit',
                      margin: '0.25rem'
                    }}
                  />
                ) : (
                  <button
                    onClick={() => onSelectHistory(item)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      padding: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title || item.query || 'New Chat'}
                  </button>
                )}

                {/* Dropdown Menu Button */}
                {renamingId !== item._id && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === item._id ? null : item._id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.3rem',
                        borderRadius: 'var(--border-radius-sm)',
                        transition: 'all var(--transition-fast)'
                      }}
                      title="More options"
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === item._id && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 4px)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-md)',
                        boxShadow: 'var(--card-shadow-hover)',
                        zIndex: 100,
                        minWidth: '140px',
                        padding: '0.3rem',
                        animation: 'fadeIn 0.15s ease-out'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameStart(item);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.65rem',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            borderRadius: 'var(--border-radius-sm)',
                            transition: 'background var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onDeleteHistory(item._id);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.65rem',
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            borderRadius: 'var(--border-radius-sm)',
                            transition: 'background var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {openMenuId && (
        <div 
          onClick={() => setOpenMenuId(null)} 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
        />
      )}

      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '1rem', 
        borderTop: '1px solid var(--border-color)', 
        display: 'flex', 
        flexDirection: isCollapsed ? 'column' : 'row',
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'space-between',
        gap: isCollapsed ? '0.5rem' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            minWidth: '32px',
            borderRadius: '50%', 
            background: '#000000', 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold', 
            fontSize: '0.85rem',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <span style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
              {user?.username}
            </span>
          )}
        </div>
        <button 
          onClick={logout}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: 'var(--text-secondary)',
            padding: '0.3rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
          title="Logout"
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
