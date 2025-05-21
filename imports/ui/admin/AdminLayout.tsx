import '../../../client/fonts.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaChartPie, 
  FaDatabase, 
  FaUserCheck, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes
} from 'react-icons/fa';
import { 
  FiBarChart2, 
  FiClipboard, 
  FiUsers, 
  FiLogOut
} from 'react-icons/fi';
import styled from 'styled-components';

// Sidebar navigation items matching the requested structure
const sidebarLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2 },
  { to: '/admin/analytics', label: 'Analytics', icon: FaChartPie },
  { to: '/admin/surveys', label: 'Surveys', icon: FiClipboard, submenu: [
    { to: '/admin/surveys/all', label: 'All Surveys' },
    { to: '/admin/surveys/builder', label: 'Survey Builder' },
    { to: '/admin/surveys/goals', label: 'Survey Goals' },
    { to: '/admin/surveys/wps-framework', label: 'WPS Framework' },
    { to: '/admin/surveys/theme', label: 'Theme' },
  ] },
  { to: '/admin/questions', label: 'Question Bank', icon: FaDatabase, submenu: [
    { to: '/admin/questions/all', label: 'All Questions' },
    { to: '/admin/questions/builder', label: 'Question Builder' },
  ] },
  { to: '/admin/org-setup', label: 'Org Setup', icon: FiUsers },
  { to: '/admin/participants', label: 'Participants', icon: FaUserCheck },
  { to: '/admin/settings', label: 'Settings', icon: FaCog },
  { to: '/logout', label: 'Logout', icon: FiLogOut },
];

// Styled components for the sidebar
interface SidebarProps {
  collapsed: boolean;
}

const SubmenuFlyout = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  background: #2D1F01;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
  position: absolute;
  left: 230px;
  top: 0;
  min-width: 180px;
  z-index: 9999;
  overflow: visible;
  border: 1px solid #b7a36a33;
  pointer-events: auto;
`;

const SubmenuInline = styled.ul`
  list-style: none;
  margin: 0 0 0 0;
  padding: 0;
  background: rgba(255,255,255,0.06);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  overflow: hidden;
`;
const SubmenuItem = styled(Link)<{active?: boolean}>`
  display: block;
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  padding: 10px 24px;
  background: ${({active}) => active ? 'rgba(255,255,255,0.13)' : 'transparent'};
  border-left: ${({active}) => active ? '4px solid #b7a36a' : '4px solid transparent'};
  font-weight: ${({active}) => active ? 700 : 500};
  transition: background 0.15s, border-left 0.15s;
  &:hover {
    background: rgba(255,255,255,0.18);
  }
