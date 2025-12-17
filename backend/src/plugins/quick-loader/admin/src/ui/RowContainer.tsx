import styled from "styled-components";

export const RowContainer = styled.div<{ $gap?: number }>`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: ${({ $gap }) => $gap || 16}px;
  width: 100%;

  & > * {
    flex: 1 1 250px;
    min-width: 0;
  }

  @media (max-width: 1024px) {
    & > * {
      flex: 1 1 200px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    
    & > * {
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
    }
  }
`;
