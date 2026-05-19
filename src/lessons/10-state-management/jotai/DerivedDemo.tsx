import { useAtom, useAtomValue } from 'jotai';
import { firstNameAtom, fullNameAtom, lastNameAtom } from './atoms';

export function JotaiDerivedDemo() {
	const [first, setFirst] = useAtom(firstNameAtom);
	const [last, setLast] = useAtom(lastNameAtom);
	// 書き込み専用。atom の値が変わっても再レンダーされない
	const full = useAtomValue(fullNameAtom);

	return (
		<section style={{ border: '1px solid #ccc', padding: 12 }}>
			<h2>Jotai ③ derived</h2>
			<input value={first} onChange={(e) => setFirst(e.target.value)} />
			<input value={last} onChange={(e) => setLast(e.target.value)} />
			<p>full = {full}</p>
		</section>
	);
}
