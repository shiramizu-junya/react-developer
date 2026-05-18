import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
	const [name, setName] = useState('');
	const navigate = useNavigate();

	const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name) return;
		// ログイン処理 ... (今はダミー)
		navigate('/dashboard');
	};

	return (
		<form onSubmit={onSubmit}>
			<h2>🔐 Login</h2>
			<input value={name} onChange={(e) => setName(e.target.value)} placeholder="名前" />
			<button type="submit">ログイン</button>
		</form>
	);
}
