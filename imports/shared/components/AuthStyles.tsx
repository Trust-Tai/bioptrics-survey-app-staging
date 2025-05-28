import styled from 'styled-components';

const PRIMARY_COLOR = '#552a47';

export const AuthBg = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
`;

export const AuthCard = styled.form`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  border: 1px solid #E8B73A66;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  width: 520px;
  max-width: 98vw;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 1;
`;

export const AuthTitle = styled.h2`
  font-family: 'Inter', Arial, sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${PRIMARY_COLOR};
  text-align: center;
`;

export const AuthInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

export const AuthInputIcon = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #b8b5bc;
  font-size: 1.2rem;
  pointer-events: none;
`;

export const AuthInput = styled.input`
  padding: 1rem 1.5rem 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #d2d6dc;
  width: 100%;
  font-size: 1rem;
  outline: none;
  &:focus {
    border-color: ${PRIMARY_COLOR};
    box-shadow: 0 0 0 2px #e5d6e0;
  }
`;

export const AuthInputAction = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #b8b5bc;
  font-size: 1.2rem;
  cursor: pointer;
  outline: none;
  padding: 0;
`;

export const AuthButton = styled.button<{ variant?: string }>`
  background: ${({ variant }) => variant === 'link' ? 'none' : `linear-gradient(90deg, ${PRIMARY_COLOR} 0%, #7c4f6a 100%)`};
  color: ${({ variant }) => variant === 'link' ? PRIMARY_COLOR : '#fff'};
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: ${({ variant }) => variant === 'link' ? '0.25rem 0.75rem' : '0.85rem 2.25rem'};
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, text-decoration 0.2s;
  margin-bottom: ${({ variant }) => variant === 'link' ? '0' : '0.5rem'};
  box-shadow: ${({ variant }) => variant === 'link' ? 'none' : '0 2px 8px rgba(90, 110, 234, 0.08)'};
  margin-left: ${({ variant }) => variant === 'link' ? '0.5rem' : '0'};
  font-weight: ${({ variant }) => variant === 'link' ? 600 : 600};
  text-decoration: ${({ variant }) => variant === 'link' ? 'none' : 'none'};
  &:hover {
    background: ${({ variant }) => variant === 'link' ? 'none' : `linear-gradient(90deg, #7c4f6a 0%, ${PRIMARY_COLOR} 100%)`};
    color: ${({ variant }) => variant === 'link' ? '#2e1624' : '#fff'};
    text-decoration: none;
  }
`;

export const AuthError = styled.div`
  color: #e74c3c;
  background: #fbeee7;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.95rem;
`;

export const AuthRow = styled.div`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.97rem;
`;
