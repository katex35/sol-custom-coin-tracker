import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Button,
  Input,
  VStack,
  Text,
  Grid,
  Flex,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { CloseIcon, StarIcon } from '@chakra-ui/icons';

interface AddTokenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  tokenMint: string;
  setTokenMint: (value: string) => void;
}

const POPULAR_TOKENS = [
  { name: 'SOL (Solana)', mint: 'So11111111111111111111111111111111111111112' },
  { name: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { name: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { name: 'JUP (Jupiter)', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
];

export const AddTokenDrawer: React.FC<AddTokenDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tokenMint,
  setTokenMint,
}) => {
  const handlePopularTokenClick = (mint: string) => {
    setTokenMint(mint);
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay bg="blackAlpha.300" />
      <DrawerContent bg="white" borderLeftWidth="1px" borderColor="gray.200">
        <DrawerHeader borderBottomWidth="1px" borderColor="gray.200" py={4}>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              Add New Token
            </Text>
            <IconButton 
              icon={<CloseIcon />} 
              size="sm" 
              aria-label="Close" 
              onClick={onClose} 
              variant="ghost"
            />
          </Flex>
        </DrawerHeader>

        <DrawerBody py={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text mb={3} fontSize="sm" color="gray.600" fontWeight="medium">
                Token Mint Address
              </Text>
              <Input
                placeholder="Enter Solana token mint address"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                size="lg"
                borderColor="gray.300"
                bg="white"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ 
                  borderColor: "gray.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-gray-500)"
                }}
              />
            </Box>
            
            <Box>
              <Text mb={3} fontSize="sm" fontWeight="medium" color="gray.700">
                Popular Tokens
              </Text>
              <Grid templateColumns="1fr" gap={2}>
                {POPULAR_TOKENS.map((token) => (
                  <Button
                    key={token.mint}
                    variant="outline"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<StarIcon color="gray.400" boxSize={3} />}
                    onClick={() => handlePopularTokenClick(token.mint)}
                    color="gray.700"
                    borderColor="gray.300"
                    _hover={{
                      bg: "gray.50",
                      borderColor: "gray.400",
                    }}
                  >
                    {token.name}
                  </Button>
                ))}
              </Grid>
            </Box>
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" borderColor="gray.200" py={4}>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="solid" 
            onClick={onSubmit}
            isDisabled={!tokenMint.trim()}
          >
            Add Token
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
