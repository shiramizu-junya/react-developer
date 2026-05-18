import { Outlet, useNavigation } from 'react-router-dom';

export function Layout() {
	const nav = useNavigation();
	return (
		<div>
			<header>...</header>
			<main>
				{nav.state === 'loading' && <p style={{ color: 'gray' }}>読み込み中...</p>}
				<Outlet />
			</main>
		</div>
	);
}
