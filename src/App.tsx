// src/App.tsx
import { useEffect, useRef } from 'react';

const App = () => {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// マウント直後にinputにフォーカス
    console.log(inputRef.current); // ここでinputRef.currentがnullでないことを確認
		inputRef.current?.focus();
	}, []);

	return (
		<div>
			<h1>ページが開いたら自動でフォーカスされます</h1>
			<input ref={inputRef} type="text" placeholder="ここにフォーカス" />
		</div>
	);
};

export default App;
