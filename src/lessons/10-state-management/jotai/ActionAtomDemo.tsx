import { useAtomValue, useSetAtom } from "jotai";
import { countAtom, incrementCountAtom } from "./atoms";

export const JotaiActionAtomDemo = () => {
    const count = useAtomValue(countAtom);
    const increment = useSetAtom(incrementCountAtom);

    return (
        <section style={{ border: '1px solid #ccc', padding: 12 }}>
            <h3>Action Atom Demo</h3>
            <p>Count: {count}</p>
            <button onClick={increment}>Increment</button>
        </section>
    )
}
