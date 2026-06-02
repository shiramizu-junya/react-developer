export const TailwindBasics = () => {
	return (
		<div className="p-8 space-y-4">
			<button
				className="bg-blue-600 text-white px-4 py-2 rounded
                         hover:bg-blue-700
                         active:scale-95
                         focus:outline-none focus:ring-2 focus:ring-blue-400
                         transition"
			>
				ホバー・クリック・フォーカスしてみて
			</button>

			<button
				disabled
				className="bg-blue-600 text-white px-4 py-2 rounded
                   disabled:bg-gray-300 disabled:cursor-not-allowed"
			>
				無効化ボタン
			</button>
		</div>
	);
};
