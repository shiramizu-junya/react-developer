import { useState } from 'react';

export const NativeModal = () => {
	const [open, setOpen] = useState(false);

	return (
		<div className="p-8">
			<button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setOpen(true)}>
				モーダルを開く
			</button>

			{open && (
				// 背景の黒いオーバーレイ
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center"
					onClick={() => setOpen(false)}
				>
					{/* 中身。クリックが背景に伝播して閉じないよう stopPropagation */}
					<div className="bg-white rounded-lg p-6 w-80" onClick={(e) => e.stopPropagation()}>
						<h2 className="text-lg font-bold">確認</h2>
						<p className="mt-2 text-gray-600">本当に削除しますか？</p>
						<div className="mt-4 flex justify-end gap-2">
							<button className="px-3 py-1" onClick={() => setOpen(false)}>
								キャンセル
							</button>
							<button className="px-3 py-1 bg-red-600 text-white rounded">削除</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
