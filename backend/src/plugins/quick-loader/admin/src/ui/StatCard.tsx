import React from 'react';
import { Box, Flex, Typography } from '@strapi/design-system';

interface StatCardProps {
  title: string;
  value: string | number;
  style?: React.CSSProperties;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'alternative';
}

export const StatCard = ({ style = {
  width: "100%",
  height: "100%",
}, title, value, variant = 'default' }: StatCardProps) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: 'primary100', text: 'primary700' };
      case 'success':
        return { bg: 'success100', text: 'success700' };
      case 'warning':
        return { bg: 'warning100', text: 'warning700' };
      case 'danger':
        return { bg: 'danger100', text: 'danger700' };
      case 'secondary':
        return { bg: 'secondary100', text: 'secondary700' };
      case 'alternative':
        return { bg: 'alternative100', text: 'alternative700' };
      default:
        return { bg: 'neutral100', text: 'neutral800' };
    }
  };

  const { bg, text } = getColors();

  return (
    <Box padding={4} background={bg} borderRadius="button" hasRadius shadow="tableShadow" style={{ ...style }}>
      <Flex direction="column" alignItems="center" justifyContent="center" gap={1} height="100%">
        <Typography variant="pi" textColor="neutral600" fontWeight="bold" textTransform="uppercase" textAlign="center">
          {title}
        </Typography>
        <Typography variant="beta" fontWeight="bold" textColor={text} textAlign="center">
          {value}
        </Typography>
      </Flex>
    </Box>
  );
};
