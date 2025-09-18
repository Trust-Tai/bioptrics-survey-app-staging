import React from 'react';
import styled from 'styled-components';
import { FiRefreshCw, FiBarChart2 } from 'react-icons/fi';

interface ThankYouScreenProps {
  logo?: string;
  totalResponses: number;
  unansweredQuestions: number;
  completionPercentage: number;
  timeTaken: string;
  onTakeAgain?: () => void;
  onViewResults?: () => void;
  color?: string;
}

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  if (!color) return '#2c3e50';
  
  let usePound = false;
  
  if (color[0] === '#') {
    color = color.slice(1);
    usePound = true;
  }
  
  const num = parseInt(color, 16);
  
  let r = (num >> 16) + amount;
  r = Math.max(Math.min(255, r), 0);
  
  let g = ((num >> 8) & 0x00FF) + amount;
  g = Math.max(Math.min(255, g), 0);
  
  let b = (num & 0x0000FF) + amount;
  b = Math.max(Math.min(255, b), 0);
  
  return (usePound ? '#' : '') + (g | (r << 8) | (b << 16)).toString(16).padStart(6, '0');
};

// Convert hex color to RGB values for CSS variables
const hexToRgb = (hex: string): string => {
  if (!hex || hex === '') return '44, 62, 80'; // Default color (2c3e50)
  
  // Remove the # if present
  hex = hex.replace('#', '');
  
  try {
    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return `${r}, ${g}, ${b}`;
  } catch (error) {
    console.error('Error parsing color:', error);
    return '44, 62, 80'; // Default color (2c3e50)
  }
};

