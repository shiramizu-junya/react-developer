// src/App.tsx
import { memo, useState } from 'react';

const Count = memo(({ count }: { count: number }) => {
	console.log('Countが再レンダリングされました');
	return <h1>{count}</h1>;
});

const App = () => {
	const [text, setText] = useState('');
	const [count, setCount] = useState(0);

	return (
		<div>
			<input value={text} onChange={(e) => setText(e.target.value)} />
			<p>入力: {text}</p>

			<Count count={count} />
			<button onClick={() => setCount((c) => c + 1)}>+1</button>
		</div>
	);
};

export default App;
