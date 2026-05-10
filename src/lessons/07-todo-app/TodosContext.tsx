import { createContext, Dispatch, ReactNode, useCallback, useContext, useMemo, useReducer } from "react";

export type Todo = { id: string; text: string; done: boolean };

type Action =
	| { type: 'added'; text: string }
	| { type: 'toggled'; id: string }
	| { type: 'deleted'; id: string };

const todosReducer = (todos: Todo[], action: Action): Todo[] => {
	switch (action.type) {
		case 'added':
			return [...todos, { id: crypto.randomUUID(), text: action.text, done: false }];
		case 'toggled':
			return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
		case 'deleted':
			return todos.filter((t) => t.id !== action.id);
	}
}

// 読み取り用 Context と書き込み用 Context を分割（再レンダー範囲の最適化）
const TodosContext = createContext<Todo[] | null>(null);
const TodosDispatchContext = createContext<Dispatch<Action> | null>(null);

const initial: Todo[] = [
	{ id: "1", text: "React 公式ドキュメントを読む", done: true },
	{ id: "2", text: "Hooks 教材を写経する", done: false },
];

export const TodosProvider = ({ children }: { children: ReactNode }) => {
	const [todos, dispatch] = useReducer(todosReducer, initial);
	// 読み取り側 / dispatch 側ともに参照を安定化
	const dispatchMemo = useCallback(dispatch, [dispatch]);
	const todosValue = useMemo(() => todos, [todos]);

	return (
		<TodosContext value={todosValue}>
			<TodosDispatchContext value={dispatchMemo}>
				{children}
			</TodosDispatchContext>
		</TodosContext>
	);
}

export const useTodos = () => {
	const v = useContext(TodosContext);
	if (!v) throw new Error("useTodos must be inside TodosProvider");
	return v;
}

export const useTodosDispatch = () => {
	const v = useContext(TodosDispatchContext);
	if (!v) throw new Error("useTodosDispatch must be inside TodosProvider");
	return v;
}
