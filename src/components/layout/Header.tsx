import React from 'react';
import {
  Flex,
  Heading,
  HStack,
  IconButton,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { RepeatIcon, AddIcon } from '@chakra-ui/icons';

interface HeaderProps {
  trackedTokensCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onAddToken: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  trackedTokensCount,
  isRefreshing,
  onRefresh,
  onAddToken,
}) => {
  return (
    <Flex 
      align="center" 
      justify="space-between" 
      py={6} 
      mb={8}
      borderBottom="1px"
      borderColor="gray.200"
    >
      <Heading 
        size="lg" 
        fontWeight="bold"
        color="gray.900"
        letterSpacing="tight"
      >
        Solana Token Tracker
      </Heading>
      
      <HStack spacing={3}>
        {trackedTokensCount > 0 && (
          <Tooltip label="Refresh all data">
            <IconButton
              aria-label="Refresh data"
              icon={<RepeatIcon />}
              isLoading={isRefreshing}
              onClick={onRefresh}
              variant="ghost"
              size="md"
            />
          </Tooltip>
        )}
        <Button 
          leftIcon={<AddIcon />} 
          onClick={onAddToken}
          variant="solid"
          size="md"
        >
          Add Token
        </Button>
      </HStack>
    </Flex>
  );
};
