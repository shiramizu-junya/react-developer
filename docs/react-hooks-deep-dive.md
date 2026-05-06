# React Hooks 完全攻略ガイド — useRef / useMemo / useCallback / useReducer / useContext

> このドキュメントは「上から順に読んで・順に書いて・順に動かす」 1 ファイル完結の教材です。
> 解説とコードがセットになっており、各章で番号付きコード（①, ②, ...）を **自分の手で `src/` 配下に書く** ことで身につきます。
> 環境: React 19 + TypeScript + Vite (このプロジェクト)。

---

## 目次

0. [このドキュメントの使い方](#0-このドキュメントの使い方)
1. [前提：Hook と再レンダーの仕組み](#1-前提hook-と再レンダーの仕組み)
2. [useRef — 「再レンダーを起こさない箱」](#2-useref--再レンダーを起こさない箱)
3. [useMemo — 「計算結果のキャッシュ」](#3-usememo--計算結果のキャッシュ)
4. [useCallback — 「関数のキャッシュ」](#4-usecallback--関数のキャッシュ)
5. [useReducer — 「状態遷移を一元管理」](#5-usereducer--状態遷移を一元管理)
6. [useContext — 「Prop drilling を消す」](#6-usecontext--prop-drilling-を消す)
7. [統合演習：ミニ ToDo アプリで全部使う](#7-統合演習ミニ-todo-アプリで全部使う)
8. [チートシート（実務での選定基準）](#8-チートシート実務での選定基準)
9. [よくある罠とアンチパターン](#9-よくある罠とアンチパターン)
10. [次に学ぶべきこと（React 19 の新 Hook）](#10-次に学ぶべきことreact-19-の新-hook)

---

## 0. このドキュメントの使い方

### 0-1. 進め方

1. 各章の「**解説**」を読む
2. 「**コード①**」「**コード②**」と番号がついたブロックを、指示されたパス（例: `src/lessons/02-useRef/FocusInput.tsx`）に **自分の手で写経** する
3. `App.tsx` に `import` して画面に表示し、動作を確認する
4. 章末の「**やってみよう**」で改造して理解を深める

### 0-2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いたまま進めると、コードを保存するたびにホットリロードされます。

### 0-3. 推奨ディレクトリ構成（自分で作る）

このドキュメントの指示に従い、以下のように `src/lessons/` を作っていきます。

```
src/
├── App.tsx                      ← 各章のコンポーネントをここで切り替えて表示
├── main.tsx
└── lessons/
    ├── 02-useRef/
    │   ├── FocusInput.tsx       ← コード①
    │   ├── RenderCount.tsx      ← コード②
    │   └── PreviousValue.tsx    ← コード③
    ├── 03-useMemo/
    │   ├── ExpensiveList.tsx    ← コード④
    │   └── ReferentialEquality.tsx ← コード⑤
    ├── 04-useCallback/
    │   └── ChildButton.tsx      ← コード⑥, ⑦
    ├── 05-useReducer/
    │   ├── Counter.tsx          ← コード⑧
    │   └── FormReducer.tsx      ← コード⑨
    ├── 06-useContext/
    │   ├── ThemeContext.tsx     ← コード⑩
    │   └── ThemeDemo.tsx        ← コード⑪
    └── 07-todo-app/
        ├── TodoApp.tsx          ← コード⑫
        ├── TodosContext.tsx     ← コード⑬
        └── components/...       ← コード⑭〜
```

### 0-4. App.tsx のテンプレート

各章で書いたコンポーネントを切り替えやすいよう、`src/App.tsx` を以下のテンプレートに置き換えてください。
（章を進めるたびにコメントを外して切り替えていきます）

**コード⓪ — `src/App.tsx`**

```tsx
// import { FocusInput } from "./lessons/02-useRef/FocusInput";
// import { RenderCount } from "./lessons/02-useRef/RenderCount";
// import { PreviousValue } from "./lessons/02-useRef/PreviousValue";
// import { ExpensiveList } from "./lessons/03-useMemo/ExpensiveList";
// import { ReferentialEquality } from "./lessons/03-useMemo/ReferentialEquality";
// import { ChildButtonDemo } from "./lessons/04-useCallback/ChildButton";
// import { Counter } from "./lessons/05-useReducer/Counter";
// import { FormReducer } from "./lessons/05-useReducer/FormReducer";
// import { ThemeDemo } from "./lessons/06-useContext/ThemeDemo";
// import { TodoApp } from "./lessons/07-todo-app/TodoApp";

export default function App() {
	return (
		<div style={{ padding: 24, fontFamily: "system-ui" }}>
			<h1>React Hooks Lessons</h1>
			{/* 学習中の章のコンポーネントだけコメントアウトを外す */}
			{/* <FocusInput /> */}
		</div>
	);
}
```

---

## 1. 前提：Hook と再レンダーの仕組み

最初に、これから出てくる Hook を理解するために必要な「再レンダー」の話を押さえます。

### 1-1. 再レンダーはいつ起こる？

React のコンポーネント関数は、以下のいずれかで **再実行** されます。

- `useState` / `useReducer` の **state が更新** されたとき
- 親コンポーネントが再レンダーされ、自分が **再レンダー対象** になったとき
- 受け取っている `props` が **変わった**（参照が変わった）とき
- `useContext` で購読している Context の **value が変わった** とき

### 1-2. 再レンダーで起こること

コンポーネント関数の **中身がもう一度すべて実行** されます。つまり、

```tsx
function MyComponent() {
	const obj = { name: "alice" };          // 毎回 新しいオブジェクト
	const fn = () => console.log("hi");     // 毎回 新しい関数
	const heavy = computeHeavy(...);         // 毎回 計算しなおし
	return <Child obj={obj} onClick={fn} />;
}
```

毎回新しい参照になるため、`Child` に渡す `obj` や `fn` は **「中身は同じだが別物」** として扱われます。これが「無駄な再レンダー」の温床です。

### 1-3. これから学ぶ Hook の役割マップ

| Hook | 何をキャッシュする？ | 主目的 |
|------|---------------------|-------|
| `useRef` | 値（DOM や mutable データ） | **再レンダーを起こさず**値を保持する |
| `useMemo` | 値（計算結果） | 重い計算 / 参照同一性の維持 |
| `useCallback` | 関数 | 子に渡す関数の参照同一性の維持 |
| `useReducer` | 状態 | 複雑な state 遷移を一元化 |
| `useContext` | (購読のみ) | 深いツリーへの値の配信 |

これを軸に、ひとつずつ手を動かしていきましょう。

---

## 2. useRef — 「再レンダーを起こさない箱」

### 2-1. 解説

`useRef(initialValue)` は、`{ current: initialValue }` という **オブジェクト** を返します。
このオブジェクトの正体は **「コンポーネント間で生き残る、書き換えても再レンダーが起きない箱」** です。

```ts
const ref = useRef<number>(0);
ref.current = 42;      // 書き換えても再レンダーされない！
console.log(ref.current); // 42
```

useRef の主要な使いどころは **2 つだけ** です。

1. **DOM ノードへのアクセス**（input にフォーカスしたい、scroll させたい、video を再生したいなど）
2. **再レンダーを起こさず値を保持**（タイマー ID、前回の値、外部ライブラリのインスタンスなど）

### 2-2. なぜ `useState` ではダメ？

| | useState | useRef |
|---|---|---|
| 値を変更した時 | **再レンダーされる** | 再レンダーされない |
| 値を読むタイミング | 描画ごとに固定（snapshot） | 常に最新（mutable） |
| JSX に表示する値 | ◎ 適切 | ✗ 表示しない値に使う |

「画面に表示しない値（タイマーID、前回値など）」は、`useState` で持つと **無駄な再レンダーが発生** します。これが `useRef` の出番です。

---

### 2-3. ユースケース① — DOM フォーカス

最も典型的な例。マウント時に input にフォーカスを当てます。

**コード① — `src/lessons/02-useRef/FocusInput.tsx`**

```tsx
import { useEffect, useRef } from "react";

export function FocusInput() {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// マウント時に input へフォーカス
		inputRef.current?.focus();
	}, []);

	return (
		<section>
			<h2>① useRef でフォーカス</h2>
			<input ref={inputRef} placeholder="自動でフォーカスされる" />
		</section>
	);
}
```

**動作確認**
1. `App.tsx` で `import { FocusInput } from "./lessons/02-useRef/FocusInput";` のコメントを外し、`<FocusInput />` を JSX に追加
2. ブラウザで input にカーソルが入っていれば成功

**ポイント**
- `ref={inputRef}` と書くだけで React が `inputRef.current` に DOM ノードを入れてくれる
- `null` 初期値 + `?.` でアクセスするのが TypeScript での定石
- 実は本プロジェクトの既存コミット `3d1c373` がまさにこのパターン

---

### 2-4. ユースケース② — 再レンダーを起こさず値を保持する

「コンポーネントが何回レンダーされたか」を **画面には出さず** ログだけ取りたいケース。

**コード② — `src/lessons/02-useRef/RenderCount.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";

export function RenderCount() {
	const [count, setCount] = useState(0);
	const renderCount = useRef(0);

	// レンダーのたびにインクリメント（state ではないので再レンダーは誘発しない）
	renderCount.current += 1;

	useEffect(() => {
		console.log(`render: ${renderCount.current} 回目, count=${count}`);
	});

	return (
		<section>
			<h2>② レンダー回数の記録</h2>
			<p>state count: {count}</p>
			<p>(画面には出さないが) render count: コンソールを見て</p>
			<button onClick={() => setCount((c) => c + 1)}>+1</button>
		</section>
	);
}
```

**動作確認**
- ボタンを押すたびにコンソールに `render: N 回目` と出る
- `renderCount.current += 1` を **state にすると無限ループ** することを確認すると理解が深まる（試すなら `useState` に置き換えてみる）

**実務での例**
- `setTimeout` / `setInterval` の **timer ID 保持**（cleanup で `clearTimeout` するため）
- `WebSocket` / `IntersectionObserver` などの **インスタンス保持**
- **debounce / throttle** の前回呼び出し時刻

---

### 2-5. ユースケース③ — 前回の値（Previous Value）

「前回の props が何だったか」は state では取れません。`useRef` + `useEffect` で実装します。

**コード③ — `src/lessons/02-useRef/PreviousValue.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";

function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T | undefined>(undefined);
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}

export function PreviousValue() {
	const [count, setCount] = useState(0);
	const prev = usePrevious(count);

	return (
		<section>
			<h2>③ 前回の値を覚える</h2>
			<p>now: {count} / prev: {prev ?? "—"}</p>
			<button onClick={() => setCount((c) => c + 1)}>+1</button>
		</section>
	);
}
```

**ポイント**
- `useEffect` は **レンダーが画面に反映された後** に走る → JSX には「前回値」が出る
- このパターンは「値が変わった瞬間にアニメーションを発火」「diff 検知」などに使う

---

### 2-6. 実務での使いどころ

- **フォームで input にフォーカス** / 入力チェック失敗時に該当 input にスクロール
- **モーダル / ダイアログ** の `<dialog>` 要素操作（`showModal()` / `close()`）
- **タイマー ID の保持**（debounce, throttle, polling）
- **外部 JS ライブラリのインスタンス**（Chart.js, Map ライブラリなど）の保持
- **「最新の値」を取りたい時の latestRef パターン**（async 処理から最新 props を読みたい）

### 2-7. やってみよう

- 「ボタンを押すと input がクリア + フォーカスが戻る」コンポーネントを作ってみる
- `usePrevious` を使って「count が増えたか減ったか」を表示する

---

## 3. useMemo — 「計算結果のキャッシュ」

### 3-1. 解説

`useMemo(fn, deps)` は **「`deps` が変わらない限り、`fn()` の戻り値を使い回す」** という Hook です。

```ts
const value = useMemo(() => expensiveCompute(a, b), [a, b]);
```

ポイントは 2 つの目的があること：

1. **重い計算をスキップする**（パフォーマンス目的）
2. **オブジェクト/配列の参照同一性を保つ**（再レンダー抑制目的）

### 3-2. 注意：使いすぎは逆効果

`useMemo` 自体にも **依存配列の比較・キャッシュ管理コスト** があります。React の公式ドキュメントは「**多くの場合は不要**。プロファイルしてから使え」と明確に言っています。原則：

- 計算が軽い（map, filter, 数値計算くらい） → 使わない
- props の参照同一性を保ちたい（`React.memo` した子に渡す） → 使う
- 実測で遅い場合のみ → 使う

---

### 3-3. ユースケース① — 重い計算をキャッシュ

**コード④ — `src/lessons/03-useMemo/ExpensiveList.tsx`**

```tsx
import { useMemo, useState } from "react";

// 「重い」計算を擬似的に再現
function slowFilter(items: number[], threshold: number): number[] {
	const start = performance.now();
	while (performance.now() - start < 200) {
		// わざと 200ms ブロック
	}
	return items.filter((n) => n >= threshold);
}

const ITEMS = Array.from({ length: 50 }, (_, i) => i + 1);

export function ExpensiveList() {
	const [threshold, setThreshold] = useState(10);
	const [unrelated, setUnrelated] = useState(0);

	// useMemo なし → unrelated を更新しても 200ms 止まる
	// useMemo あり → threshold が変わった時だけ計算
	const filtered = useMemo(
		() => slowFilter(ITEMS, threshold),
		[threshold],
	);

	return (
		<section>
			<h2>④ useMemo で重い計算をキャッシュ</h2>
			<label>
				閾値: {threshold}
				<input
					type="range"
					min={0}
					max={50}
					value={threshold}
					onChange={(e) => setThreshold(Number(e.target.value))}
				/>
			</label>
			<button onClick={() => setUnrelated((n) => n + 1)}>
				関係ない state を更新 ({unrelated})
			</button>
			<p>件数: {filtered.length}</p>
		</section>
	);
}
```

**動作確認**
1. 「関係ない state を更新」ボタンを連打 → スルッと動く（再計算されない）
2. `useMemo` を外して直接 `slowFilter(...)` を呼ぶ実装に変える → ボタン連打が重くなる

**実務での例**
- 大量データのテーブルでの **検索・ソート・集計**
- グラフ描画用の **データ変換**
- 文字列の **マークダウンパース** / **シンタックスハイライト**

---

### 3-4. ユースケース② — 参照同一性の維持

`useMemo` のもう一つの大事な役割。**オブジェクト/配列の `===` を維持する** ことで、`React.memo` した子の再レンダーを防ぎます。

**コード⑤ — `src/lessons/03-useMemo/ReferentialEquality.tsx`**

```tsx
import { memo, useMemo, useState } from "react";

type Options = { color: string; size: "sm" | "md" | "lg" };

const StyledBox = memo(function StyledBox({ options }: { options: Options }) {
	console.log("StyledBox render", options);
	return (
		<div
			style={{
				background: options.color,
				padding: options.size === "lg" ? 24 : 8,
				color: "white",
			}}
		>
			Box
		</div>
	);
});

export function ReferentialEquality() {
	const [tick, setTick] = useState(0);

	// ❌ 毎回新しいオブジェクト → memo が効かない
	// const options: Options = { color: "tomato", size: "md" };

	// ✅ 参照を維持 → tick が増えても StyledBox は再レンダーされない
	const options = useMemo<Options>(() => ({ color: "tomato", size: "md" }), []);

	return (
		<section>
			<h2>⑤ 参照同一性を保つ</h2>
			<button onClick={() => setTick((t) => t + 1)}>parent tick: {tick}</button>
			<StyledBox options={options} />
		</section>
	);
}
```

**動作確認**
1. ボタンを押す → コンソールに `StyledBox render` が **出ない**（最初の 1 回だけ）
2. `useMemo` を外して直接 `{ color, size }` を渡すように変更 → ボタンを押すたびに `StyledBox render` が出る

**ポイント**
- `React.memo` は **props の `===`** で再レンダー判定する
- そのため、props にオブジェクト/配列/関数を渡すなら `useMemo` / `useCallback` で参照を保つ必要がある

---

### 3-5. 実務での使いどころ

- 巨大な配列の filter / sort / reduce の結果
- Context value（`{ user, login, logout }` のようなオブジェクト）
- 派生 state（複数の state から計算する値）
- Chart 系ライブラリに渡すデータの整形結果

### 3-6. やってみよう

- `slowFilter` の閾値を 200ms → 1000ms に変えて、`useMemo` ありなしの体感差を確認
- `useMemo` の依存配列を `[]` のままにして閾値を変えても再計算されないことを確認（依存漏れバグ）

---

## 4. useCallback — 「関数のキャッシュ」

### 4-1. 解説

`useCallback(fn, deps)` は **`useMemo(() => fn, deps)` のシンタックスシュガー** です。
**関数自体（参照）をキャッシュ** します。

```ts
const handleClick = useCallback(() => {
	console.log(count);
}, [count]);
```

useMemo との違いをひとことで：

- `useMemo` → **関数を呼び出した結果** を覚える
- `useCallback` → **関数そのもの** を覚える

### 4-2. いつ使うべきか

`useCallback` は **「子コンポーネントが `React.memo` されている」** か **「依存配列で関数を比較する Hook（`useEffect` など）に渡す」** ときにだけ意味があります。
それ以外で `useCallback` を撒くのは、`useMemo` 同様、過剰最適化です。

---

### 4-3. デモ

**コード⑥ — `src/lessons/04-useCallback/ChildButton.tsx`**

```tsx
import { memo, useCallback, useState } from "react";

const Button = memo(function Button({
	label,
	onClick,
}: {
	label: string;
	onClick: () => void;
}) {
	console.log(`Button[${label}] render`);
	return <button onClick={onClick}>{label}</button>;
});

export function ChildButtonDemo() {
	const [count, setCount] = useState(0);
	const [other, setOther] = useState(0);

	// ❌ 毎回新しい関数参照
	// const handleInc = () => setCount((c) => c + 1);

	// ✅ 関数参照をキャッシュ
	const handleInc = useCallback(() => setCount((c) => c + 1), []);

	return (
		<section>
			<h2>⑥ useCallback で子の再レンダー抑制</h2>
			<p>count: {count}</p>
			<p>other: {other}</p>
			<Button label="inc count" onClick={handleInc} />
			<button onClick={() => setOther((n) => n + 1)}>change other</button>
		</section>
	);
}
```

**動作確認**
1. 「change other」を押す → コンソールに `Button[inc count] render` が **出ない**
2. `useCallback` を外す → 「change other」を押すたびに `Button` が再レンダー

---

### 4-4. 依存配列を間違えるとバグる（最重要）

`useCallback` で よく出るバグが「**stale closure**（古い変数を掴んだまま）」。

**コード⑦ — `src/lessons/04-useCallback/ChildButton.tsx` に追記**

```tsx
import { useCallback, useState } from "react";

export function StaleClosureDemo() {
	const [count, setCount] = useState(0);

	// ❌ 依存配列が空 → 初回の count=0 を永遠に掴む
	const badInc = useCallback(() => {
		setCount(count + 1);
	}, []);

	// ✅ 関数型 setState なら依存に count を入れなくて良い
	const goodInc = useCallback(() => {
		setCount((c) => c + 1);
	}, []);

	return (
		<section>
			<h3>⑦ stale closure に注意</h3>
			<p>count: {count}</p>
			<button onClick={badInc}>bad inc（連打しても 1 で止まる）</button>
			<button onClick={goodInc}>good inc</button>
		</section>
	);
}
```

**学び**
- 依存配列に入れる値を絞るなら、**関数型の setState `setX(prev => ...)`** にする
- `eslint-plugin-react-hooks` を有効化して、依存漏れを検出させる（このプロジェクトは導入済み）

---

### 4-5. 実務での使いどころ

- `React.memo` した子に渡す `onClick`, `onChange`
- `useEffect` の依存に入れる関数（ESLint がうるさい時）
- カスタム Hook が返す関数（呼び出し側で安定参照を期待されるため）
- `Context` の value に関数を含める時

### 4-6. やってみよう

- 「good inc」を `setInterval` で 1 秒ごとに呼び、`bad inc` の停滞を体験する
- `Button` から `memo` を外すと `useCallback` の効果が消えることを確認する

---

## 5. useReducer — 「状態遷移を一元管理」

### 5-1. 解説

`useReducer` は Redux 風のパターンで、**「state + 状態遷移ロジック」を 1 箇所に集める** Hook です。

```ts
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: "added", payload: ... });
```

### 5-2. useState vs useReducer の選び方

| こんな時 | 使うべき |
|---------|---------|
| state が独立した数個の値（count, isOpen など） | **useState** |
| 複数の state が **連動して変化** する | **useReducer** |
| 同じ state を **複数のイベントで違う変化** をさせる | **useReducer** |
| 次の state が **前の state に大きく依存** する | **useReducer** |
| テストしたい / state 遷移を **純関数として切り出したい** | **useReducer** |

ざっくり: **state が 3 つ以上絡み合ってきたら useReducer を検討**。

---

### 5-3. ユースケース① — シンプルなカウンター

まずは最小例で形を覚えます。

**コード⑧ — `src/lessons/05-useReducer/Counter.tsx`**

```tsx
import { useReducer } from "react";

type State = { count: number };
type Action =
	| { type: "increment" }
	| { type: "decrement" }
	| { type: "reset" }
	| { type: "set"; value: number };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "increment":
			return { count: state.count + 1 };
		case "decrement":
			return { count: state.count - 1 };
		case "reset":
			return { count: 0 };
		case "set":
			return { count: action.value };
		default: {
			const _exhaustive: never = action;
			return state;
		}
	}
}

export function Counter() {
	const [state, dispatch] = useReducer(reducer, { count: 0 });

	return (
		<section>
			<h2>⑧ useReducer のカウンター</h2>
			<p>count: {state.count}</p>
			<button onClick={() => dispatch({ type: "increment" })}>+1</button>
			<button onClick={() => dispatch({ type: "decrement" })}>-1</button>
			<button onClick={() => dispatch({ type: "reset" })}>reset</button>
			<button onClick={() => dispatch({ type: "set", value: 100 })}>=100</button>
		</section>
	);
}
```

**ポイント**
- `Action` を **discriminated union** で書くと、`switch` で TypeScript が網羅性チェックしてくれる
- `default` で `never` 代入することで「Action を増やしたら必ず reducer に追加させる」型安全策

---

### 5-4. ユースケース② — フォームの管理（実務頻出）

複数 input をまとめて管理するのは reducer の得意分野です。

**コード⑨ — `src/lessons/05-useReducer/FormReducer.tsx`**

```tsx
import { useReducer } from "react";

type FormState = {
	name: string;
	email: string;
	agree: boolean;
	submitted: boolean;
};

type FormAction =
	| { type: "field"; field: "name" | "email"; value: string }
	| { type: "toggleAgree" }
	| { type: "submit" }
	| { type: "reset" };

const initial: FormState = { name: "", email: "", agree: false, submitted: false };

function formReducer(state: FormState, action: FormAction): FormState {
	switch (action.type) {
		case "field":
			return { ...state, [action.field]: action.value };
		case "toggleAgree":
			return { ...state, agree: !state.agree };
		case "submit":
			if (!state.agree) return state;
			return { ...state, submitted: true };
		case "reset":
			return initial;
	}
}

export function FormReducer() {
	const [state, dispatch] = useReducer(formReducer, initial);

	return (
		<section>
			<h2>⑨ useReducer でフォーム管理</h2>
			<input
				placeholder="name"
				value={state.name}
				onChange={(e) =>
					dispatch({ type: "field", field: "name", value: e.target.value })
				}
			/>
			<input
				placeholder="email"
				value={state.email}
				onChange={(e) =>
					dispatch({ type: "field", field: "email", value: e.target.value })
				}
			/>
			<label>
				<input
					type="checkbox"
					checked={state.agree}
					onChange={() => dispatch({ type: "toggleAgree" })}
				/>
				利用規約に同意
			</label>
			<div>
				<button onClick={() => dispatch({ type: "submit" })}>送信</button>
				<button onClick={() => dispatch({ type: "reset" })}>リセット</button>
			</div>
			{state.submitted && (
				<p>✅ {state.name} / {state.email} で送信完了</p>
			)}
		</section>
	);
}
```

### 5-5. 実務での使いどころ

- **フォーム**（input 群 + バリデーション + 送信状態）
- **ウィザード / ステップ UI**（前へ・次へ・確定）
- **ToDo / カート / お気に入り** など CRUD 配列の操作
- **状態機械**（idle → loading → success/error）
- **Undo / Redo**（過去 state を配列で持つ）

### 5-6. やってみよう

- `Counter` に `incrementBy(n)` を追加してみる
- `FormReducer` に「email が `@` を含まなければ `submitted` にしない」バリデーションを足す

---

## 6. useContext — 「Prop drilling を消す」

### 6-1. 解説

深くネストしたコンポーネントへ「テーマ」「ログインユーザー」「言語設定」を渡す時、props を 3, 4 階層バケツリレーしていませんか？それが **Prop drilling**。

`useContext` を使うと、**親で `<Context value={...}>` で配信 → 子のどこでも `useContext(Context)` で受け取る** ことができます。

### 6-2. 構文（React 19 系）

```tsx
import { createContext, useContext } from "react";

const ThemeContext = createContext<"light" | "dark">("light");

// 配信側（React 19 では <Provider> 不要、<Context> 直書きで OK）
<ThemeContext value="dark">
  <App />
</ThemeContext>

// 受信側
const theme = useContext(ThemeContext);
```

> **React 19 メモ**: 従来の `<ThemeContext.Provider value={...}>` も動きますが、`<ThemeContext value={...}>` だけで OK になりました。

---

### 6-3. ユースケース — テーマ切り替え

**コード⑩ — `src/lessons/06-useContext/ThemeContext.tsx`**

```tsx
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";

type Theme = "light" | "dark";
type ThemeContextValue = {
	theme: Theme;
	toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>("light");

	// useCallback で toggle の参照を固定
	const toggle = useCallback(() => {
		setTheme((t) => (t === "light" ? "dark" : "light"));
	}, []);

	// useMemo で value オブジェクト自体の参照を固定
	// → Provider 配下の useContext 利用者を不要に再レンダーさせない
	const value = useMemo<ThemeContextValue>(
		() => ({ theme, toggle }),
		[theme, toggle],
	);

	return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
	return ctx;
}
```

**ポイント — Context のお作法**
- `value` を **`useMemo` でラップ** する（毎回新しいオブジェクトだと全 Consumer が再レンダー）
- 中の関数は **`useCallback`**
- カスタム Hook (`useTheme`) でラップして、未 Provider のとき早期エラー

---

### 6-4. デモコンポーネント

**コード⑪ — `src/lessons/06-useContext/ThemeDemo.tsx`**

```tsx
import { ThemeProvider, useTheme } from "./ThemeContext";

function Toolbar() {
	// 中間コンポーネントは theme を知らなくて良い → Prop drilling 解消
	return <ThemedButton />;
}

function ThemedButton() {
	const { theme, toggle } = useTheme();
	return (
		<button
			onClick={toggle}
			style={{
				background: theme === "dark" ? "#222" : "#eee",
				color: theme === "dark" ? "#fff" : "#222",
				padding: "8px 16px",
			}}
		>
			現在: {theme} / クリックで切替
		</button>
	);
}

export function ThemeDemo() {
	return (
		<section>
			<h2>⑩⑪ useContext でテーマ配信</h2>
			<ThemeProvider>
				<Toolbar />
			</ThemeProvider>
		</section>
	);
}
```

### 6-5. Context の落とし穴

- **value が変わると全 Consumer が再レンダー** される → 巨大 state を 1 つの Context に詰めない
- 「読み取り Context」と「書き込み Context」を分けるテクニック（`TasksContext` と `TasksDispatchContext` の分割）が有効
- **過剰な Context 化は禁物**。1〜2 階層なら props でいい

### 6-6. 実務での使いどころ

- **テーマ / ダークモード**
- **ログインユーザー（authContext）**
- **i18n（locale, t 関数）**
- **トースト / モーダル管理**（`useToast()` でどこからでも呼ぶ）
- **ToDo / カート全体** など、ツリー深くで参照される state（次章で実装）

### 6-7. やってみよう

- `ThemeProvider` の上に `<button>` を置き、`localStorage` に theme を永続化する
- `useTheme` を別ファイルに分けて、テストしやすくする

---

## 7. 統合演習：ミニ ToDo アプリで全部使う

ここまで学んだ 5 つの Hook を **すべて使った** ToDo アプリを組みます。
React 公式が示している「`useReducer` + `useContext`」を組み合わせるパターンに沿った実務的な構成です。

### 7-1. ゴール

- 追加 / 完了切替 / 削除ができる
- state は `useReducer` で管理
- どこからでも `useTodos()` / `useTodosDispatch()` で読み書き
- 入力欄は **マウント時に focus**（useRef）
- 「未完了件数」は **`useMemo` で派生**
- 子コンポーネントへのコールバックは **`useCallback`**

### 7-2. ファイル構成

```
src/lessons/07-todo-app/
├── TodoApp.tsx              ← ⑫ ルート
├── TodosContext.tsx         ← ⑬ Provider + reducer
└── components/
    ├── TodoInput.tsx        ← ⑭ useRef でフォーカス
    ├── TodoList.tsx         ← ⑮ useMemo で件数派生
    └── TodoItem.tsx         ← ⑯ React.memo + useCallback
```

---

### 7-3. コード⑬ — `src/lessons/07-todo-app/TodosContext.tsx`

```tsx
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useReducer,
	type Dispatch,
	type ReactNode,
} from "react";

export type Todo = { id: string; text: string; done: boolean };

type Action =
	| { type: "added"; text: string }
	| { type: "toggled"; id: string }
	| { type: "deleted"; id: string };

function todosReducer(todos: Todo[], action: Action): Todo[] {
	switch (action.type) {
		case "added":
			return [...todos, { id: crypto.randomUUID(), text: action.text, done: false }];
		case "toggled":
			return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
		case "deleted":
			return todos.filter((t) => t.id !== action.id);
	}
}

// 読み取り用 Context と書き込み用 Context を分割（再レンダー範囲の最適化）
const TodosContext = createContext<Todo[] | null>(null);
const TodosDispatchContext = createContext<Dispatch<Action> | null>(null);

const initial: Todo[] = [
	{ id: "1", text: "React 公式ドキュメントを読む", done: true },
	{ id: "2", text: "Hooks 教材を写経する", done: false },
];

export function TodosProvider({ children }: { children: ReactNode }) {
	const [todos, dispatch] = useReducer(todosReducer, initial);
	// 読み取り側 / dispatch 側ともに参照を安定化
	const dispatchMemo = useCallback(dispatch, [dispatch]);
	const todosValue = useMemo(() => todos, [todos]);

	return (
		<TodosContext value={todosValue}>
			<TodosDispatchContext value={dispatchMemo}>
				{children}
			</TodosDispatchContext>
		</TodosContext>
	);
}

export function useTodos() {
	const v = useContext(TodosContext);
	if (!v) throw new Error("useTodos must be inside TodosProvider");
	return v;
}

export function useTodosDispatch() {
	const v = useContext(TodosDispatchContext);
	if (!v) throw new Error("useTodosDispatch must be inside TodosProvider");
	return v;
}
```

---

### 7-4. コード⑭ — `src/lessons/07-todo-app/components/TodoInput.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { useTodosDispatch } from "../TodosContext";

export function TodoInput() {
	const dispatch = useTodosDispatch();
	const [text, setText] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus(); // useRef でマウント時 focus
	}, []);

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed) return;
		dispatch({ type: "added", text: trimmed });
		setText("");
		inputRef.current?.focus(); // 追加後も focus を戻す
	};

	return (
		<div style={{ display: "flex", gap: 8 }}>
			<input
				ref={inputRef}
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && submit()}
				placeholder="新しい ToDo"
			/>
			<button onClick={submit}>追加</button>
		</div>
	);
}
```

---

### 7-5. コード⑮ — `src/lessons/07-todo-app/components/TodoList.tsx`

```tsx
import { useCallback, useMemo } from "react";
import { useTodos, useTodosDispatch } from "../TodosContext";
import { TodoItem } from "./TodoItem";

export function TodoList() {
	const todos = useTodos();
	const dispatch = useTodosDispatch();

	// useMemo で派生値（未完了件数）をキャッシュ
	const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

	// useCallback で子に渡すコールバックの参照を固定
	const onToggle = useCallback(
		(id: string) => dispatch({ type: "toggled", id }),
		[dispatch],
	);
	const onDelete = useCallback(
		(id: string) => dispatch({ type: "deleted", id }),
		[dispatch],
	);

	return (
		<div>
			<p>未完了: {remaining} 件 / 全 {todos.length} 件</p>
			<ul style={{ listStyle: "none", padding: 0 }}>
				{todos.map((t) => (
					<TodoItem
						key={t.id}
						todo={t}
						onToggle={onToggle}
						onDelete={onDelete}
					/>
				))}
			</ul>
		</div>
	);
}
```

---

### 7-6. コード⑯ — `src/lessons/07-todo-app/components/TodoItem.tsx`

```tsx
import { memo } from "react";
import type { Todo } from "../TodosContext";

type Props = {
	todo: Todo;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
};

export const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }: Props) {
	return (
		<li style={{ display: "flex", gap: 8, padding: 4 }}>
			<input
				type="checkbox"
				checked={todo.done}
				onChange={() => onToggle(todo.id)}
			/>
			<span style={{ textDecoration: todo.done ? "line-through" : "none", flex: 1 }}>
				{todo.text}
			</span>
			<button onClick={() => onDelete(todo.id)}>削除</button>
		</li>
	);
});
```

> `memo` でラップしているので、`onToggle` / `onDelete` の参照が `useCallback` で固定されている限り、関係ない `Todo` の再レンダーは抑制されます。

---

### 7-7. コード⑫ — `src/lessons/07-todo-app/TodoApp.tsx`

```tsx
import { TodosProvider } from "./TodosContext";
import { TodoInput } from "./components/TodoInput";
import { TodoList } from "./components/TodoList";

export function TodoApp() {
	return (
		<section>
			<h2>⑫ 統合演習: Mini ToDo</h2>
			<TodosProvider>
				<TodoInput />
				<TodoList />
			</TodosProvider>
		</section>
	);
}
```

最後に `App.tsx` で `<TodoApp />` を表示すれば動作確認完了です。

### 7-8. 動作確認チェックリスト

- [ ] マウント時 input にフォーカスが当たっている（useRef）
- [ ] 追加・チェック・削除ができる（useReducer）
- [ ] 「未完了: N 件」が変わる（useMemo の派生値）
- [ ] 関係ない Todo は React DevTools の Highlight Updates で点滅しない（useCallback + memo）
- [ ] `TodosContext` を経由してデータが流れている（useContext）

### 7-9. 発展課題

- **永続化**: `useEffect` で `localStorage` に同期
- **フィルタ**: 「全部 / 未完了 / 完了」をタブで切り替え（`useReducer` の state 拡張 or 追加 state）
- **編集機能**: ダブルクリックで編集モード → blur で確定（useRef で input にフォーカス）
- **テスト**: `todosReducer` を純関数として Vitest でテスト

---

## 8. チートシート（実務での選定基準）

```
┌─────────────────────────────────────────────────────────┐
│ Q1: 画面に表示する値？                                    │
│   YES → useState / useReducer                            │
│   NO  → useRef                                           │
│                                                         │
│ Q2: state が複雑（連動・複数イベント）？                   │
│   YES → useReducer                                       │
│   NO  → useState                                         │
│                                                         │
│ Q3: 計算が重い or 参照同一性を保ちたい？                   │
│   YES → useMemo                                          │
│   NO  → そのまま書く（早すぎる最適化は害）                  │
│                                                         │
│ Q4: 子の React.memo に関数を渡す？                        │
│   YES → useCallback                                      │
│   NO  → 不要                                             │
│                                                         │
│ Q5: 3 階層以上 props で渡している？                        │
│   YES → useContext                                       │
│   NO  → そのまま props                                    │
└─────────────────────────────────────────────────────────┘
```

### 8-1. パフォーマンス最適化の原則

1. **まず計測する**（React DevTools の Profiler）。気のせい最適化はコードを汚すだけ
2. **`React.memo` + `useCallback` + `useMemo` はセット**。どれか欠けると効果ゼロ
3. **`Context` は読み書きを分割** すると不要再レンダーが減る
4. **state は最も近いコンポーネントに置く**（Lift state up は必要最小限）
5. **重い処理は `useMemo` か Web Worker に逃がす**

---

## 9. よくある罠とアンチパターン

### 9-1. useRef 編

- ❌ `ref.current` を **JSX に書いてしまう**（変えても再レンダーされず画面が更新されない）
- ❌ `useRef` を `useState` の代わりに使う（表示する値は `useState`）
- ❌ レンダー中に `ref.current` を**書き換える**（副作用は `useEffect` の中で）

### 9-2. useMemo / useCallback 編

- ❌ **何でもかんでもメモ化** → 比較・キャッシュコストが発生し、可読性も悪化
- ❌ **依存配列を `[]` で固定** → stale closure バグ
- ❌ `useCallback` だけ書いて子が `memo` されていない → 効果ゼロ
- ❌ `setState((prev) => ...)` を使えば依存に入れずに済むのに、わざわざ依存に入れて頻繁に再生成される

### 9-3. useReducer 編

- ❌ reducer の中で **mutation**（`state.count++` など）→ 不変性違反、再レンダーされない
- ❌ reducer の中で **副作用**（API 呼び出し、`localStorage` 書き込み）→ reducer は純関数を保つ
- ❌ Action type を **string リテラル直書き** → typo に気づきにくい（`as const` か union 型で）

### 9-4. useContext 編

- ❌ Context の value を **inline オブジェクトで渡す** → 全 Consumer が毎回再レンダー
  ```tsx
  // ❌
  <Ctx value={{ user, login }}>
  // ✅
  const value = useMemo(() => ({ user, login }), [user, login]);
  <Ctx value={value}>
  ```
- ❌ **巨大な state を 1 つの Context に詰める** → 一部更新で全 Consumer 再描画
- ❌ Provider の外で `useContext` を呼ぶ → カスタム Hook で早期エラーを投げる設計に

---

## 10. 次に学ぶべきこと（React 19 の新 Hook）

ここまで来たら、React 19 で追加された新しい Hook も触っておくと現場で困りません。

| Hook | 何ができる |
|------|-----------|
| `use(promise)` / `use(context)` | 条件分岐内でも呼べる新しい読み取り Hook |
| `useOptimistic` | 楽観的更新（送信前に UI 反映） |
| `useActionState` | フォーム送信状態（pending / error）を簡潔に管理 |
| `useFormStatus` | 子フォームから親の送信状態を読む |
| `useTransition` の進化 | UI のレスポンシブ性向上 |

これらは「サーバー連携 / フォーム / 並行 UI」を綺麗に書くための強力なツールです。
本教材で `useState`/`useReducer`/`useContext` の基礎を固めたあと、`useActionState` + Server Actions の組み合わせに進むのが自然な道です。

---

## 付録 A. 参考ドキュメント

- [React 公式 — useRef](https://react.dev/reference/react/useRef)
- [React 公式 — useMemo](https://react.dev/reference/react/useMemo)
- [React 公式 — useCallback](https://react.dev/reference/react/useCallback)
- [React 公式 — useReducer](https://react.dev/reference/react/useReducer)
- [React 公式 — useContext](https://react.dev/reference/react/useContext)
- [Josh W. Comeau — useMemo and useCallback](https://www.joshwcomeau.com/react/usememo-and-usecallback/)

---

## 付録 C. やってみよう解答例

「やってみよう」の課題は **自分で考えてから** 見るのがおすすめです。詰まったときの答え合わせ用に置いておきます。

### C-1. 章 2-7 ①「ボタンで input クリア + フォーカスを戻す」

**考え方**
- 入力値の管理 → `useState`
- DOM への `focus()` → `useRef`
- 「クリア + focus」を同時に → `onClick` ハンドラの中で順に呼ぶだけ

`FocusInput`① は「マウント時に focus」だったが、今回は「**ボタンを押した瞬間に focus**」。呼ぶタイミングを `useEffect` から `onClick` に変えるだけ。

**コード — `src/lessons/02-useRef/ClearableInput.tsx`**

```tsx
import { useRef, useState } from "react";

export function ClearableInput() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [text, setText] = useState("");

	const handleClear = () => {
		setText("");                // ① 値をクリア
		inputRef.current?.focus();  // ② フォーカスを戻す
	};

	return (
		<section>
			<h2>やってみよう①: クリア + フォーカス</h2>
			<input
				ref={inputRef}
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="何か入力"
			/>
			<button onClick={handleClear}>クリア</button>
			<p>現在の値: {text || "（空）"}</p>
		</section>
	);
}
```

### C-2. 章 2-7 ②「usePrevious で増減を表示」

**考え方**
- count → `useState`
- 前回値 → `usePrevious`（③ の使い回し）
- 増減判定 → `count > prev` / `count < prev` を見るだけ

**注意点：初回 render**
`prev` は初回だけ `undefined`（前回がないので当然）。比較は `prev !== undefined` でガードする。

**コード — `src/lessons/02-useRef/CountDirection.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";

// ③ の usePrevious を再掲（別ファイルから import してもよい）
function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T | undefined>(undefined);
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}

type Direction = "up" | "down" | "same" | "init";

function getDirection(now: number, prev: number | undefined): Direction {
	if (prev === undefined) return "init";
	if (now > prev) return "up";
	if (now < prev) return "down";
	return "same";
}

const LABEL: Record<Direction, string> = {
	up: "⬆️ 増えた",
	down: "⬇️ 減った",
	same: "→ 同じ",
	init: "—（初回）",
};

export function CountDirection() {
	const [count, setCount] = useState(0);
	const prev = usePrevious(count);
	const direction = getDirection(count, prev);

	return (
		<section>
			<h2>やってみよう②: 増減表示</h2>
			<p>now: {count} / prev: {prev ?? "—"}</p>
			<p>方向: {LABEL[direction]}</p>
			<button onClick={() => setCount((c) => c + 1)}>+1</button>
			<button onClick={() => setCount((c) => c - 1)}>-1</button>
			<button onClick={() => setCount((c) => c)}>変えない</button>
		</section>
	);
}
```

**気づきポイント**
「変えない」ボタンを押しても `→ 同じ` にはならない。**`useState` は同じ値（`Object.is` 一致）を set するとレンダーをスキップ** するため、`useEffect` も走らず `prev` も更新されない。これも `useState` の重要な挙動。

---

## 付録 B. 進捗チェックリスト

- [ ] ① FocusInput が動いた
- [ ] ② RenderCount でレンダー回数をログで確認した
- [ ] ③ usePrevious で前回値が出た
- [ ] ④ ExpensiveList で useMemo の効果を体感した
- [ ] ⑤ ReferentialEquality で `memo` の効果を確認した
- [ ] ⑥ ChildButtonDemo が動いた
- [ ] ⑦ stale closure のバグを再現できた
- [ ] ⑧ Counter が動いた
- [ ] ⑨ FormReducer が動いた
- [ ] ⑩⑪ ThemeDemo が切り替わった
- [ ] ⑫〜⑯ TodoApp が動いた
- [ ] 7-9 の発展課題を 1 つ以上クリアした

ここまで完了すれば、実務で「どの Hook を、なぜ、どう使うか」を自信を持って判断できる状態になっています。お疲れさまでした！
