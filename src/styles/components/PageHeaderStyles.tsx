import styled from 'styled-components';

export const PageHeader = styled.header`
  width: 100%;
  padding: 16px 24px 12px;
  margin-bottom: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 18px 24px 14px;
    margin-bottom: 16px;
    gap: 6px;
  }
`;

export const PageTitle = styled.h1`
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.01em;
  line-height: 1.08;
  font-weight: 600;
`;

export const PageSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.75;
  font-size: clamp(0.95rem, 1.2vw, 1.05rem);
  line-height: 1.3;
`;
