export type EmailTheme = {
  colors: {
    primary: string;
    secondary: string;
    darkBg: string;
    lightBg: string;
    outerBg: string;
    textLight: string;
    textMuted: string;
    textSecondary: string;
    accent: string;
  };
  fonts: {
    primary: string;
    heading: string;
  };
  spacing: {
    container: string;
  };
};

export const emailTheme = {
  colors: {
    primary: '#00adb7',
    secondary: '#00879d',
    darkBg: '#171C1C',
    lightBg: '#EEF1F1',
    outerBg: '#323d3e',
    textLight: '#eef1f1',
    textMuted: '#d8dfdf',
    textSecondary: '#698081',
    accent: '#4e5f60',
  },
  fonts: {
    primary: "'Roboto', Arial, Helvetica, sans-serif",
    heading: "'Heebo', Arial, sans-serif",
  },
  spacing: {
    container: '650px',
  },
} as const satisfies EmailTheme;
