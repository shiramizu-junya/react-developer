import { useEffect, useRef, useState } from 'react';

export function RenderCount() {
	const [count, setCount] = useState(0);
	const renderCount = useRef(0);

	// レンダーのたびにインクリメント（state ではないので再レンダーは誘発しない）
	renderCount.current += 1;

	useEffect(() => {
		console.log(`render: ${renderCount.current} 回目, count=${count}`);
	});

	return (
		<section>
			<h2>② レンダー回数の記録</h2>
			<p>state count: {count}</p>
			<p>(画面には出さないが) render count: コンソールを見て</p>
			<button onClick={() => setCount((c) => c + 1)}>+1</button>
		</section>
	);
}
