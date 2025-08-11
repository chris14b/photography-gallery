import type {Theme} from '../types';

export const theme: Theme = {
  colors: {
    background: '#121212',
    text: '#ffffff',
    primary: '#1a1a1a',
    secondary: '#2a2a2a',
    accent: '#333333',
    overlay: 'rgba(0, 0, 0, 0.75)'
  },
  fonts: {
    main: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  }
};