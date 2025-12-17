import React from 'react';
import { Box, Flex, Typography } from '@strapi/design-system';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg?: string; // e.g. 'primary100'
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ActionCard = ({ style = {
  width: "100%",
  height: "100%",
}, title, description, icon, iconBg = 'primary100', children }: ActionCardProps) => {
  return (
    <Box
      padding={6}
      background="neutral0"
      shadow="filterShadow"
      borderRadius="4px" // Using Strapi standard radius or 'button'
      hasRadius
      height="auto"
      style={style}
    >
      <Flex direction="column" alignItems="center" gap={4} height="100%" justifyContent="space-between">
        <Flex direction="column" alignItems="center" gap={3}>
          <Box
            padding={3}
            background={iconBg}
            style={{
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: '64px', // Fixed size for consistency
              height: '64px'
            }}
          >
            {icon}
          </Box>
          <Flex direction="column" alignItems="center" gap={1}>
            <Typography variant="delta" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="pi" textColor="neutral600" textAlign="center" style={{ maxWidth: '200px' }}>
              {description}
            </Typography>
          </Flex>
        </Flex>

        <Flex gap={2} marginTop={2}>
          {children}
        </Flex>
      </Flex>
    </Box>
  );
};
