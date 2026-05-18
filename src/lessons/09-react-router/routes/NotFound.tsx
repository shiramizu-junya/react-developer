import { Link } from 'react-router-dom';

export function NotFound() {
	return (
		<div>
			<h2>😵 404 — Page Not Found</h2>
			<Link to="/">ホームに戻る</Link>
		</div>
	);
}
