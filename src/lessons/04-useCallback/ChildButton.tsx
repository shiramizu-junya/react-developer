import { memo, useCallback, useState } from 'react';

const Button = memo(function Button({ label, onClick }: { label: string; onClick: () => void }) {
	console.log(`Button[${label}] render`);
	return <button onClick={onClick}>{label}</button>;
});

export function ChildButtonDemo() {
	const [count, setCount] = useState(0);
	const [other, setOther] = useState(0);

	// ❌ 毎回新しい関数参照
	// const handleInc = () => setCount((c) => c + 1);

	// ✅ 関数参照をキャッシュ
	const handleInc = useCallback(() => setCount((c) => c + 1), []);

	return (
		<section>
			<h2>⑥ useCallback で子の再レンダー抑制</h2>
			<p>count: {count}</p>
			<p>other: {other}</p>
			<Button label="inc count" onClick={handleInc} />
			<button onClick={() => setOther((n) => n + 1)}>change other</button>
		</section>
	);
}

export function StaleClosureDemo() {
	const [count, setCount] = useState(0);

	// ❌ 依存配列が空 → 初回の count=0 を永遠に掴む
	const badInc = useCallback(() => {
		setCount(count + 1);
	}, []);

	// ✅ 関数型 setState なら依存に count を入れなくて良い
	const goodInc = useCallback(() => {
		setCount((c) => c + 1);
	}, []);

	return (
		<section>
			<h3>⑦ stale closure に注意</h3>
			<p>count: {count}</p>
			<button onClick={badInc}>bad inc（連打しても 1 で止まる）</button>
			<button onClick={goodInc}>good inc</button>
		</section>
	);
}
