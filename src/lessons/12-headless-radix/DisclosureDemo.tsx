// 同じ useDisclosure を使い回して、見た目の違う2つのUIを作る。
// ロジックは1つ、UIは何通りでも → これがヘッドレスの旨み。
import { useDisclosure } from "./useDisclosure";

export function DisclosureDemo() {
    const panel = useDisclosure();
    const drawer = useDisclosure();

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* UI-A: アコーディオン風 */}
            <section>
                <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={panel.toggle}
                >
                    {panel.isOpen ? "閉じる" : "開く"}（アコーディオン）
                </button>
                {panel.isOpen && (
                    <p className="mt-2 text-gray-700">
                        アコーディオンの中身です。
                    </p>
                )}
            </section>

            {/* UI-B: 同じロジックでドロワー風（見た目だけ別物） */}
            <section>
                <button
                    className="px-3 py-1 bg-emerald-600 text-white rounded"
                    onClick={drawer.open}
                >
                    ドロワーを開く
                </button>
                {drawer.isOpen && (
                    <div className="mt-2 border rounded p-4">
                        ドロワーの中身。
                        <button
                            className="ml-2 underline"
                            onClick={drawer.close}
                        >
                            ×閉じる
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
