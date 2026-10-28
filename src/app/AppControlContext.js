import { createContext, useContext, useMemo } from 'react';

const AppControlContext = createContext(null);

export function AppControlProvider({ children, replayIntro }) {
  const value = useMemo(
    () => ({
      replayIntro,
    }),
    [replayIntro]
  );

  return (
    <AppControlContext.Provider value={value}>
      {children}
    </AppControlContext.Provider>
  );
}

export function useAppControls() {
  const context = useContext(AppControlContext);

  if (!context) {
    throw new Error('useAppControls must be used inside AppControlProvider');
  }

  return context;
}
