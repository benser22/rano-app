import React, { ReactNode, CSSProperties } from 'react';
import { Box, Typography, Divider } from '@strapi/design-system';

interface SectionCardProps {
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
}

export const SectionCard = ({ title, children, style }: SectionCardProps) => {
  return (
    <Box
      padding={6}
      background="neutral0"
      shadow="filterShadow"
      borderRadius="4px"
      hasRadius
      style={{ display: 'flex', flexDirection: 'column', ...style }}
    >
      {title && (
        <Box marginBottom={4}>
          <Typography variant="delta" fontWeight="bold">
            {title}
          </Typography>
          <Box paddingTop={2}>
            <Divider />
          </Box>
        </Box>
      )}
      <Box style={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};
