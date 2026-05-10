import { useEffect, useRef, useState } from 'react';
import { useTodosDispatch } from '../TodosContext';

export const TodoInput = () => {
	const dispatch = useTodosDispatch();
	const inputRef = useRef<HTMLInputElement>(null);
	const [text, setText] = useState('');

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const submit = () => {
		if (!text.trim()) return;
		dispatch({ type: 'added', text });
		setText('');
		inputRef.current?.focus();
	};

	return (
		<div style={{ display: 'flex', gap: 8 }}>
			<input
				placeholder="新しい ToDo"
				ref={inputRef}
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<button onClick={submit}>追加</button>
		</div>
	);
};
