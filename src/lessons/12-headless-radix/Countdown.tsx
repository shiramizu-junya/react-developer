import { useState, useEffect, useRef, type ReactNode } from "react";
import { calculateTimeLeft, type TimeLeftType } from "./calculateTimeLeft";

// renderに渡す値の型。これが「呼び出し側に渡す計算結果」。
type CountdownRenderProps = {
    isValidDate: boolean;
    isValidFutureDate: boolean;
    timeLeft: Partial<TimeLeftType> | null;
};

type CountdownProps = {
    date: Date;
    // children が「関数」。JSXではなく、描画方法を受け取る = render props。
    children: (props: CountdownRenderProps) => ReactNode;
};

export function Countdown({ date, children }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<Partial<TimeLeftType> | null>(() =>
        calculateTimeLeft(date),
    );
    const timer = useRef<ReturnType<typeof setInterval>>(undefined);

    useEffect(() => {
        // 1秒ごとに残り時間を再計算（記事と同じ）
        timer.current = setInterval(() => {
            setTimeLeft(calculateTimeLeft(date));
        }, 1000);
        // クリーンアップでタイマー解除（useEffectの後始末）
        return () => {
            if (timer.current !== undefined) clearInterval(timer.current);
        };
    }, [date]);

    let isValidDate = true;
    let isValidFutureDate = true;
    if (timeLeft === null) isValidDate = false;
    if (timeLeft && timeLeft.seconds === undefined) isValidFutureDate = false;

    // 自分でJSXを描かず、計算結果を children(関数) に渡して描画を委ねる。
    return <>{children({ isValidDate, isValidFutureDate, timeLeft })}</>;
}
