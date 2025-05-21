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
  { to: '/admin/surveys/all', label: 'Surveys', icon: FiClipboard },
  { to: '/admin/questions', label: 'Question Bank', icon: FaDatabase },
  { to: '/admin/org-setup', label: 'Org Setup', icon: FiUsers },
  { to: '/admin/participants', label: 'Participants', icon: FaUserCheck },
  { to: '/admin/settings', label: 'Settings', icon: FaCog },
  { to: '/logout', label: 'Logout', icon: FiLogOut },
];

// Styled components for the sidebar
interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = styled.aside<SidebarProps>`
  width: ${props => props.collapsed ? '72px' : '240px'};
  background: linear-gradient(180deg, #402C00 0%, #2D1F01 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: width 0.3s ease;
  overflow-x: hidden;
  overflow-y: auto;
  
  @media (max-width: 1024px) {
    width: ${props => props.collapsed ? '0' : '240px'};
    transform: ${props => props.collapsed ? 'translateX(-100%)' : 'translateX(0)'};
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
  margin-left: ${props => props.sidebarCollapsed ? '72px' : '240px'};
  padding: 2rem;
  width: calc(100% - ${props => props.sidebarCollapsed ? '72px' : '240px'});
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
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  
  // Auto-collapse the sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle logout action
  const handleLogout = () => {
    // In a real app, you would call auth.signOut() here
    console.log('Logging out...');
    // Redirect to login page
    navigate('/login');
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      {/* Toggle Button (visible on mobile) */}
      <ToggleButton 
        onClick={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
      >
        {collapsed ? <FaBars /> : <FaTimes />}
      </ToggleButton>
      
      {/* Sidebar */}
      <Sidebar collapsed={collapsed}>
        <Logo>
          <img 
            src="/logo.png" 
            alt="BIOPTRICS logo" 
            style={{ 
              width: collapsed ? '40px' : '120px',
              transition: 'width 0.3s ease'
            }} 
          />
        </Logo>
        
        <nav style={{ flex: 1 }}>
          {sidebarLinks.map((link, idx) => {
            // Check if the current path matches this link
            const isActive = location.pathname === link.to || 
                             (link.to !== '/logout' && location.pathname.startsWith(link.to));
            
            return (
              <div 
                key={link.label}
                onMouseEnter={() => setHoveredItem(idx)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ position: 'relative' }}
              >
                {link.to === '/logout' ? (
                  // Render a button for logout
                  <NavButton 
                    active={isActive} 
                    collapsed={collapsed}
                    onClick={handleLogout}
                  >
                    <NavIcon collapsed={collapsed}>
                      <link.icon />
                    </NavIcon>
                    <NavLabel collapsed={collapsed}>{link.label}</NavLabel>
                    
                    {/* Tooltip shown on hover when sidebar is collapsed */}
                    {collapsed && hoveredItem === idx && (
                      <Tooltip style={{ opacity: 1, visibility: 'visible' }}>
                        {link.label}
                      </Tooltip>
                    )}
                  </NavButton>
                ) : (
                  // Render a link for normal navigation
                  <NavItem 
                    to={link.to}
                    active={isActive} 
                    collapsed={collapsed}
                  >
                    <NavIcon collapsed={collapsed}>
                      <link.icon />
                    </NavIcon>
                    <NavLabel collapsed={collapsed}>{link.label}</NavLabel>
                    
                    {/* Tooltip shown on hover when sidebar is collapsed */}
                    {collapsed && hoveredItem === idx && (
                      <Tooltip style={{ opacity: 1, visibility: 'visible' }}>
                        {link.label}
                      </Tooltip>
                    )}
                  </NavItem>
                )}
              </div>
            );
          })}
          {/* Navigation items are rendered above */}
        </nav>
      </Sidebar>

      {/* Main Content */}
      <MainContent sidebarCollapsed={collapsed}>
        {children}
      </MainContent>
    </div>
  );
};

export default AdminLayout;
