import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export const usePersistedTheme = () => {
	// 初回マウント時だけ localStorage を読む（lazy initial state）
	const [theme, setTheme] = useState<Theme>(() => {
		const savedTheme = localStorage.getItem('theme');
		return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'light';
	});

	// テーマが変わるたびに localStorage に保存
	useEffect(() => {
		localStorage.setItem('theme', theme);
	}, [theme]);

    // useCallback で toggle の参照を固定
	const toggle = useCallback(() => {
		setTheme((t) => (t === 'light' ? 'dark' : 'light'));
	}, []);

    return { theme, toggle };
};
