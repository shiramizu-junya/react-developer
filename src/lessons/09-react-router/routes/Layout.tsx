import { NavLink, Outlet } from 'react-router-dom';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
	fontWeight: isActive ? 'bold' : 'normal',
	color: isActive ? '#0070f3' : '#333',
	textDecoration: 'none',
});

export function Layout() {
	return (
		<div>
			<header style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
				<nav style={{ display: 'flex', gap: 12 }}>
					<NavLink to="/" end style={linkStyle}>
						Home
					</NavLink>
					<NavLink to="/about" style={linkStyle}>
						About
					</NavLink>
					<NavLink to="/users/1" style={linkStyle}>
						User 1
					</NavLink>
				</nav>
			</header>
			<main style={{ padding: 16 }}>
				<Outlet />
			</main>
		</div>
	);
}
