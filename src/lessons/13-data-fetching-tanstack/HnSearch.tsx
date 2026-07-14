import { useEffect, useState } from "react";

const API = "https://hn.algolia.com/api/v1/search";

type Story = {
    objectID: string;
    title: string;
    url: string;
};

export function HnSearch() {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    // 「入力中の値」と「実際に検索する値」を分ける
    const [search, setSearch] = useState(""); // input の value（毎キーストローク更新）
    const [activeQuery, setActiveQuery] = useState("react"); // 実際に投げる検索語

    useEffect(() => {
        const fetchData = async () => {
            setIsError(false);
            setIsLoading(true);
            try {
                // TODO(1): activeQuery を使ってfetchする（テンプレートリテラルで ?query= に埋める）
                const response = await fetch(`${API}?query=${activeQuery}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setStories(data.hits);
            } catch (error) {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        // TODO(3): この effect は「activeQuery が変わったら」再実行したい。依存配列に何を入れる？
    }, [activeQuery]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // フォームのデフォルト送信（ページリロード）を止める
        // TODO(4): 入力中のsearchを、実際の検索語activeQueryに反映する
        setActiveQuery(search);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            {isError && <div>Something went wrong ...</div>}
            {isLoading ? (
                <div>Loading ...</div>
            ) : (
                <ul>
                    {stories.map((story) => (
                        <li key={story.objectID}>
                            <a href={story.url}>{story.title}</a>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
