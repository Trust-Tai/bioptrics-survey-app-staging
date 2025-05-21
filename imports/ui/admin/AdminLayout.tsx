import '../../../client/fonts.css';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaQuestionCircle, FaClipboardList, FaUsers, FaKey, FaSignOutAlt } from 'react-icons/fa';

const sidebarLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FaChartBar },
  { to: '/admin/surveys/all', label: 'Surveys', icon: FaClipboardList, submenu: [
    { to: '/admin/surveys/all', label: 'All Surveys' },
    { to: '/admin/surveys/goals', label: 'Survey Goals' },
    { to: '/admin/surveys/wps-framework', label: 'WPS Framework' },
    { to: '/admin/surveys/theme', label: 'Theme' },
  ] },
  { to: '/admin/questions', label: 'Questions', icon: FaQuestionCircle, submenu: [
    { to: '/admin/questions/all', label: 'Question Bank' },
    { to: '/admin/questions/builder', label: 'Question Builder' },
  ] },
  { to: '/admin/org-setup', label: 'Org Setup', icon: FaUsers },
  { to: '/admin/analytics', label: 'Analytics', icon: FaChartBar },
  { to: '/admin/setting', label: 'Setting', icon: FaKey, submenu: [
    // WPS Framework moved to Surveys
  ] },
];

const sidebarLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  color: '#fff',
  textDecoration: 'none',
  padding: '12px 24px',
  fontSize: 17,
  fontWeight: 500,
  borderRadius: 8,
  marginBottom: 6,
  transition: 'background 0.2s',
};
const iconStyle = { marginRight: 12, fontSize: 18 };

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [hovered, setHovered] = React.useState<number|null>(null);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'linear-gradient(180deg, #402C00 0%, #2D1F01 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 0',
        boxShadow: '2px 0 18px rgba(64,44,0,0.14)',
        borderRadius: 30,
        position: 'fixed',
        left: 0,
        top: 0,
        height: 'max-content',
        zIndex: 100,
        margin: 18,
        minHeight: '80vh',
      }}>
        <div style={{ fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 32, letterSpacing: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo.png" alt="newgold logo" style={{ width: 110, marginBottom: 16 }} />
        </div>
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {/* Render all links except Setting and Logout */}
            {sidebarLinks.slice(0, sidebarLinks.length - 2).map((link, idx) => (
              <React.Fragment key={link.to}>
                <li
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Link to={link.to} style={{
                    ...sidebarLinkStyle,
                    background: location.pathname === link.to || (link.submenu && link.submenu.some(s => location.pathname === s.to)) ? '#FFFFFF1A' : 'transparent',
                    position: 'relative',
                    zIndex: 2,
                    borderRadius: location.pathname === link.to || (link.submenu && link.submenu.some(s => location.pathname === s.to)) ? 0 : sidebarLinkStyle.borderRadius,
                  }}>
                    {link.icon && <link.icon style={iconStyle} />}
                    {link.label}
                  </Link>
                  {/* Inline submenu if parent is active, floating otherwise */}
                  {link.submenu && (
                    ((link.to === '/admin/surveys' && location.pathname.startsWith('/admin/surveys')) ||
                      (link.to === '/admin/questions' && location.pathname.startsWith('/admin/questions')))
                      ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginTop: 4 }}>
                          {link.submenu.map(sublink => (
                            <li key={sublink.to}>
                              <Link
                                to={sublink.to}
                                style={{
                                  ...sidebarLinkStyle,
                                  background: location.pathname === sublink.to ? '#FFFFFF1A' : 'transparent',
                                  color: location.pathname === sublink.to ? '#fff' : '#fff',
                                  marginLeft: 36,
                                  fontSize: 15,
                                  fontWeight: 500,
                                  borderRadius: location.pathname === sublink.to ? 0 : 6,
                                  marginBottom: 4,
                                }}
                              >
                                {sublink.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        hovered === idx && (
                          <ul
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: '100%',
                              minWidth: 180,
                              background: '#fff',
                              color: '#552a47',
                              borderRadius: 12,
                              boxShadow: '0 6px 32px #b0802b33',
                              padding: '14px 0',
                              margin: 0,
                              zIndex: 999,
                              listStyle: 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                            onMouseEnter={() => setHovered(idx)}
                            onMouseLeave={() => setHovered(null)}
                          >
                            {link.submenu.map(sublink => (
                              <li key={sublink.to}>
                                <Link
                                  to={sublink.to}
                                  style={{
                                    display: 'block',
                                    padding: '11px 28px',
                                    color: location.pathname === sublink.to ? '#fff' : '#552a47',
                                    background: location.pathname === sublink.to ? '#b8a06c' : 'transparent',
                                    borderRadius: 8,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    margin: '2px 0',
                                    transition: 'background 0.13s, color 0.13s',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {sublink.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )
                      )
                  )}
                </li>
              </React.Fragment>
            ))}
          </ul>
          {/* Spacer to push Setting and Logout to the bottom */}
          <div style={{ flex: 1 }} />
          {/* Settings and Logout section at the bottom */}
          <div style={{ marginTop: 36 }}>
            {/* Render Setting link (last sidebar link) */}
            <li
              style={{ position: 'relative', listStyle: 'none' }}
              onMouseEnter={() => setHovered(sidebarLinks.length - 1)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link to={sidebarLinks[sidebarLinks.length - 1].to} style={{
                ...sidebarLinkStyle,
                background: location.pathname.startsWith('/admin/setting') ? '#6e395e' : 'transparent',
                position: 'relative',
                zIndex: 2,
              }}>
                {(() => { const Icon = sidebarLinks[sidebarLinks.length - 1].icon; return Icon ? <Icon style={iconStyle} /> : null; })()}
                {sidebarLinks[sidebarLinks.length - 1].label}
              </Link>
              {/* Inline submenu for Setting if active */}
              {(() => {
  const lastSidebarLink = sidebarLinks[sidebarLinks.length - 1];
  if (lastSidebarLink?.submenu && location.pathname.startsWith('/admin/setting')) {
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginTop: 4 }}>
        {lastSidebarLink.submenu.map(sublink => (
          <li key={sublink.to}>
            <Link
              to={sublink.to}
              style={{
                ...sidebarLinkStyle,
                background: location.pathname === sublink.to ? '#e4f0fa' : 'transparent',
                color: location.pathname === sublink.to ? '#552a47' : '#fff',
                marginLeft: 36,
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              {sublink.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return null;
})()}

            </li>
            {/* Logout button */}
            <footer style={{ padding: '1.5rem 0 0 0' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: 17,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  borderRadius: 8,
                  marginBottom: 6,
                  transition: 'background 0.2s',
                  width: '100%',
                  textAlign: 'left',
                  boxShadow: '0 1px 4px rgba(90, 110, 234, 0.07)'
                }}
                onClick={() => {
                  localStorage.removeItem('admin_jwt');
                  window.location.href = '/admin-login';
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#b7a36a';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                <FaSignOutAlt style={iconStyle} />
                Logout
              </button>
            </footer>
          </div>
        </nav>
      </aside>
      <div style={{ flex: 1, background: '#FFF9EB', minHeight: '100vh', marginLeft: 220 }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
