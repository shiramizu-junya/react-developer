import { useCallback, useState } from 'react';

type UseCounterOptions = {
	initial: number;
	min: number;
	max: number;
	step: number;
};

export const useCounter = ({
	initial,
	min,
	max,
	step,
}: UseCounterOptions) => {
	const [count, setCount] = useState(initial);

	const increment = useCallback(() => {
		setCount((prev) => Math.min(prev + step, max));
	}, [step, max]);

	const decrement = useCallback(() => {
		setCount((prev) => Math.max(prev - step, min));
	}, [step, min]);

	const reset = useCallback(() => {
		setCount(initial);
	}, [initial]);

	return { count, increment, decrement, reset };
};
