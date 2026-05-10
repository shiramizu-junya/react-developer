import { useCallback, useMemo } from 'react';
import { useTodos, useTodosDispatch } from '../TodosContext';
import { TodoItem } from './TodoItem';

export const TodoList = () => {
	const todos = useTodos();
    const dispatch = useTodosDispatch();

	const incompleteCount = useMemo(() => todos.filter((t) => !t.done).length, [todos]);
	const completeCount = useMemo(() => todos.filter((t) => t.done).length, [todos]);

    const onToggle = useCallback((id: string) => {
        dispatch({ type: 'toggled', id });
    }, [dispatch]);

    const onDelete = useCallback((id: string) => {
        dispatch({ type: 'deleted', id });
    }, [dispatch]);

	return (
		<div>
			<p>
				未完了: {incompleteCount} 件 / 完了: {completeCount} 件 / 全 {todos.length} 件
			</p>
			<ul style={{ listStyle: 'none', padding: 0 }}>
				{todos.map((t) => (
					<TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />
				))}
			</ul>
		</div>
	);
};
