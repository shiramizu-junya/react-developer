import { JotaiAsyncDemo } from './jotai/AsyncDemo';

export const StateManagementDemo = () => {
	return (
		<section style={{ border: '1px solid #ccc', padding: 12 }}>
			<h2>State Management</h2>
			{/* <JotaiBasicDemo /> */}
			{/* <JotaiReadWriteDemo /> */}
			{/* <JotaiDerivedDemo /> */}
			{/* <JotaiActionAtomDemo /> */}
			<JotaiAsyncDemo />
		</section>
	);
};
