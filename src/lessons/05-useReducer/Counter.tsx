import { useReducer } from 'react';

type State = { count: number };
type Action =
	| { type: 'increment' }
	| { type: 'incrementBy'; value: number }
	| { type: 'decrement' }
	| { type: 'reset' }
	| { type: 'set'; value: number };

function reducer(state: State, action: Action): State {
    console.log(state, action);

	switch (action.type) {
		case 'increment':
			return { count: state.count + 1 };
		case 'decrement':
			return { count: state.count - 1 };
		case 'reset':
			return { count: 0 };
		case 'set':
			return { count: action.value };
		case 'incrementBy':
			return { count: state.count + action.value };
		default: {
			const _exhaustive: never = action;
			return state;
		}
	}
}

export function Counter() {
	const [state, dispatch] = useReducer(reducer, { count: 0 });

	return (
		<section>
			<h2>⑧ useReducer のカウンター</h2>
			<p>count: {state.count}</p>
			<button onClick={() => dispatch({ type: 'increment' })}>+1</button>
			<button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
			<button onClick={() => dispatch({ type: 'reset' })}>reset</button>
			<button onClick={() => dispatch({ type: 'set', value: 100 })}>=100</button>
			<button onClick={() => dispatch({ type: 'incrementBy', value: 10 })}>+10</button>
		</section>
	);
}
