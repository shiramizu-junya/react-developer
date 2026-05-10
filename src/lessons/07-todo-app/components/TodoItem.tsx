import { memo } from 'react';
import type { Todo } from '../TodosContext';

type Props = {
	todo: Todo;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
};

export const TodoItem = memo(({ todo, onToggle, onDelete }: Props) => {
	return (
		<li style={{ display: 'flex', gap: 8, padding: 4 }}>
			<input
				type="checkbox"
				checked={todo.done}
				onChange={() => onToggle(todo.id)}
			/>
			<span style={{ textDecoration: todo.done ? 'line-through' : 'none', flex: 1 }}>
				{todo.text}
			</span>
			<button onClick={() => onDelete(todo.id)}>削除</button>
		</li>
	);
});
