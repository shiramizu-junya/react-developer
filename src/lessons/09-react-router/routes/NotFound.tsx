import { useRouteError } from 'react-router-dom';

export function NotFound() {
	const err = useRouteError();
	return <p>エラー: {err instanceof Response ? err.statusText : String(err)}</p>;
}
