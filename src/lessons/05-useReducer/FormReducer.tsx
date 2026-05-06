import { useReducer } from 'react';

type FormState = {
	name: string;
	email: string;
	agree: boolean;
	submitted: boolean;
};

type FormAction =
	| { type: 'field'; field: 'name' | 'email'; value: string }
	| { type: 'toggleAgree' }
	| { type: 'submit' }
	| { type: 'reset' };

const initial: FormState = { name: '', email: '', agree: false, submitted: false };

function formReducer(state: FormState, action: FormAction): FormState {
	switch (action.type) {
		case 'field':
			return { ...state, [action.field]: action.value };
		case 'toggleAgree':
			return { ...state, agree: !state.agree };
		case 'submit':
			if (!state.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return state;
			if (!state.agree) return state;
			return { ...state, submitted: true };
		case 'reset':
			return initial;
	}
}

export function FormReducer() {
	const [state, dispatch] = useReducer(formReducer, initial);

	return (
		<section>
			<h2>⑨ useReducer でフォーム管理</h2>
			<input
				placeholder="name"
				value={state.name}
				onChange={(e) => dispatch({ type: 'field', field: 'name', value: e.target.value })}
			/>
			<br />
			<input
				placeholder="email"
				value={state.email}
				onChange={(e) => dispatch({ type: 'field', field: 'email', value: e.target.value })}
			/>
			<br />
			<label>
				<input
					type="checkbox"
					checked={state.agree}
					onChange={() => dispatch({ type: 'toggleAgree' })}
				/>
				利用規約に同意
			</label>
			<div>
				<button onClick={() => dispatch({ type: 'submit' })}>送信</button>
				<button onClick={() => dispatch({ type: 'reset' })}>リセット</button>
			</div>
			{state.submitted && (
				<p>
					✅ {state.name} / {state.email} で送信完了
				</p>
			)}
		</section>
	);
}
