export function InlineStyleLesson() {
	return (
		<div style={{ padding: 24, fontFamily: 'sans-serif' }}>
			<h1 style={{ color: 'tomato', fontSize: 28 }}>インラインスタイルの練習</h1>
			<p style={{ color: '#555', lineHeight: 1.7 }}>これは段落です。</p>
			<button
				style={{
					backgroundColor: '#2563eb',
					color: 'white',
					border: 'none',
					padding: '8px 16px',
					borderRadius: 8,
				}}
			>
				ボタン
			</button>
		</div>
	);
}
