import { ThemeProvider } from './ThemeProvider';
import { usePersistedTheme } from './usePersistedTheme';
import { useTheme } from './useTheme';

function Toolbar() {
	// 中間コンポーネントは theme を知らなくて良い → Prop drilling 解消
	return <ThemedButton />;
}

function ThemedButton() {
	const { theme, toggle } = useTheme();
	return (
		<button
			onClick={toggle}
			style={{
				background: theme === 'dark' ? '#222' : '#eee',
				color: theme === 'dark' ? '#fff' : '#222',
				padding: '8px 16px',
			}}
		>
			現在: {theme} / クリックで切替
		</button>
	);
}

export function ThemeDemo() {
	const { theme, toggle } = usePersistedTheme();

	return (
		<section>
			<h2>⑩⑪ useContext でテーマ配信</h2>
			<button onClick={toggle}>テーマ切替</button>

			<ThemeProvider theme={theme} toggle={toggle}>
				<Toolbar />
			</ThemeProvider>
		</section>
	);
}
