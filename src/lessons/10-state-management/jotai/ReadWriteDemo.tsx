import { useAtomValue, useSetAtom } from 'jotai';
import { countAtom } from './atoms';

const Display = () => {
	// 読み取り専用。atom の値が変わったときだけ再レンダーされる
	const count = useAtomValue(countAtom);
	console.log('Display rendered');

	return <div>Count: {count}</div>;
};

const Buttons = () => {
    // 書き込み専用。atom の値が変わっても再レンダーされない
	const setCount = useSetAtom(countAtom);
	console.log('Buttons rendered');

	return (
		<div>
			<button onClick={() => setCount((c) => c + 1)}>+1</button>
			<button onClick={() => setCount((c) => c - 1)}>-1</button>
			<button onClick={() => setCount(0)}>reset</button>
		</div>
	);
};

export const JotaiReadWriteDemo = () => {
	return (
		<section style={{ border: '1px solid #ccc', padding: 12 }}>
			<h2>Jotai ② read/write 分離</h2>
			<Display />
			<Buttons />
		</section>
	);
};
