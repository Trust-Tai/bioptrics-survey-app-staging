import '../../../client/fonts.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useOrganization } from '/imports/features/organization/contexts/OrganizationContext';
import { TermLabel } from '/imports/shared/components';
import { useTracker } from 'meteor/react-meteor-data';
import { Layers } from '/imports/api/layers';
import { 
  FaChartPie, 
  FaDatabase, 
  FaUserCheck, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaBuilding,
  FaTag
} from 'react-icons/fa';
import { 
  FiBarChart2, 
  FiClipboard, 
  FiUsers, 
  FiLogOut
} from 'react-icons/fi';
import styled from 'styled-components';

// Function to get sidebar links with customized terminology and dynamic tags
const getSidebarLinks = (getTerminology: (key: any) => string, surveyTags: any[] = [], questionTags: any[] = []) => [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2 },
  { to: '/admin/surveys', label: `${getTerminology('surveyLabel')}s`, icon: FiClipboard, submenu: [
    { to: '/admin/surveys/builder', label: 'Create Survey' },
    { to: '/admin/surveys/all', label: `Manage ${getTerminology('surveyLabel')}s` },
    { to: '/admin/surveys/theme', label: 'Theme' },
    // Dynamically add survey tags as submenu items
    // ...(surveyTags.map(tag => ({ 
    //   to: `/admin/surveys/tag/${tag._id}`, 
    //   label: `${tag.name}`,
    //   isTag: true
    // })))
  ] },
  { to: '/admin/questions/all', label: `${getTerminology('questionLabel')} Bank`, icon: FaDatabase, submenu: [
    { to: '/admin/questions/all', label: `All ${getTerminology('questionLabel')}s` },
    { to: '/admin/questions/builder', label: `${getTerminology('questionLabel')} Builder` },
    // Dynamically add question tags as submenu items
    // ...(questionTags.map(tag => ({ 
    //   to: `/admin/questions/tag/${tag._id}`, 
    //   label: `${tag.name}`,
    //   isTag: true
    // })))
  ] },
  { to: '/admin/tags/manage', label: 'Tags & Classifications', icon: FaTag },
  { to: '/admin/analytics', label: 'Analytics', icon: FaChartPie, submenu: [
    { to: '/admin/analytics/dashboard', label: 'Dashboard' },
    { to: '/admin/analytics/compare-cohorts', label: 'Compare Cohorts' },
    { to: '/admin/analytics/export-reports', label: 'Export Reports' },
  ] },
  // Participants moved to be a submenu under Org Setup
  // Users and Settings moved to be submenus under Org Setup
  { to: '/admin/org-setup', label: 'Org Setup', icon: FaBuilding, submenu: [
    { to: '/admin/org-setup/participants', label: `${getTerminology('participantLabel')}s` },
    { to: '/admin/org-setup/users', label: 'Users', submenu: [
      { to: '/admin/org-setup/users/all', label: 'All Users' },
      { to: '/admin/org-setup/users/add', label: 'Add New' },
    ] },
    { to: '/admin/org-setup/settings', label: 'Settings', submenu: [
      { to: '/admin/org-setup/settings/password', label: 'Change Password' },
      { to: '/admin/org-setup/settings/timezone', label: 'Choose Time Zone' },
      { to: '/admin/org-setup/settings/ui-preferences', label: 'UI Preferences' },
    ] },
    { to: '/admin/org-setup/roles', label: 'Permissions / Roles' },
    { to: '/admin/org-setup/branding', label: 'Branding / Custom Fields' },
  ] },
  { to: '/logout', label: 'Logout', icon: FiLogOut },
];

interface SidebarProps {
  collapsed: boolean;
}

