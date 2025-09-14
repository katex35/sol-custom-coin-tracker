import React from 'react';
import {
  Flex,
  Heading,
  HStack,
  IconButton,
  Button,
  Tooltip,
  Show,
  Hide,
  Image,
  Box,
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
      py={{ base: 4, md: 6 }} 
      mb={{ base: 4, md: 8 }}
      borderBottom="1px"
      borderColor="gray.200"
      flexWrap="wrap"
      gap={{ base: 3, md: 0 }}
    >
      <HStack spacing={{ base: 2, md: 3 }} flex="1" minW="fit-content">
        <Box>
          <Image 
            src="/favicon-32x32.png" 
            alt="Solana Token Tracker Logo"
            boxSize={{ base: "24px", md: "32px" }}
            fallback={
              <Box 
                boxSize={{ base: "24px", md: "32px" }} 
                bg="blue.500" 
                borderRadius="md"
              />
            }
          />
        </Box>
        <Heading 
          size={{ base: "md", md: "lg" }}
          fontWeight="bold"
          color="gray.900"
          letterSpacing="tight"
          whiteSpace="nowrap"
        >
          <Show above="sm">Solana Token Tracker</Show>
          <Hide above="sm">SOL Tracker</Hide>
        </Heading>
      </HStack>
      
      <HStack spacing={{ base: 2, md: 3 }} flexShrink={0}>
        {trackedTokensCount > 0 && (
          <Tooltip label="Refresh all data">
            <IconButton
              aria-label="Refresh data"
              icon={<RepeatIcon />}
              isLoading={isRefreshing}
              onClick={onRefresh}
              size={{ base: "sm", md: "md" }}
              variant="ghost"
            />
          </Tooltip>
        )}
        <Button 
          leftIcon={<AddIcon />} 
          onClick={onAddToken}
          variant="solid"
          size={{ base: "sm", md: "md" }}
        >
          <Show above="sm">Add Token</Show>
          <Hide above="sm">Add</Hide>
        </Button>
      </HStack>
    </Flex>
  );
};
