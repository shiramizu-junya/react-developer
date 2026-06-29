import { Countdown } from "./Countdown";
import type { TimeLeftType } from "./calculateTimeLeft";

export function CountdownDemo() {
    const date = new Date("2030-01-01");

    return (
        <div className="p-6">
            <Countdown date={date}>
                {({ timeLeft, isValidDate, isValidFutureDate }) => {
                    if (!isValidDate)
                        return <div>有効な日付を渡してください</div>;
                    if (!isValidFutureDate)
                        return <div>時間切れ。未来の日付を渡してください</div>;
                    const t = timeLeft as TimeLeftType;
                    return (
                        <div>
                            <strong>{t.days}</strong> 日{" "}
                            <strong>{t.hours}</strong> 時間{" "}
                            <strong>{t.minutes}</strong> 分{" "}
                            <strong>{t.seconds}</strong> 秒
                        </div>
                    );
                }}
            </Countdown>
        </div>
    );
}