const SubmenuFlyout = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--color-sidebar, linear-gradient(180deg, #552a47 0%, #3d1f33 100%));
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
  position: absolute;
  left: 230px;
  top: 0;
  min-width: 180px;
  z-index: 9999;
  overflow: visible;
  border: 1px solid rgba(0,0,0,0.1);
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
  color: var(--color-sidebar-text, #fff);
`;
const SubmenuItem = styled(Link)<{active?: boolean}>`
  display: block;
  color: var(--color-sidebar-text, #fff);
  text-decoration: none;
  font-size: 15px;
  padding: 10px 24px;
  background: ${({active}) => active ? 'rgba(255,255,255,0.13)' : 'transparent'};
  border-left: ${({active}) => active ? '4px solid var(--color-secondary)' : '4px solid transparent'};
  font-weight: ${({active}) => active ? 700 : 500};
  transition: background 0.15s, border-left 0.15s, color 0.15s;
  &:hover {
    background: rgba(255,255,255,0.18);
    color: var(--color-sidebar-text, #fff);
  }
`;


const Sidebar = styled.aside<SidebarProps>`
  width: ${props => props.collapsed ? '72px' : '240px'};
  background: var(--color-sidebar, linear-gradient(180deg, #552a47 0%, #3d1f33 100%));
  color: var(--color-sidebar-text, #ffffff);
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
  color: var(--color-sidebar-text, #fff);
  text-decoration: none;
  padding: ${props => props.collapsed ? '14px 0' : '14px 24px'};
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: ${props => props.active ? '700' : '500'};
  margin-bottom: 0.25rem;
  transition: background 0.2s;
  position: relative;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  border-left: ${props => props.active ? '4px solid var(--color-secondary)' : '4px solid transparent'};
  background: ${props => props.active ? 'rgba(255,255,255,0.08)' : 'transparent'};
  
  &:hover {
    background: rgba(255,255,255,0.08);
    color: var(--color-sidebar-text, #fff);
  }
`;

const NavButton = styled.button<NavItemProps>`
  display: flex;
  align-items: center;
  color: var(--color-sidebar-text, #fff);
  text-decoration: none;
  padding: ${props => props.collapsed ? '14px 0' : '14px 24px'};
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: ${props => props.active ? '700' : '500'};
  margin-bottom: 0.25rem;
  transition: background 0.2s;
  position: relative;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  border-left: ${props => props.active ? '4px solid var(--color-secondary)' : '4px solid transparent'};
  background: ${props => props.active ? 'rgba(255,255,255,0.08)' : 'transparent'};
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: left;
  
  &:hover {
    background: rgba(255,255,255,0.08);
    color: var(--color-sidebar-text, #fff);
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
  transition: margin-left 0.3s ease, width 0.3s ease;
  height: 100%;
  
  @media (max-width: 1024px) {
    margin-left: 0;
    width: 100%;
  }
`;

/**
 * AdminLayout component that provides the admin dashboard shell with navigation
 */
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get organization settings for customized terminology
  const { getTerminology } = useOrganization();
  
  // Subscribe to layers collection and filter active tags by location
  const { surveyTags, questionTags, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('layers.all');
    const allTags = Layers.find({ active: true }).fetch();
    
    // Filter out tags with specific names that should not appear in the menu
    const excludedTagNames = ['DataTag', 'ABC', 'Category', 'DropDown', 'Test', 'DataA'];
    
    return {
      surveyTags: allTags.filter(tag => 
        tag.location === 'surveys' && !excludedTagNames.includes(tag.name)
      ),
      questionTags: allTags.filter(tag => 
        tag.location === 'questions' && !excludedTagNames.includes(tag.name)
      ),
      isLoading: !handle.ready(),
    };
  }, []);
  
  // Generate sidebar links with customized terminology and dynamic tags
  const sidebarLinks = getSidebarLinks(getTerminology, surveyTags, questionTags);
  React.useEffect(() => {
    const prevBg = document.body.style.background;
    const prevOverflowX = document.body.style.overflowX;
    document.body.style.background = '#FFFFFF';
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
  
  // Ensure the Question Bank submenu is expanded when on any of its pages
  React.useEffect(() => {
    // Find the index of the Question Bank menu item
    const questionBankIndex = sidebarLinks.findIndex(link => link.to === '/admin/questions');
    if (questionBankIndex !== -1 && location.pathname.startsWith('/admin/questions')) {
      setExpandedMenus(prev => ({ ...prev, [questionBankIndex]: true }));
    }
  }, [location.pathname, sidebarLinks]);

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
                          {sublink.isTag ? '🏷️ ' : ''}{sublink.label}
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
                            {sublink.isTag ? '🏷️ ' : ''}{sublink.label}
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
      <div style={{ flex: 1, minHeight: '100vh', marginLeft: collapsed ? 72 : 264, transition: 'margin-left 0.3s', width: 'calc(100% - 264px)' }}>
        {/* Main Content */}
        <MainContent sidebarCollapsed={collapsed}>
          {children}
        </MainContent>
      </div>
    </div>
  );
};

export default AdminLayout;
