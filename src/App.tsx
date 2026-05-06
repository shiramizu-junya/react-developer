// import { FocusInput } from './lessons/02-useRef/FocusInput';
// import { RenderCount } from './lessons/02-useRef/RenderCount';
// import { ClearableInput } from './lessons/02-useRef/ClearableInput';
// import { PreviousValue } from './lessons/02-useRef/PreviousValue';
// import { ExpensiveList } from './lessons/03-useMemo/ExpensiveList';
// import { ReferentialEquality } from "./lessons/03-useMemo/ReferentialEquality";
// import { ChildButtonDemo, StaleClosureDemo } from './lessons/04-useCallback/ChildButton';
// import { Counter } from "./lessons/05-useReducer/Counter";
// import { FormReducer } from "./lessons/05-useReducer/FormReducer";
import { ThemeDemo } from "./lessons/06-useContext/ThemeDemo";
// import { TodoApp } from "./lessons/07-todo-app/TodoApp";

export default function App() {
	return (
		<div style={{ padding: 24, fontFamily: 'system-ui' }}>
			<h1>React Hooks Lessons</h1>
			{/* 学習中の章のコンポーネントだけコメントアウトを外す */}
			<ThemeDemo />
		</div>
	);
}
