import React from 'react';
import styled from 'styled-components';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Award, Settings, Search, User, ChevronDown } from 'lucide-react';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

const Sidebar = styled.aside`
  width: 220px;
  background: #1e3a5f;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
`;

const Logo = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h1 {
    color: white;
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 1px;
  }
  
  span {
    color: #06b6d4;
    font-size: 12px;
    display: block;
    margin-top: 2px;
  }
`;

const NavMenu = styled.nav`
  padding: 16px 12px;
  flex: 1;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  transition: all 0.2s;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background: #f97316;
    color: white;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const UserDropdown = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  
  svg {
    color: #6b7280;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  width: 280px;
  
  input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    width: 100%;
    color: #374151;
    
    &::placeholder {
      color: #9ca3af;
    }
  }
  
  svg {
    color: #9ca3af;
    width: 18px;
    height: 18px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
`;

const ToggleButton = styled.button<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => props.isActive ? 'white' : 'transparent'};
  color: ${props => props.isActive ? '#111827' : '#6b7280'};
  box-shadow: ${props => props.isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    color: #111827;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
`;

export const LearnerLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin/lms');
  };

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>
          <h1>BIOPTRICS</h1>
          <span>Pulse</span>
        </Logo>
        <NavMenu>
          <NavItem to="/admin/lms/learner" end>
            <LayoutDashboard />
            Dashboard
          </NavItem>
          <NavItem to="/admin/lms/learner/courses">
            <BookOpen />
            Learning
          </NavItem>
          <NavItem to="/admin/lms/learner/certificates">
            <Award />
            Certificates
          </NavItem>
          <NavItem to="/admin/lms/learner/settings">
            <Settings />
            Settings
          </NavItem>
        </NavMenu>
      </Sidebar>

      <MainContent>
        <Header>
          <HeaderLeft>
            <UserDropdown>
              <User size={18} />
              User
              <ChevronDown size={16} />
            </UserDropdown>
            <SearchBar>
              <Search />
              <input type="text" placeholder="Search" />
            </SearchBar>
          </HeaderLeft>
          <HeaderRight>
            <ViewToggle>
              <ToggleButton onClick={handleAdminClick}>
                <Settings size={16} />
                Admin
              </ToggleButton>
              <ToggleButton isActive>
                <User size={16} />
                User
              </ToggleButton>
            </ViewToggle>
          </HeaderRight>
        </Header>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};
