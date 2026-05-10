import { useMemo, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import { type Theme } from './usePersistedTheme';

export function ThemeProvider({
	theme,
	toggle,
	children,
}: {
	theme: Theme;
	toggle: () => void;
	children: ReactNode;
}) {
	const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
	return <ThemeContext value={value}>{children}</ThemeContext>;
}
