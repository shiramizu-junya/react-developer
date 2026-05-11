import { useCallback, useEffect, useState } from 'react';

export const useToggle = (initial: boolean = false) => {
	const [value, setValue] = useState(initial);

	useEffect(() => {
		const intervalId = setInterval(() => {
			console.log('自動でfalseにします');
			setValue(false);
		}, 3000);

		return () => clearInterval(intervalId);
	}, [initial]);

	const toggle = useCallback(() => {
		setValue((prev) => !prev);
	}, []);

	const set = useCallback((newValue: boolean) => {
		setValue(newValue);
	}, []);

	return [value, toggle, set] as const;
};
