/**
 * Theme Configuration
 * Centralized color scheme and styling for easy customization
 */

export const theme = {
  // Primary Colors
  primary: {
    main: '#667eea',
    light: '#8b9aff',
    dark: '#4c63d2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },

  // Secondary Colors
  secondary: {
    main: '#764ba2',
    light: '#9d7bb8',
    dark: '#5a3a7d',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },

  // Success Colors
  success: {
    main: '#43e97b',
    light: '#6ef0a0',
    dark: '#2dd15f',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },

  // Warning Colors
  warning: {
    main: '#fa709a',
    light: '#ff9bb8',
    dark: '#f04a7c',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },

  // Danger/Error Colors
  danger: {
    main: '#ff6b6b',
    light: '#ff8e8e',
    dark: '#ee5a24',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
  },

  // Info Colors
  info: {
    main: '#4facfe',
    light: '#7bc4ff',
    dark: '#1e88e5',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    light: '#f8f9fa',
    gray: '#e9ecef',
    dark: '#495057',
    black: '#212529'
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#e9ecef',
    gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  },

  // Text Colors
  text: {
    primary: '#212529',
    secondary: '#495057',
    muted: '#6c757d',
    light: '#ffffff'
  },

  // Shadows
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 25px rgba(0, 0, 0, 0.2)',
    xl: '0 15px 35px rgba(0, 0, 0, 0.25)'
  },

  // Border Radius
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    round: '50%'
  },

  // Transitions
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease'
  }
};

export default theme;

