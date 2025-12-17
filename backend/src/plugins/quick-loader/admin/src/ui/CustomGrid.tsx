import styled from "styled-components";

interface CustomGridProps {
  $cols?: number;
  $tabletCols?: number;
  $mobileCols?: number;
}

export const CustomGrid = styled.div<CustomGridProps>`
  display: grid;
  grid-template-columns: repeat(${({ $mobileCols }) => $mobileCols || 1}, 1fr);
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(${({ $tabletCols }) => $tabletCols || 2}, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(${({ $cols }) => $cols || 3}, 1fr);
  }
`;

interface GridItemProps {
  $colSpan?: number;
  $tabletSpan?: number;
  $mobileSpan?: number;
}

export const GridItem = styled.div<GridItemProps>`
  grid-column: span ${({ $mobileSpan }) => $mobileSpan || 1};

  @media (min-width: 768px) {
    grid-column: span ${({ $tabletSpan }) => $tabletSpan || "auto"};
  }

  @media (min-width: 1024px) {
    grid-column: span ${({ $colSpan }) => $colSpan || 1};
  }
`;
