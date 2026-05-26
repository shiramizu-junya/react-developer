import { useAtom, useAtomValue } from 'jotai';
import { Suspense } from 'react';
import { todoAtom, todoIdAtom } from './atoms';

const TodoDetail = () => {
	const todo = useAtomValue(todoAtom);

	return (
		<div style={{ marginTop: 12 }}>
			<h4>Todo Detail</h4>
			<p>ID: {todo.id}</p>
			<p>Title: {todo.title}</p>
		</div>
	);
};

export const JotaiAsyncDemo = () => {
	const [id, setId] = useAtom(todoIdAtom);

	return (
		<section style={{ border: '1px solid #ccc', padding: 12 }}>
			<h3>Jotai Async Atom Demo</h3>
			<button onClick={() => setId((prev) => prev + 1)} style={{ marginLeft: 8 }}>
				Next
			</button>
			<p>Current Todo ID: {id}</p>
			<Suspense fallback={<p>Loading...</p>}>
				<TodoDetail />
			</Suspense>
		</section>
	);
};
