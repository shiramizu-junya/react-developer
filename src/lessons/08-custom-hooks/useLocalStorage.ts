import { useEffect, useState } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
	// 初回マウント時だけローカルストレージから値を読み込む
	const [value, setValue] = useState<T>(() => {
		const storedValue = localStorage.getItem(key);
		return storedValue ? JSON.parse(storedValue) : initialValue;
	});

	// 値が更新されたときにローカルストレージにも保存する
	useEffect(() => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error('Failed to save to localStorage', error);
		}
	}, [key, value]);

    return [value, setValue] as const;
};