`;


const Sidebar = styled.aside<SidebarProps>`
  width: ${props => props.collapsed ? '72px' : '240px'};
  background: linear-gradient(180deg, #402C00 0%, #2D1F01 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 1.5px 6px rgba(0,0,0,0.08);
  border-radius: 22px;
  margin: 32px 0 32px 24px;
  position: fixed;
  left: 0;
  top: 0;
  height: max-content;
  z-index: 120;
  transition: width 0.3s ease, box-shadow 0.3s, border-radius 0.3s, margin 0.3s;
  overflow-x: visible;
  overflow-y: visible;
  background-clip: padding-box;

  @media (max-width: 1024px) {
    width: ${props => props.collapsed ? '0' : '240px'};
    transform: ${props => props.collapsed ? 'translateX(-100%)' : 'translateX(0)'};
    margin: 0;
    border-radius: 0 22px 22px 0;
    height: 100vh;
    top: 0;
  }
`;



const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
`;

interface NavItemProps {
  active: boolean;
  collapsed: boolean;
}

const NavItem = styled(Link)<NavItemProps>`
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  padding: ${props => props.collapsed ? '14px 0' : '14px 24px'};
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: ${props => props.active ? '700' : '500'};
  margin-bottom: 0.25rem;
  transition: background 0.2s;
  position: relative;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  border-left: ${props => props.active ? '4px solid #b7a36a' : '4px solid transparent'};
  background: ${props => props.active ? 'rgba(255,255,255,0.08)' : 'transparent'};
  
  &:hover {
    background: rgba(255,255,255,0.08);
  }
`;

const NavButton = styled.button<NavItemProps>`
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  padding: ${props => props.collapsed ? '14px 0' : '14px 24px'};
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: ${props => props.active ? '700' : '500'};
  margin-bottom: 0.25rem;
  transition: background 0.2s;
  position: relative;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  border-left: ${props => props.active ? '4px solid #b7a36a' : '4px solid transparent'};
  background: ${props => props.active ? 'rgba(255,255,255,0.08)' : 'transparent'};
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: left;
  
  &:hover {
    background: rgba(255,255,255,0.08);
  }
`;

interface IconProps {
  collapsed: boolean;
}

const NavIcon = styled.div<IconProps>`
  font-size: 24px;
  margin-right: ${props => props.collapsed ? '0' : '16px'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface LabelProps {
  collapsed: boolean;
}

const NavLabel = styled.span<LabelProps>`
  display: ${props => props.collapsed ? 'none' : 'block'};
  white-space: nowrap;
`;

const Tooltip = styled.div`
  position: absolute;
  left: 72px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
`;

interface ToggleButtonProps {
  collapsed: boolean;
}

const ToggleButton = styled.button<ToggleButtonProps>`
  position: fixed;
  left: ${props => props.collapsed ? '1rem' : '245px'};
  top: 1rem;
  background: #402C00;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  transition: left 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: none;
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

interface MainContentProps {
  sidebarCollapsed: boolean;
}

const MainContent = styled.main<MainContentProps>`
  padding: 2rem;
  width: 100%;
  transition: margin-left 0.3s ease, width 0.3s ease;
  
  @media (max-width: 1024px) {
    margin-left: 0;
    width: 100%;
  }
`;

/**
 * AdminLayout component that provides the admin dashboard shell with navigation
 */
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    const prevBg = document.body.style.background;
    const prevOverflowX = document.body.style.overflowX;
    document.body.style.background = '#FFF9EB';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.background = prevBg;
      document.body.style.overflowX = prevOverflowX;
    };
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  // Add expandedMenus state for submenu toggling
  const [expandedMenus, setExpandedMenus] = useState<{ [idx: number]: boolean }>({});

  function handleLogout() {
    if (window.confirm('Are you sure you want to log out?')) {
      navigate('/logout');
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar collapsed={collapsed}>
        <Logo>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: 2 }}>Admin</span>
        </Logo>
        <nav>
          {sidebarLinks.map((link, idx) => {
            const isActive = location.pathname.startsWith(link.to);
            const hasSubmenu = !!link.submenu;
            return (
              <div
                key={link.to}
                style={{ position: 'relative', overflow: 'visible' }}
                onMouseEnter={() => {
                  // Only allow hover/flyout if not showing inline submenu
                  const isInline = !collapsed && (location.pathname.startsWith(link.to) || (link.submenu && link.submenu.some((sublink: any) => location.pathname.startsWith(sublink.to))));
                  if (!isInline) setHovered(idx);
                }}
                onMouseLeave={() => setHovered(null)}
              >
                <NavItem
                  to={link.to}
                  active={isActive}
                  collapsed={collapsed}
                  tabIndex={0}
                  aria-haspopup={hasSubmenu ? 'true' : undefined}
                  aria-expanded={hasSubmenu ? hovered === idx : undefined}
                  onClick={e => {
                    if (link.to === '/logout') {
                      e.preventDefault();
                      handleLogout();
                    }
                  }}
                  onKeyDown={e => {
                    if (hasSubmenu && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setHovered(hovered === idx ? null : idx);
                    }
                  }}
                >
                  <NavIcon collapsed={collapsed}>{React.createElement(link.icon)}</NavIcon>
                  <NavLabel collapsed={collapsed}>{link.label}</NavLabel>
                  {hasSubmenu && !collapsed && (
                    <span style={{ marginLeft: 'auto', fontSize: 14, opacity: 0.7, transform: hovered === idx ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▸
                    </span>
                  )}
                  {collapsed && hovered === idx && (
                    <Tooltip style={{ opacity: 1, visibility: 'visible' }}>
                      {link.label}
                    </Tooltip>
                  )}
                </NavItem>
                {/* Submenu inline if active, flyout if hovered */}
                {hasSubmenu && !collapsed && (
                  // Only show flyout on hover if not showing inline
                  (!((location.pathname.startsWith(link.to) || link.submenu.some((sublink: any) => location.pathname.startsWith(sublink.to)))) && hovered === idx)
                  ? (
                    <SubmenuFlyout>
                      {link.submenu.map((sublink: any) => (
                        <SubmenuItem
                          key={sublink.to}
                          to={sublink.to}
                          active={location.pathname.startsWith(sublink.to)}
                        >
                          {sublink.label}
                        </SubmenuItem>
                      ))}
                    </SubmenuFlyout>
                  ) : (
                    (location.pathname.startsWith(link.to) || link.submenu.some((sublink: any) => location.pathname.startsWith(sublink.to))) && (
                      <SubmenuInline>
                        {link.submenu.map((sublink: any) => (
                          <SubmenuItem
                            key={sublink.to}
                            to={sublink.to}
                            active={location.pathname.startsWith(sublink.to)}
                          >
                            {sublink.label}
                          </SubmenuItem>
                        ))}
                      </SubmenuInline>
                    )
                  )
                )}
              </div>
            );
          })}
        </nav>
      </Sidebar>
      <div style={{ flex: 1, minHeight: '100vh', marginLeft: collapsed ? 72 : 264, transition: 'margin-left 0.3s' }}>
        {/* Main Content */}
        <MainContent sidebarCollapsed={collapsed}>
          {children}
        </MainContent>
      </div>
    </div>
  );
};

export default AdminLayout;
