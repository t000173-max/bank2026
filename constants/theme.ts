export const theme = {
    colors: {
      // Dark Background Colors
      background: {
        primary: '#1A1F3A', // Dark blue background
        secondary: '#252B48', // Slightly lighter dark blue
        card: '#2A2F4A', // Card background
        surface: '#1E2338', // Surface color
      },
      
      // Text Colors
      text: {
        primary: '#FFFFFF', // White text
        secondary: '#B0B0B0', // Gray text (like "Welcome Back")
        tertiary: '#808080', // Lighter gray
        accent: '#4A90E2', // Blue accent text
      },
      
      // Accent Colors (for cards and interactive elements)
      accent: {
        blue: '#4A90E2', // Primary blue
        pink: '#FF6B9D', // Pink (for refrigerator card)
        green: '#4ECDC4', // Blue-green (for music card)
        orange: '#FF8C42', // Orange (for light card)
        gradient: {
          start: '#4ECDC4', // Blue-green gradient start
          end: '#44A08D', // Blue-green gradient end
        },
      },
      
      // Interactive Elements
      interactive: {
        selected: '#4A90E2', // Selected state (blue)
        unselected: '#FFFFFF', // Unselected state (white)
        toggle: {
          on: '#4A90E2', // Toggle on color
          off: '#3A3F5A', // Toggle off color
        },
      },
      
      // Status Colors
      status: {
        success: '#4ECDC4', // Green for success
        warning: '#FF8C42', // Orange for warning
        error: '#FF6B9D', // Pink/red for error
        info: '#4A90E2', // Blue for info
      },
      
      // Border Colors
      border: {
        light: '#3A3F5A',
        dark: '#2A2F4A',
      },
    },
    
    // Typography
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        color: '#FFFFFF',
      },
      h2: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        color: '#FFFFFF',
      },
      h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: '#FFFFFF',
      },
      body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: '#FFFFFF',
      },
      bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: '#B0B0B0',
      },
      caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        color: '#808080',
      },
    },
    
    // Spacing
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    // Border Radius
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      full: 9999,
    },
    
    // Shadows (for cards)
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  };
  
  // Type export for TypeScript
  export type Theme = typeof theme;