import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { TodosProvider } from './TodosContext';

export const TodoApp = () => {
	return (
		<TodosProvider>
			<TodoInput />
			<TodoList />
		</TodosProvider>
	);
};
