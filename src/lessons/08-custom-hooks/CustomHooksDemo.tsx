import { useLocalStorage } from './useLocalStorage';

export function CustomHooksDemo() {
	const [name, setName] = useLocalStorage('name', '');
    console.log(name);
    console.log(setName);

	return (
		<div style={{ marginTop: 16 }}>
			<label>
				名前:&nbsp;
				<input value={name} onChange={(e) => setName(e.target.value)} />
			</label>
			<p>こんにちは, {name || '名無しさん'}！（リロードしても残る）</p>
		</div>
	);
}
