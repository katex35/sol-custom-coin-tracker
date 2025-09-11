import { extendTheme } from '@chakra-ui/react';

// Minimal white/gray/black theme
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.900',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'gray.900',
          color: 'white',
          _hover: {
            bg: 'gray.800',
          },
        },
        outline: {
          borderColor: 'gray.300',
          color: 'gray.700',
          _hover: {
            bg: 'gray.50',
            borderColor: 'gray.400',
          },
        },
        ghost: {
          color: 'gray.600',
          _hover: {
            bg: 'gray.100',
            color: 'gray.800',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderColor: 'gray.200',
          borderWidth: '1px',
          borderRadius: 'lg',
          boxShadow: 'sm',
          _hover: {
            boxShadow: 'md',
            borderColor: 'gray.300',
          },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'gray.400',
      },
      variants: {
        outline: {
          field: {
            borderColor: 'gray.300',
            _hover: {
              borderColor: 'gray.400',
            },
            _focus: {
              borderColor: 'gray.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-gray-500)',
            },
          },
        },
      },
    },
  },
});

export default theme;
