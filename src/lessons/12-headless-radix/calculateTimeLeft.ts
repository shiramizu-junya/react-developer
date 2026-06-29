export type TimeLeftType = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export const calculateTimeLeft = (date: Date): Partial<TimeLeftType> | null => {
    if (Number.isNaN(date.getTime())) return null;

    const difference = date.getTime() - new Date().getTime();
    let timeLeft: Partial<TimeLeftType> = {};

    if (difference < 0) {
        return timeLeft;
    }

    timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };

    return timeLeft;
};
