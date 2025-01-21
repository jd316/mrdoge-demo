import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#1A1D1F',
        color: 'white'
      },
      'html': {
        minHeight: '100vh',
      },
    },
  },
  colors: {
    brand: {
      orange: '#FF6B00',
      dark: {
        card: '#1E2328',
        border: '#2A2F34',
        bg: '#1E2328',
        input: '#22262B',
      }
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'brand.orange',
          color: 'white',
          _hover: {
            bg: '#FF8533'
          }
        },
        secondary: {
          bg: '#2A2F34',
          color: 'white',
          _hover: {
            bg: '#363B40'
          }
        },
        solid: {
          bg: '#CD853F',
          color: 'white',
          _hover: { opacity: 0.9 },
        },
        outline: {
          bg: '#22262B',
          color: 'white',
          _hover: { opacity: 0.9 },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: '#22262B',
            border: 'none',
            color: 'gray.300',
            _hover: { bg: '#22262B' },
            _focus: { bg: '#22262B', boxShadow: 'none' },
          }
        }
      },
      defaultProps: {
        variant: 'outline'
      }
    },
    Card: {
      baseStyle: {
        container: {
          bg: '#1E2328',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: '#2A2F34'
        }
      }
    },
    Progress: {
      baseStyle: {
        track: { bg: '#22262B' },
        filledTrack: { bg: 'brand.orange' }
      }
    },
    Text: {
      variants: {
        label: {
          color: 'gray.400',
          fontSize: 'sm',
          mb: 1
        },
        value: {
          color: 'white',
          fontSize: 'md',
        },
        orange: {
          color: 'brand.orange',
          fontWeight: 'bold',
        }
      }
    }
  }
});

export default theme;