const ThankYouScreen: React.FC<ThankYouScreenProps> = ({
  logo = "/bioptrics_fixed_black.png",
  totalResponses,
  unansweredQuestions,
  completionPercentage,
  timeTaken,
  onTakeAgain,
  onViewResults,
  color = '#552A47'
}) => {
  return (
    <ThankYouContainer primaryColor={color}>
      <ConfettiLayer />
      <ThankYouHeader>
        <ThankYouIcon>
          <img 
            src={logo} 
            alt="Company Logo" 
          />
        </ThankYouIcon>
        
        <ThankYouTitle>Thank You</ThankYouTitle>
        <ThankYouMessage>
          Your responses have been successfully submitted. We appreciate your time and feedback.
        </ThankYouMessage>
      </ThankYouHeader>
      
      <StatsContainer>
        <StatCard primaryColor={color}>
          <StatIcon primaryColor={color}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">
              <mask id="a" width="40" height="40" x="0" y="0" maskUnits="userSpaceOnUse" style={{maskType: 'luminance'}}>
                <path fill="#fff" d="M0 0h40v40H0V0Z"/>
              </mask>
              <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.172" mask="url(#a)">
                <path d="M13.905 8.124c-3.66 2.41-6.01 6.147-6.01 10.343 0 7.27 7.056 13.163 15.76 13.163 2.6 0 5.053-.526 7.215-1.458M39.298 20.078a11.13 11.13 0 0 0 .117-1.611c0-7.27-7.056-13.163-15.76-13.163-2.797 0-5.425.609-7.702 1.676"/>
                <path d="M27.059 31.32s2.833 2.318 7.835 3.096c.785.122 1.38-.755 1.047-1.53l-1.933-4.5.002.003c2.181-1.589 3.834-3.672 4.708-6.04M33.509 22.509l-1.972-7.075c-.167-.6-1.016-.6-1.183 0l-1.971 7.075M29.059 20.078h3.77M16.554 22.512a2.047 2.047 0 0 1-2.046-2.047v-3.438a2.047 2.047 0 0 1 4.093 0v3.438c0 1.13-.916 2.047-2.047 2.047ZM17.14 20.633l1.885 1.879M24.822 16.224c0 .686-1.243 1.955-1.243 1.955s-1.243-1.269-1.243-1.955a1.243 1.243 0 1 1 2.486 0ZM25.865 18.959s-.48.952-.794 1.629c-1.232 2.659-3.164 2.162-3.401.984-.284-1.405 1.911-3.393 1.911-3.393l2.678 4.33M14.406 32.458a12.68 12.68 0 0 0 4.213-1.515M8.894 13.851C4.098 15.002.59 18.692.59 23.068c0 2.884 1.524 5.47 3.937 7.228l.001-.002-1.408 3.278c-.243.565.19 1.204.763 1.115 3.636-.566 5.698-2.247 5.708-2.255.799.147 1.629.225 2.48.225"/>
              </g>
            </svg>
          </StatIcon>
          <StatContent>
            <StatValue primaryColor={color}>{totalResponses}</StatValue>
            <StatLabel primaryColor={color}>TOTAL Questions answered</StatLabel>
            <StatSublabel primaryColor={color}>Questions answered</StatSublabel>
          </StatContent>
        </StatCard>
        
        <StatCard primaryColor={color}>
          <StatIcon primaryColor={color}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="45" fill="none" viewBox="0 0 40 45">
              <path fill="currentColor" d="M33.788 30.295c-2.022-.513-4.082-.439-6.118-.705-1.015-.148-1.703-.492-1.887-.944a.606.606 0 0 0-.857-.302L20 31.067l-4.968-2.745a.608.608 0 0 0-.823.232 1.99 1.99 0 0 1-1.858 1.036c-.71.06-1.47.128-2.254.173-1.31.048-2.61.226-3.885.532A8.458 8.458 0 0 0 0 38.434v5.387a.607.607 0 0 0 .608.61h38.785a.608.608 0 0 0 .607-.608v-5.389a8.459 8.459 0 0 0-6.212-8.139Zm-8.771-.613c.495.565 1.34.945 2.488 1.11.297.039.59.07.882.095a825.778 825.778 0 0 1-3.708 4.105l-3.621-3.12 3.959-2.19Zm-12.655 1.121a3.229 3.229 0 0 0 2.562-1.153l4.018 2.222-3.622 3.12c-.745-.82-2.395-2.638-3.722-4.119.26-.022.515-.045.764-.07Zm26.423 12.413h-5.202v-3.733a.607.607 0 1 0-1.215 0v3.733H7.632v-3.733a.608.608 0 1 0-1.215 0v3.733H1.215v-4.782a7.24 7.24 0 0 1 5.318-6.967c1.16-.28 2.344-.442 3.536-.484 1.772 1.993 4.721 5.23 4.752 5.264a.616.616 0 0 0 .846.052l3.725-3.212v4.002a.607.607 0 1 0 1.216 0v-4.002l3.725 3.212a.616.616 0 0 0 .846-.052c.516-.563 3.745-4.126 4.73-5.238 1.193.11 2.441.151 3.558.458a7.24 7.24 0 0 1 5.318 6.967v4.782ZM12.107 10.545h.125a1.954 1.954 0 0 0 1.91-1.638 5.944 5.944 0 0 1 11.793 1.26c-.12 3.151-2.856 5.714-6.1 5.714h-1.227a.609.609 0 0 0-.607.608v3.65a1.996 1.996 0 0 0 3.992 0v-.467A9.937 9.937 0 1 0 10.198 8.287a1.938 1.938 0 0 0 1.91 2.257v.001Zm-.71-2.056a8.722 8.722 0 1 1 9.899 10.073.608.608 0 0 0-.518.6v.977a.781.781 0 0 1-1.562 0v-3.043h.62c3.888 0 7.17-3.088 7.315-6.882a7.159 7.159 0 0 0-14.205-1.516.74.74 0 0 1-.714.632h-.125a.722.722 0 0 1-.71-.841ZM20 23.555a1.998 1.998 0 0 0-1.996 1.996v.468a1.996 1.996 0 1 0 3.992 0v-.468A1.998 1.998 0 0 0 20 23.555Zm.781 2.465a.78.78 0 1 1-1.562 0v-.47a.781.781 0 1 1 1.562 0v.47Z"/>
              <path fill="currentColor" d="M19.998 38.566a.607.607 0 0 0-.607.608v1.785a.607.607 0 1 0 1.215 0v-1.785a.608.608 0 0 0-.608-.608Z"/>
            </svg>
          </StatIcon>
          <StatContent>
            <StatValue primaryColor={color}>{unansweredQuestions}</StatValue>
            <StatLabel primaryColor={color}>UNANSWERED QUESTIONS</StatLabel>
            <StatSublabel primaryColor={color}>Empty answer fields</StatSublabel>
          </StatContent>
        </StatCard>
        
        <StatCard primaryColor={color}>
          <StatIcon primaryColor={color}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 40 40">
              <path fill="currentColor" d="M37.362 0H2.638A2.652 2.652 0 0 0 0 2.638v25.447h1.702V2.638c0-.51.426-.936.936-.936h10.128v35.234h1.702V14.468h11.064v11.064H15.83v1.702h9.702v11.064H2.638a.945.945 0 0 1-.936-.936v-7.575H0v7.575A2.652 2.652 0 0 0 2.638 40h34.724A2.652 2.652 0 0 0 40 37.362V8.51h-1.702v17.02H27.234V14.469h9.787v-1.702h-9.787V1.702h10.128c.51 0 .936.426.936.936v4.17H40v-4.17A2.652 2.652 0 0 0 37.362 0Zm.936 27.234v10.128c0 .51-.426.936-.936.936H27.234V27.234h11.064ZM25.532 12.766H14.468V1.702h11.064v11.064Z"/>
            </svg>
          </StatIcon>
          <StatContent>
            <StatValue primaryColor={color}>{completionPercentage}%</StatValue>
            <StatLabel primaryColor={color}>COMPLETION</StatLabel>
            <StatSublabel primaryColor={color}>Survey completed</StatSublabel>
          </StatContent>
        </StatCard>
        
        <StatCard primaryColor={color}>
          <StatIcon primaryColor={color}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="34" fill="none" viewBox="0 0 40 34">
              <path fill="currentColor" d="M28.274 21.376a.656.656 0 0 1-.426-.154l-4.954-4.013a.69.69 0 0 1-.25-.53V5.585a.68.68 0 0 1 1.36 0v10.774l4.7 3.809a.68.68 0 0 1-.453 1.209h.023ZM16.503 24.099H8.925a.68.68 0 0 1 0-1.359h7.578a.68.68 0 0 1 0 1.359ZM13.429 16.807H.679a.68.68 0 0 1 0-1.359h12.75a.68.68 0 0 1 0 1.359ZM8.576 9.434h-4.53a.68.68 0 1 1 0-1.359h4.53a.68.68 0 0 1 0 1.359ZM23.324 29.587a.68.68 0 0 1-.68-.679v-.136a.68.68 0 0 1 1.36 0v.136a.68.68 0 0 1-.68.68ZM35.98 17.36h-.137a.68.68 0 0 1 0-1.359h.136a.679.679 0 1 1 0 1.359Z"/>
              <path fill="currentColor" d="M7.484 19.56a.675.675 0 0 1-.67-.583 16.118 16.118 0 0 1-.15-2.297.68.68 0 1 1 1.36 0c0 .705.048 1.408.144 2.106a.68.68 0 0 1-.598.766l-.086.009ZM23.322 33.351a16.535 16.535 0 0 1-11.997-5.095.68.68 0 0 1 .978-.933 15.166 15.166 0 0 0 11.019 4.67 15.314 15.314 0 0 0 7.115-28.87A15.313 15.313 0 0 0 9.594 9.887a.68.68 0 0 1-1.218-.607A16.676 16.676 0 1 1 23.322 33.35ZM5.095 24.099H3.86a.68.68 0 0 1 0-1.359h1.236a.68.68 0 0 1 0 1.359Z"/>
              <path fill="currentColor" d="M8.102 12.233a.683.683 0 0 1-.612-.974l.942-1.97a.68.68 0 0 1 1.228.584l-.942 1.975a.684.684 0 0 1-.616.385Z"/>
            </svg>
          </StatIcon>
          <StatContent>
            <StatValue primaryColor={color} style={{ fontSize: '48px' }}>{timeTaken}</StatValue>
            <StatLabel primaryColor={color}>TIME TAKEN</StatLabel>
            <StatSublabel primaryColor={color}>Total duration</StatSublabel>
          </StatContent>
        </StatCard>
      </StatsContainer>
      
      <ThankYouActions>
        {onTakeAgain && (
          <RestartButton primaryColor={color} onClick={onTakeAgain}>
            <ButtonIcon>
              <FiRefreshCw size={16} />
            </ButtonIcon>
            Take Survey Again
          </RestartButton>
        )}
        
        {onViewResults && (
          <ViewResultsButton primaryColor={color} onClick={onViewResults}>
            <ButtonIcon>
              <FiBarChart2 size={16} />
            </ButtonIcon>
            Back to Results
          </ViewResultsButton>
        )}
      </ThankYouActions>
    </ThankYouContainer>
  );
};

// Styled components
const ThankYouContainer = styled.div<{ primaryColor?: string }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  padding: 0;
  margin: 0;
  font-family: 'Inter', sans-serif;
  color: var(--text-color, #333);
  animation: fadeIn 0.6s ease-out;
  background: linear-gradient(180deg, #FFFFFF 0%, #F8F2F6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  z-index: 1000;
  box-sizing: border-box;
`;

const ThankYouHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
  max-width: 783px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  padding: 0 20px;
`;

const ThankYouIcon = styled.div`
  margin: 0 auto;
  width: 200px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.5s ease-out;
  margin-bottom: 40px;
  margin-top: 60px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ThankYouTitle = styled.h1`
  font-size: 100px;
  font-weight: 400;
  margin-bottom: 16px;
  color: var(--primary-color, #000000);
  font-family: 'Aesthetica Demo', cursive;
  line-height: 1.1;
  letter-spacing: 0;
  text-align: center;
  font-style: italic;
  margin: 0;
  padding: 0;
`;

const ThankYouMessage = styled.p`
  font-size: 30px;
  line-height: 40px;
  color: rgba(51, 51, 51, 1);
  max-width: 719px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  margin-bottom: 40px;
  font-weight: 400;
  text-align: center;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 50px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 783px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
  position: relative;
  z-index: 1;
`;

const StatCard = styled.div<{ primaryColor?: string }>`
  background: #ffffff;
  border-radius: 10px;
  padding: 18px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  border: 1px solid ${props => props.primaryColor ? `${props.primaryColor}25` : '#e9dce6'};
  color: ${props => props.primaryColor || 'var(--primary-color, #333)'};
  transition: all 0.2s ease;
  min-width: 200px;
  width: 100%;
  position: relative;
`;

const StatIcon = styled.div<{ primaryColor?: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background-color: ${props => props.primaryColor ? `${props.primaryColor}20` : 'var(--primary-color-light, #f3e8ff)'};
  color: ${props => props.primaryColor || 'var(--primary-color, #552a47)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatContent = styled.div`
  width: 100%;
`;

const StatValue = styled.h3<{ primaryColor?: string }>`
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 8px;
  color: ${props => props.primaryColor || 'var(--primary-color, #4A2B46)'};
  font-family: 'Inter', sans-serif;
  line-height: 1;
  white-space: nowrap;
`;

const StatLabel = styled.p<{ primaryColor?: string }>`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
  color: ${props => props.primaryColor || 'var(--primary-color, #4A2B46)'};
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatSublabel = styled.span<{ primaryColor?: string }>`
  font-size: 14px;
  color: ${props => props.primaryColor ? `${props.primaryColor}90` : 'var(--text-color, #6b7280)'};
  font-family: 'Inter', sans-serif;
  font-weight: 400;
`;

const ThankYouActions = styled.div`
  text-align: center;
  margin-top: 30px;
  width: 100%;
  max-width: 783px;
  display: flex;
  justify-content: center;
  gap: 20px;
  position: relative;
  z-index: 1;
`;

const RestartButton = styled.button<{ primaryColor?: string }>`
  background-color: white;
  color: ${props => props.primaryColor || 'var(--primary-color, #4A2B46)'};
  border: 1px solid ${props => props.primaryColor ? `${props.primaryColor}80` : 'var(--primary-color, #4A2B46)'};
  border-radius: var(--button-radius, 30px);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(var(--primary-color-rgb, 74, 43, 70), 0.1);
  font-family: 'Inter', sans-serif;
  width: auto;
  min-width: 160px;
  
  &:hover {
    background-color: ${props => props.primaryColor ? `${props.primaryColor}10` : '#f9f5fb'};
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(var(--primary-color-rgb, 74, 43, 70), 0.15);
  }
`;

const ViewResultsButton = styled(RestartButton)`
  background-color: ${props => props.primaryColor || 'var(--primary-color, #4A2B46)'};
  color: #ffffff;
  border: none;
  
  &:hover {
    background-color: ${props => props.primaryColor ? adjustColor(props.primaryColor, -20) : 'var(--button-hover, #3A2136)'};
    color: #ffffff;
  }
`;

const ButtonIcon = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

export default ThankYouScreen;

// Decorative confetti overlay (top area)
const ConfettiLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 55vh;
  pointer-events: none;
  opacity: 0.3;
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 1500px 600px;
  z-index: 0;
  /* Lightweight inline SVG with pastel confetti */
  background-image: url("data:image/svg+xml;utf8,\
  <svg xmlns='http://www.w3.org/2000/svg' width='1500' height='600' viewBox='0 0 1500 600'>\
    <defs>\
      <radialGradient id='fade' cx='50%' cy='0%' r='80%'>\
        <stop offset='0%' stop-color='rgba(255,255,255,0)'/>\
        <stop offset='100%' stop-color='rgba(255,255,255,1)'/>\
      </radialGradient>\
    </defs>\
    <rect fill='url(%23fade)' x='0' y='300' width='1500' height='300'/>\
    <g opacity='0.8'>\
      <circle cx='100' cy='120' r='8' fill='%23FFD166'/>\
      <circle cx='240' cy='90' r='6' fill='%23A8DADC'/>\
      <circle cx='380' cy='160' r='7' fill='%23F4A261'/>\
      <circle cx='520' cy='70' r='5' fill='%23BDE0FE'/>\
      <circle cx='660' cy='130' r='8' fill='%23FFAFCC'/>\
      <circle cx='800' cy='80' r='7' fill='%2390BE6D'/>\
      <circle cx='940' cy='150' r='6' fill='%238D99AE'/>\
      <circle cx='1080' cy='100' r='8' fill='%23E9C46A'/>\
      <circle cx='1220' cy='170' r='6' fill='%23CED4DA'/>\
      <circle cx='1360' cy='120' r='7' fill='%23F08080'/>\
      <rect x='170' y='180' width='8' height='8' fill='%23FFCAD4' rx='2'/>\
      <rect x='310' y='110' width='10' height='10' fill='%2390CAF9' rx='3'/>\
      <rect x='450' y='190' width='9' height='9' fill='%23B9FBC0' rx='3'/>\
      <rect x='590' y='100' width='8' height='8' fill='%23E5989B' rx='2'/>\
      <rect x='730' y='180' width='10' height='10' fill='%23CDEAC0' rx='3'/>\
      <rect x='870' y='110' width='8' height='8' fill='%23F7D794' rx='2'/>\
      <rect x='1010' y='190' width='9' height='9' fill='%23A3CEF1' rx='3'/>\
      <rect x='1150' y='100' width='10' height='10' fill='%23E0AFA0' rx='3'/>\
      <rect x='1290' y='170' width='8' height='8' fill='%23BDB2FF' rx='2'/>\
      <polygon points='200,80 210,95 190,95' fill='%23E76F51'/>\
      <polygon points='340,140 350,155 330,155' fill='%23A5D6A7'/>\
      <polygon points='480,60 490,75 470,75' fill='%239957AD'/>\
      <polygon points='620,150 630,165 610,165' fill='%23F1A7A1'/>\
      <polygon points='760,90 770,105 750,105' fill='%2381B29A'/>\
      <polygon points='900,160 910,175 890,175' fill='%23F2CC8F'/>\
      <polygon points='1040,70 1050,85 1030,85' fill='%238AB17D'/>\
      <polygon points='1180,140 1190,155 1170,155' fill='%23B5838D'/>\
      <polygon points='1320,90 1330,105 1310,105' fill='%2394D2BD'/>\
    </g>\
  </svg>");
`;
