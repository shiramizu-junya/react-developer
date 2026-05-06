import { useRef, useState } from 'react';

export const ClearableInput = () => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [text, setText] = useState('');

	const handleClear = () => {
		setText('');
		inputRef.current?.focus();
	};

	return (
		<section>
			<h2>やってみよう①: クリア + フォーカス</h2>
			<input
				ref={inputRef}
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="何か入力"
			/>
			<button onClick={handleClear}>クリア</button>
			<p>現在の値: {text || '（空）'}</p>
		</section>
	);
};
