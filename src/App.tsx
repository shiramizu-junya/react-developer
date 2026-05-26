// import { FocusInput } from './lessons/02-useRef/FocusInput';
// import { RenderCount } from './lessons/02-useRef/RenderCount';
// import { ClearableInput } from './lessons/02-useRef/ClearableInput';
// import { PreviousValue } from './lessons/02-useRef/PreviousValue';
// import { ExpensiveList } from './lessons/03-useMemo/ExpensiveList';
// import { ReferentialEquality } from "./lessons/03-useMemo/ReferentialEquality";
// import { ChildButtonDemo, StaleClosureDemo } from './lessons/04-useCallback/ChildButton';
// import { Counter } from "./lessons/05-useReducer/Counter";
// import { FormReducer } from "./lessons/05-useReducer/FormReducer";
// import { ThemeDemo } from "./lessons/06-useContext/ThemeDemo";
// import { TodoApp } from "./lessons/07-todo-app/TodoApp";
// import { CustomHooksDemo } from "./lessons/08-custom-hooks/CustomHooksDemo";
// import { RouterRoot } from "./lessons/09-react-router/RouterRoot";
// import { JotaiDerivedDemo } from './lessons/10-state-management/jotai/DerivedDemo';
import { StateManagementDemo } from './lessons/10-state-management/StateManagementDemo';

export default function App() {
	return (
		<div style={{ padding: 24, fontFamily: 'system-ui' }}>
			{/* 学習中の章のコンポーネントだけコメントアウトを外す */}
			{/* <CustomHooksDemo /> */}
			{/* <RouterRoot /> */}
			<StateManagementDemo />
			{/* <JotaiDerivedDemo /> */}
		</div>
	);
}
