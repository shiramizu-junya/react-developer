import { useSearchParams } from 'react-router-dom';

export function Search() {
	const [params, setParams] = useSearchParams();
	const q = params.get('q') ?? '';
	const page = Number(params.get('page') ?? '1');

	return (
		<div>
			<h2>🔍 Search</h2>
			<input
				value={q}
				onChange={(e) => setParams({ q: e.target.value, page: '1' })}
				placeholder="検索ワード"
			/>
			<p>検索ワード: {q || '（未入力）'}</p>
			<p>ページ: {page}</p>
			<button onClick={() => setParams({ q, page: String(page + 1) })}>次へ</button>
		</div>
	);
}
