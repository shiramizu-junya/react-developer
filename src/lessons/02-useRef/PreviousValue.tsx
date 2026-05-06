import { useEffect, useRef, useState } from 'react';

function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T | undefined>(undefined);
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}

type Direction = 'up' | 'down' | 'same' | '—';

const getDirection = (current: number, previous: number | undefined): Direction => {
	if (previous === undefined) return '—';
	if (current > previous) return 'up';
	if (current < previous) return 'down';
	return 'same';
};

export function PreviousValue() {
	const [count, setCount] = useState(0);
	const prev = usePrevious(count);
	const direction = getDirection(count, prev);

	return (
		<section>
			<h2>③ 前回の値を覚える</h2>
			<p>
				now: {count} / prev: {prev ?? '—'} / direction: {direction}
			</p>
			<button onClick={() => setCount((c) => c + 1)}>+1</button>
			<button onClick={() => setCount((c) => c - 1)}>-1</button>
			<button onClick={() => setCount((c) => c)}>変えない</button>
		</section>
	);
}
