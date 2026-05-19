import { useAtom } from 'jotai';
import { countAtom } from './atoms';

function CounterA() {
	const [count, setCount] = useAtom(countAtom);
	return (
		<div>
			<p>A 側の count: {count}</p>
			<button onClick={() => setCount((c) => c + 1)}>A で +1</button>
		</div>
	);
}

function CounterB() {
	const [count, setCount] = useAtom(countAtom);
	return (
		<div>
			<p>B 側の count: {count}</p>
			<button onClick={() => setCount((c) => c + 1)}>B で +1</button>
		</div>
	);
}

export function JotaiBasicDemo() {
	return (
		<section style={{ border: '1px solid #ccc', padding: 12 }}>
			<h2>Jotai ① basic</h2>
			<CounterA />
			<CounterB />
		</section>
	);
}
