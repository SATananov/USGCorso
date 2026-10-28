export const darkTheme = {
  background: '#0b0b0c',
  surface: '#141414',
  surfaceSoft: '#181818',
  surfaceRaised: '#202020',
  gold: '#d4af37',
  goldSoft: '#9f7f2d',
  goldDark: '#4d3b14',
  text: '#f2f0ea',
  textSoft: '#b8b8b8',
  textMuted: '#777777',
  border: '#332a18',
  tabBackground: '#101011',
  activeSurface: '#18150e',
  overlay: 'rgba(0, 0, 0, 0.97)',
};

export const lightTheme = {
  background: '#f3eee3',
  surface: '#fffaf0',
  surfaceSoft: '#f8f1e4',
  surfaceRaised: '#eee2cf',
  gold: '#a87816',
  goldSoft: '#8a671d',
  goldDark: '#bca16a',
  text: '#231f18',
  textSoft: '#5d5548',
  textMuted: '#8a8173',
  border: '#d7c7a8',
  tabBackground: '#fffaf0',
  activeSurface: '#f0e3c7',
  overlay: 'rgba(18, 15, 10, 0.96)',
};

// Backward-compatible dark alias for components intentionally kept outside
// the runtime theme system, including the approved 3D intro.
export const colors = darkTheme;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 22,
};
