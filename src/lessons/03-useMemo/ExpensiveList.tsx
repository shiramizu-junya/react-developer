import { useMemo, useState } from 'react';

// 「重い」計算を擬似的に再現
function slowFilter(items: number[], threshold: number): number[] {
	const start = performance.now();
	while (performance.now() - start < 1000) {
		// わざと 200ms ブロック
	}
	return items.filter((n) => n >= threshold);
}

const ITEMS = Array.from({ length: 50 }, (_, i) => i + 1);

export function ExpensiveList() {
	const [threshold, setThreshold] = useState(10);
	const [unrelated, setUnrelated] = useState(0);

	// useMemo なし → unrelated を更新しても 200ms 止まる
	// useMemo あり → threshold が変わった時だけ計算
	const filtered = useMemo(() => slowFilter(ITEMS, threshold), [threshold]);

	return (
		<section>
			<h2>④ useMemo で重い計算をキャッシュ</h2>
			<label>
				閾値: {threshold}
				<input
					type="range"
					min={0}
					max={50}
					value={threshold}
					onChange={(e) => setThreshold(Number(e.target.value))}
				/>
			</label>
			<button onClick={() => setUnrelated((n) => n + 1)}>
				関係ない state を更新 ({unrelated})
			</button>
			<p>件数: {filtered.length}</p>
		</section>
	);
}
