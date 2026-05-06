import { memo, useMemo, useState } from 'react';

type Options = { color: string; size: 'sm' | 'md' | 'lg' };

const StyledBox = memo(function StyledBox({ options }: { options: Options }) {
	console.log('StyledBox render', options);
	return (
		<div
			style={{
				background: options.color,
				padding: options.size === 'lg' ? 24 : 8,
				color: 'white',
			}}
		>
			Box
		</div>
	);
});

export function ReferentialEquality() {
	const [tick, setTick] = useState(0);

	// ❌ 毎回新しいオブジェクト → memo が効かない
	// const options: Options = { color: "tomato", size: "md" };

	// ✅ 参照を維持 → tick が増えても StyledBox は再レンダーされない
	const options = useMemo<Options>(() => ({ color: 'tomato', size: 'md' }), []);

	return (
		<section>
			<h2>⑤ 参照同一性を保つ</h2>
			<button onClick={() => setTick((t) => t + 1)}>parent tick: {tick}</button>
			<StyledBox options={options} />
		</section>
	);
}
