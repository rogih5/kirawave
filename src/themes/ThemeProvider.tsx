// src/themes/ThemeProvider.tsx
import React, { createContext, useContext } from 'react';
import { THEME } from '../../services/themes/tokens';
import type { ThemeTokens } from '../../services/themes/tokens';

const ThemeContext = createContext<ThemeTokens>(THEME);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeContext.Provider value={THEME}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeTokens {
    return useContext(ThemeContext);
}
