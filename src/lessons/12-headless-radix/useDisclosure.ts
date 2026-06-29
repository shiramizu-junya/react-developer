// 開閉状態（state）と操作（logic）だけを持つ、UIを一切持たないフック。
// これが「ヘッドレス」のいちばん小さい姿。
import { useState, useCallback } from "react";

export function useDisclosure(defaultOpen = false) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // useCallbackで関数の参照を安定させる（再レンダー時に作り直さない）
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    // 「状態」と「操作」だけを返す。JSX（見た目）は一切返さない。
    return { isOpen, open, close, toggle };
}
 