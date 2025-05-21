import styled from 'styled-components';

const DashboardBg = styled.div`
  background: #fff;
  min-height: 100vh;
  padding: 2.5rem 2.5rem 4rem 2.5rem; /* top right bottom left */
  box-shadow: 0px 0px 10px 0px #0000001A;
  border-radius: 20px;
  @media (max-width: 1200px) {
    width: 100vw;
    max-width: 100vw;
    margin-left: 0;
    border-radius: 0;
    padding: 1.5rem 1rem 2rem 1rem;
  }
`;

export default DashboardBg;
