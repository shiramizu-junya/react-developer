import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ThemeContextValue = {
	theme: Theme;
	toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>('light');

	// useCallback で toggle の参照を固定
	const toggle = useCallback(() => {
		setTheme((t) => (t === 'light' ? 'dark' : 'light'));
	}, []);

	// useMemo で value オブジェクト自体の参照を固定
	// → Provider 配下の useContext 利用者を不要に再レンダーさせない
	const value = useMemo<ThemeContextValue>(() => ({ theme, toggle }), [theme, toggle]);

	return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
	return ctx;
}
