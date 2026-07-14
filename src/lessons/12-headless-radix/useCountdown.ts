import { useState, useEffect, useRef } from "react";
import { calculateTimeLeft, type TimeLeftType } from "./calculateTimeLeft";

export function useCountdown(date: Date) {
    // TODO 1: timeLeft の state を作る（初期値は calculateTimeLeft(date)）
    const [timeLeft, setTimeLeft] = useState<Partial<TimeLeftType> | null>(
        calculateTimeLeft(date),
    );

    // TODO 2: timer 用の useRef を用意する
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // TODO 3: 1秒ごとに setTimeLeft(calculateTimeLeft(date)) する setInterval を timer.current に入れる
        // TODO 4: クリーンアップで clearInterval する
    }, [date]);

    
    // TODO 5: isValidDate / isValidFutureDate を timeLeft から判定する（Step 2 と同じ条件）
    if (timeLeft === null) {
        
    }

    // TODO 6: { isValidDate, isValidFutureDate, timeLeft } を return する
}
