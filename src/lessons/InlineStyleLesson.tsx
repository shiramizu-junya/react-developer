import { useState } from 'react';

export function InlineStyleLesson() {
	const [on, setOn] = useState(false);

	return (
		<div style={{ padding: 24, fontFamily: 'sans-serif' }}>
			<h1 style={{ color: 'tomato', fontSize: 28 }}>インラインスタイルの練習</h1>

			<button
				style={{
					backgroundColor: on ? '#2563eb' : '#ccc',
					color: 'white',
					border: 'none',
					padding: '8px 16px',
					borderRadius: 8,
				}}
				onClick={() => setOn((prev) => !prev)}
			>
				{on ? 'ON' : 'OFF'}
			</button>
		</div>
	);
}
