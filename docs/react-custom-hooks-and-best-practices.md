# React カスタムフック & ベストプラクティス完全ガイド

> このドキュメントは「上から順に読んで・順に書いて・順に動かす」 1 ファイル完結の教材です。
> 解説とコードがセットになっており、各章で番号付きコード（①, ②, ...）を **自分の手で `src/` 配下に書く** ことで身につきます。
> 環境: React 19 + TypeScript + Vite (このプロジェクト)。
> 前提知識: `docs/react-hooks-deep-dive.md` の内容（`useState` / `useEffect` / `useRef` / `useMemo` / `useCallback` / `useReducer` / `useContext`）。

---

## 目次

0. [このドキュメントの使い方](#0-このドキュメントの使い方)
1. [Hooks のルール（必読）](#1-hooks-のルール必読)
2. [カスタムフックとは何か](#2-カスタムフックとは何か)
3. [最小のカスタムフック — `useToggle` / `useCounter`](#3-最小のカスタムフック--usetoggle--usecounter)
4. [永続化パターン — `useLocalStorage`](#4-永続化パターン--uselocalstorage)
5. [タイマー & クリーンアップ — `useDebounce`](#5-タイマー--クリーンアップ--usedebounce)
6. [値の前回値保持 — `usePrevious`](#6-値の前回値保持--useprevious)
7. [非同期処理 — `useAsync` / `useFetch`](#7-非同期処理--useasync--usefetch)
8. [DOM API ラップ — `useMediaQuery`](#8-dom-api-ラップ--usemediaquery)
9. [イベント登録 — `useEventListener`](#9-イベント登録--useeventlistener)
10. [フックを合成する — `useDarkMode`](#10-フックを合成する--usedarkmode)
11. [ベストプラクティス 11 か条](#11-ベストプラクティス-11-か条)
12. [アンチパターン集（やりがちな罠）](#12-アンチパターン集やりがちな罠)
13. [カスタムフックのテスト方針](#13-カスタムフックのテスト方針)
14. [卒業課題（やってみよう）](#14-卒業課題やってみよう)
15. [チートシート](#15-チートシート)

---

## 0. このドキュメントの使い方

### 0-1. 進め方

1. 各章の「**解説**」を読む
2. 「**コード①**」「**コード②**」と番号がついたブロックを、指示されたパス（例: `src/lessons/08-custom-hooks/useToggle.ts`）に **自分の手で写経** する
3. 各章の **デモコンポーネント** をさらに自分で書いて、`App.tsx` から表示する
4. 章末の「**やってみよう**」で改造して理解を深める

### 0-2. 開発サーバー

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いたまま進めると、保存のたびにホットリロードされます。

### 0-3. 推奨ディレクトリ構成（自分で作る）

```
src/lessons/
└── 08-custom-hooks/
    ├── useToggle.ts            ← コード①
    ├── useCounter.ts           ← コード②
    ├── useLocalStorage.ts      ← コード③
    ├── useDebounce.ts          ← コード④
    ├── usePrevious.ts          ← コード⑤
    ├── useAsync.ts             ← コード⑥
    ├── useFetch.ts             ← コード⑦
    ├── useMediaQuery.ts        ← コード⑧
    ├── useEventListener.ts     ← コード⑨
    ├── useDarkMode.ts          ← コード⑩
    └── CustomHooksDemo.tsx     ← 各章のデモ表示
```

### 0-4. App.tsx に追加

`App.tsx` の任意の場所で以下を import して切り替えてください。

```tsx
// import { CustomHooksDemo } from "./lessons/08-custom-hooks/CustomHooksDemo";
// ...
// <CustomHooksDemo />
```

---

## 1. Hooks のルール（必読）

カスタムフックを書く前に、React 公式の **「Rules of Hooks」** を完全に理解する必要があります。これを破ると **見つけにくい不可解なバグ** を生みます。

### 1-1. ルール①: **「トップレベル」でのみ呼ぶ**

Hook を `if` / `for` / `while` / 早期 return の後で呼ばない。**毎回のレンダーで同じ順番・同じ回数だけ呼ばれる**ように書く必要があります。

```tsx
// ❌ NG: 条件分岐の中で呼ぶ
function Bad({ enabled }: { enabled: boolean }) {
  if (enabled) {
    const [x, setX] = useState(0); // ← 呼ばれたり呼ばれなかったり
  }
}

// ❌ NG: 早期 return の後で呼ぶ
function Bad2({ user }: { user: User | null }) {
  if (!user) return null;
  const [name, setName] = useState(user.name); // ← user が null だと呼ばれない
}

// ✅ OK: 必ずトップレベル
function Good({ enabled }: { enabled: boolean }) {
  const [x, setX] = useState(0);
  if (!enabled) return null;
  return <div>{x}</div>;
}
```

### 1-2. ルール②: **React の関数からのみ呼ぶ**

呼び出し可能なのは以下の 2 つだけ。

- React の関数コンポーネント
- 別のカスタムフック（名前が `use` で始まる関数）

普通の関数や、クラスコンポーネント、イベントハンドラの中などからは **呼べません**。

```tsx
// ❌ NG: ただの関数の中
function utility() {
  const [x] = useState(0); // ← React は誰がレンダーしてるか分からない
}

// ❌ NG: イベントハンドラの中
<button onClick={() => {
  const [x] = useState(0); // ← レンダー外で呼ばれている
}}>
```

### 1-3. なぜこのルールがあるのか

React は **「呼び出し順序」だけ** で各 Hook の状態を識別しています。内部的にはコンポーネントごとに「Hook の連結リスト」を持っていて、`useState` が 1 番目、`useState` が 2 番目、`useEffect` が 3 番目…というように **インデックスで紐付け** されます。

```
レンダー1: useState(0) → useState('') → useEffect(...)
              [0]           [1]            [2]
レンダー2: useState(0) → useState('') → useEffect(...)
              [0]           [1]            [2]   ← 同じ順番なら復元できる
```

これが条件分岐で順番が変わると、**前回の `useState('')` の状態が今回の別の Hook に紐付いてしまう**。だから「常に同じ順番」が絶対条件なのです。

### 1-4. ESLint で守る

このプロジェクトには `eslint-plugin-react-hooks` が入っています。設定を確認しましょう。

```bash
cat eslint.config.js  # eslint-plugin-react-hooks が有効か確認
```

このプラグインは 2 つのルールを提供します。

| ルール | 役割 |
|---|---|
| `react-hooks/rules-of-hooks` | 上記ルール ①② の違反を検出 |
| `react-hooks/exhaustive-deps` | `useEffect` / `useMemo` / `useCallback` の依存配列の漏れを検出 |

**人間が頑張るのではなく、ESLint に守らせる**のが正解です。

### 1-5. 命名規則

カスタムフックは **必ず `use` で始める** こと。これは美的規則ではなく、**ESLint がフックかどうかを判定する根拠**になっています。

```tsx
// ❌ NG: フックを呼んでいるのに use で始まらない → ESLint がチェックできない
function getCounter() {
  const [count, setCount] = useState(0); // 内部的に Hook を呼んでいる
  return [count, setCount];
}

// ✅ OK: use で始める
function useCounter() {
  const [count, setCount] = useState(0);
  return [count, setCount];
}
```

逆に **「フックを 1 つも呼ばない関数」を `use` で始めない**のもルール。混乱の元です。

---

## 2. カスタムフックとは何か

### 2-1. 定義

**カスタムフック = 名前が `use` で始まり、内部で他の Hook を呼ぶ JavaScript 関数。**

それだけです。クラスでもなく、特別な API でもなく、ただの関数。だから:

- 引数も自由に取れる
- 戻り値も自由（プリミティブ、配列、オブジェクト、なんでも OK）
- 複数の Hook を内部で組み合わせられる
- 他のカスタムフックも呼べる

### 2-2. なぜ作るのか

> **コンポーネントから「ロジック」を切り出して再利用するため。**

DRY（Don't Repeat Yourself）の延長ですが、それ以上に **関心の分離** が大きい目的です。

```tsx
// Before: コンポーネントに永続化・取得・更新ロジックが混在
function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light');
  useEffect(() => localStorage.setItem('theme', theme), [theme]);
  // UI...
}

// After: カスタムフックに切り出すと UI だけが残る
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  // UI...
}
```

### 2-3. 「ただの関数」との違い

「カスタムフック」と「ただのユーティリティ関数」の違いは **内部で React の Hook を呼んでいるか**。

```tsx
// ただの関数（Hook を呼んでない → use で始めない）
function formatPrice(yen: number) {
  return `¥${yen.toLocaleString()}`;
}

// カスタムフック（useState を呼んでいる → use で始める）
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount(c => c + 1) };
}
```

### 2-4. 鉄則: **状態は呼び出しごとに独立**

これは **最重要の誤解ポイント**です。同じカスタムフックを 2 箇所で呼んでも、状態は共有されません。

```tsx
function App() {
  const counterA = useCounter(); // ← 独立した state
  const counterB = useCounter(); // ← 別の state（共有されない！）
  // counterA.count を増やしても counterB.count は変わらない
}
```

> **「カスタムフックはロジックの再利用であり、状態の共有ではない」**

状態を複数コンポーネントで共有したいなら `useContext` や状態管理ライブラリを使う必要があります（カスタムフックと組み合わせて使うのが普通）。

---

## 3. 最小のカスタムフック — `useToggle` / `useCounter`

ここから実装に入ります。まずは「ただ抽出するだけ」のシンプルな例を 2 つ。

### 3-1. コード① — `useToggle`

**`src/lessons/08-custom-hooks/useToggle.ts`**

```ts
import { useCallback, useState } from 'react';

/**
 * boolean のトグル状態を提供するフック
 * @param initial 初期値（省略時 false）
 * @returns [現在値, トグル関数, 任意の値にセットする関数]
 */
export function useToggle(initial = false) {
	const [value, setValue] = useState(initial);

	// 返す関数は useCallback で参照固定（呼び出し側の useEffect の依存に入れても安定）
	const toggle = useCallback(() => setValue((v) => !v), []);
	const set = useCallback((next: boolean) => setValue(next), []);

	return [value, toggle, set] as const;
}
```

**ポイント**:
- 戻り値を `[value, toggle, set] as const` のタプルに → 呼び出し側で好きな名前で受けられる
- `toggle` / `set` を `useCallback` で固定 → これは **「カスタムフックが返す関数は参照を安定させる」** という重要慣習

### 3-2. コード② — `useCounter`

**`src/lessons/08-custom-hooks/useCounter.ts`**

```ts
import { useCallback, useState } from 'react';

type UseCounterOptions = {
	initial?: number;
	min?: number;
	max?: number;
	step?: number;
};

export function useCounter({ initial = 0, min = -Infinity, max = Infinity, step = 1 }: UseCounterOptions = {}) {
	const [count, setCount] = useState(initial);

	const increment = useCallback(() => {
		setCount((c) => Math.min(c + step, max));
	}, [step, max]);

	const decrement = useCallback(() => {
		setCount((c) => Math.max(c - step, min));
	}, [step, min]);

	const reset = useCallback(() => setCount(initial), [initial]);

	return { count, increment, decrement, reset } as const;
}
```

**ポイント**:
- 引数が増えてきたので **オプションオブジェクト** で受ける（位置引数だと使いにくい）
- 関数型 setState `setCount((c) => ...)` を使う → 依存配列に `count` を入れずに済む（stale closure 回避）

### 3-3. 戻り値はタプル？オブジェクト？

| 形式 | 例 | いつ使う |
|---|---|---|
| タプル `[value, setValue]` | `useState`, `useToggle` | **2 つまで** で、命名を呼び出し側に任せたい時 |
| オブジェクト `{ count, increment, ... }` | `useQuery`, `useCounter` | 3 つ以上 / 名前が固定で意味がある時 |

迷ったら **オブジェクト** が安全。順番ミスが起きないし、後で要素を追加しやすい。

### 3-4. デモコンポーネント

**`src/lessons/08-custom-hooks/CustomHooksDemo.tsx`** （これから章ごとに追記していく）

```tsx
import { useToggle } from './useToggle';
import { useCounter } from './useCounter';

export function CustomHooksDemo() {
	const [open, toggle] = useToggle(false);
	const { count, increment, decrement, reset } = useCounter({ initial: 0, min: 0, max: 10 });

	return (
		<section style={{ padding: 16, border: '1px solid #ccc' }}>
			<h2>Custom Hooks Demo</h2>

			<div>
				<button onClick={toggle}>{open ? '閉じる' : '開く'}</button>
				{open && <p>開きました！</p>}
			</div>

			<div style={{ marginTop: 16 }}>
				<p>count: {count}</p>
				<button onClick={decrement}>-</button>
				<button onClick={increment}>+</button>
				<button onClick={reset}>reset</button>
			</div>
		</section>
	);
}
```

`App.tsx` で `<CustomHooksDemo />` を表示して動作確認しましょう。

### 3-5. やってみよう

- `useToggle` に「3 秒後に自動で false に戻る」オプションを追加してみる（`useEffect` + `setTimeout` + クリーンアップ）
- `useCounter` を改造して、`onChange?: (count: number) => void` コールバックを呼べるようにする

---

## 4. 永続化パターン — `useLocalStorage`

最も実用的なカスタムフック。**「`useState` だけど永続化される」** という API を提供します。

### 4-1. 解説

押さえるべき技術:

1. **lazy initial state** — `useState(() => ...)` のラムダ形式。**初回マウント時だけ評価**。`localStorage` 読み出しは比較的重いので毎レンダーやらない
2. **書き込みは `useEffect`** — レンダー中に副作用を起こさない
3. **JSON serialize / parse** — オブジェクトも保存できるように
4. **try / catch** — JSON 破損や `localStorage` 例外（プライベートモード等）への保険
5. **同期版もある** — `useSyncExternalStore` を使うと別タブ間でも同期できる（発展）

### 4-2. コード③ — `useLocalStorage`

**`src/lessons/08-custom-hooks/useLocalStorage.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
	// 初回マウント時だけ localStorage を読む
	const [value, setValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch (err) {
			console.warn(`useLocalStorage: failed to read "${key}"`, err);
			return initialValue;
		}
	});

	// value が変わるたびに書き込み
	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch (err) {
			console.warn(`useLocalStorage: failed to write "${key}"`, err);
		}
	}, [key, value]);

	// useState と同じ API にするため、関数型 updater も受け付ける setter を返す
	const set = useCallback((next: T | ((prev: T) => T)) => {
		setValue((prev) => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next));
	}, []);

	return [value, set] as const;
}
```

**ポイント**:
- 戻り値を `[value, set]` にして **`useState` と同じ API** に揃えた → 既存コードからの差し替えが楽
- `set` が関数型 updater を受け取れる → `setX(prev => prev + 1)` が使える
- `try/catch` で **書き込み失敗してもアプリが落ちない**（Safari プライベートモードでは setItem が throw する）

### 4-3. デモ追加

`CustomHooksDemo.tsx` に追記:

```tsx
import { useLocalStorage } from './useLocalStorage';

// コンポーネント内
const [name, setName] = useLocalStorage('user-name', '');

// JSX
<div style={{ marginTop: 16 }}>
	<label>
		名前:&nbsp;
		<input value={name} onChange={(e) => setName(e.target.value)} />
	</label>
	<p>こんにちは, {name || '名無しさん'}！（リロードしても残る）</p>
</div>
```

ブラウザでリロードしてみて、入力した名前が残っていれば成功です。

### 4-4. やってみよう

- 第 3 引数で `serializer: { read, write }` を渡せるようにして、独自シリアライズ（例: `Date` の保存）に対応する
- 別タブとも同期する版を作る（ヒント: `window.addEventListener('storage', ...)`）

---

## 5. タイマー & クリーンアップ — `useDebounce`

「入力が止まってから 300ms 後に検索 API を叩く」みたいなやつ。`useEffect` のクリーンアップを使いこなす練習です。

### 5-1. 解説

デバウンスとは: **「最後の呼び出しから N ミリ秒経ってから 1 回だけ実行」**。

実装の鍵は `useEffect` のクリーンアップ:

```
入力 'a'  → setTimeout 開始
入力 'ab' → 前のタイマーをクリア、新しい setTimeout 開始
入力 'abc' → 前のタイマーをクリア、新しい setTimeout 開始
（300ms 何もなし）
→ debouncedValue が 'abc' になる
```

### 5-2. コード④ — `useDebounce`

**`src/lessons/08-custom-hooks/useDebounce.ts`**

```ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delayMs);
		// クリーンアップ: value が変わるたびに前のタイマーをキャンセル
		return () => clearTimeout(id);
	}, [value, delayMs]);

	return debounced;
}
```

**ポイント**:
- `useEffect` のクリーンアップ関数（`return () => ...`）が **次回 effect 実行直前** に呼ばれることを利用
- value が連続で変わっても、最後の値だけが debounced になる

### 5-3. デモ追加

```tsx
import { useState } from 'react';
import { useDebounce } from './useDebounce';

// コンポーネント内
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 500);

// JSX
<div style={{ marginTop: 16 }}>
	<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="検索..." />
	<p>即時値: {query}</p>
	<p>500ms 後の値: {debouncedQuery}</p>
</div>
```

連打して、即時値だけ更新→500ms 後にデバウンス値が追いつく挙動を確認してください。

### 5-4. やってみよう

- **`useDebouncedCallback`** を作る: 値ではなく関数をデバウンスする版（`useRef` でタイマー ID を保持し、最新の関数を refresh する）

---

## 6. 値の前回値保持 — `usePrevious`

「前回レンダー時の値」を取り出す古典的フック。`useRef` の出番です。

### 6-1. コード⑤ — `usePrevious`

**`src/lessons/08-custom-hooks/usePrevious.ts`**

```ts
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T | undefined>(undefined);

	// レンダー後に ref を更新 → 次回レンダーでは「1 つ前の値」が読める
	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
}
```

**動作の流れ**:

```
レンダー 1: value=0 → ref.current は undefined を返す → useEffect で ref.current=0
レンダー 2: value=1 → ref.current は 0 を返す       → useEffect で ref.current=1
レンダー 3: value=5 → ref.current は 1 を返す       → useEffect で ref.current=5
```

`useRef` は **書き換えても再レンダーを起こさない箱** であり、`useEffect` は **レンダー後に実行**。この組み合わせで「前回値」が取れます。

### 6-2. デモ追加

```tsx
import { useState } from 'react';
import { usePrevious } from './usePrevious';

// コンポーネント内
const [n, setN] = useState(0);
const prev = usePrevious(n);

// JSX
<div style={{ marginTop: 16 }}>
	<p>現在: {n} / 前回: {prev ?? '（初回）'}</p>
	<button onClick={() => setN((x) => x + 1)}>+1</button>
</div>
```

---

## 7. 非同期処理 — `useAsync` / `useFetch`

実務で最も需要があるのが非同期処理のラップ。ここでは **データフェッチ** を題材にします。

### 7-1. 解説の前に — 注意

**正直に言うと**: 本番では SWR / TanStack Query を使うのが圧倒的に楽（キャッシュ・再取得・楽観更新まで全部入り）。ここで自作するのは **学習目的**です。

それでも自作できるべき理由:
- ライブラリが使えない環境がある
- 内部で何が起きているか理解できると、ライブラリのトラブルシューティングが楽

### 7-2. 押さえるべき罠

非同期処理で発生しがちなバグ:

1. **Race condition**: 古いリクエストが遅れて返ってきて、新しい結果を上書き
2. **Memory leak**: アンマウント後に setState を呼んで警告
3. **Stale closure**: 依存配列の漏れで古い変数を参照

これらを **AbortController** と **isMounted パターン**（または **AbortSignal**）で潰します。

### 7-3. コード⑥ — `useAsync`（汎用）

**`src/lessons/08-custom-hooks/useAsync.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

type State<T> = {
	status: Status;
	data: T | null;
	error: Error | null;
};

/**
 * 任意の非同期関数の状態（loading / success / error）を管理する汎用フック
 */
export function useAsync<T>(asyncFn: () => Promise<T>, immediate = true) {
	const [state, setState] = useState<State<T>>({ status: 'idle', data: null, error: null });
	const isMounted = useRef(true);

	// 最新の asyncFn を ref に保持して、execute の参照を安定化
	const fnRef = useRef(asyncFn);
	useEffect(() => {
		fnRef.current = asyncFn;
	}, [asyncFn]);

	const execute = useCallback(async () => {
		setState({ status: 'loading', data: null, error: null });
		try {
			const data = await fnRef.current();
			if (isMounted.current) setState({ status: 'success', data, error: null });
			return data;
		} catch (err) {
			if (isMounted.current) {
				setState({ status: 'error', data: null, error: err as Error });
			}
			throw err;
		}
	}, []);

	useEffect(() => {
		isMounted.current = true;
		if (immediate) execute();
		return () => {
			isMounted.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { ...state, execute } as const;
}
```

**ポイント**:
- `isMounted` ref で **アンマウント後の setState を防止** → React の警告と memory leak を回避
- `fnRef` で **最新の asyncFn を保持** → `execute` を毎回再生成しなくて済む
- `status` の **状態機械** 化 → `if (loading)` `if (error)` という分岐より明確
- `as const` で戻り値の型を絞る

### 7-4. コード⑦ — `useFetch`（fetch 専用ラッパー）

**`src/lessons/08-custom-hooks/useFetch.ts`**

```ts
import { useEffect, useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useFetch<T>(url: string, options?: RequestInit) {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [status, setStatus] = useState<Status>('idle');

	useEffect(() => {
		const controller = new AbortController();
		setStatus('loading');
		setError(null);

		fetch(url, { ...options, signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return (await res.json()) as T;
			})
			.then((json) => {
				setData(json);
				setStatus('success');
			})
			.catch((err: unknown) => {
				if (err instanceof Error && err.name === 'AbortError') return; // キャンセルは無視
				setError(err as Error);
				setStatus('error');
			});

		// ★ クリーンアップで進行中のリクエストを中断
		return () => controller.abort();
		// options をそのまま依存に入れると毎回新オブジェクトで無限ループするので注意
	}, [url]);

	return { data, error, status } as const;
}
```

**ポイント**:
- `AbortController` でクリーンアップ時に中断 → race condition と memory leak の両方を解決
- `AbortError` は無視（**ユーザーが原因じゃないエラー**だから）
- 依存に `options` を入れない（毎回新オブジェクトでループするため）。本格運用するなら `JSON.stringify(options)` をキーにするか、別の設計が必要

### 7-5. デモ追加

```tsx
import { useFetch } from './useFetch';

type Todo = { id: number; title: string; completed: boolean };

// コンポーネント内
const { data, status, error } = useFetch<Todo>('https://jsonplaceholder.typicode.com/todos/1');

// JSX
<div style={{ marginTop: 16 }}>
	{status === 'loading' && <p>読み込み中...</p>}
	{status === 'error' && <p style={{ color: 'red' }}>エラー: {error?.message}</p>}
	{status === 'success' && data && <pre>{JSON.stringify(data, null, 2)}</pre>}
</div>
```

### 7-6. やってみよう

- `useFetch` に「再フェッチボタン」を追加（refetch 関数を返す）
- POST にも対応させる
- 返り値を **discriminated union** にして `if (status === 'success')` の中では `data` が non-null だと TS が分かるようにする

---

## 8. DOM API ラップ — `useMediaQuery`

「画面幅が 768px 以下なら true」みたいなやつ。レスポンシブの分岐に使えます。

### 8-1. コード⑧ — `useMediaQuery`

**`src/lessons/08-custom-hooks/useMediaQuery.ts`**

```ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
	// SSR セーフ: window が無い環境でも初期値を返せる
	const getMatch = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);

	const [matches, setMatches] = useState(getMatch);

	useEffect(() => {
		const mql = window.matchMedia(query);
		const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);

		// 初回読み込み時にも同期（query 変更直後の整合性のため）
		setMatches(mql.matches);
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	}, [query]);

	return matches;
}
```

**ポイント**:
- `window.matchMedia` を使うと **CSS のメディアクエリと完全一致** で判定できる
- リスナを `useEffect` のクリーンアップで外す → memory leak 防止
- `typeof window !== 'undefined'` ガード → Next.js などの SSR 環境でも落ちない

### 8-2. デモ追加

```tsx
import { useMediaQuery } from './useMediaQuery';

// コンポーネント内
const isMobile = useMediaQuery('(max-width: 768px)');
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

// JSX
<div style={{ marginTop: 16 }}>
	<p>モバイル幅: {isMobile ? 'YES' : 'NO'}</p>
	<p>ダークモード設定: {prefersDark ? 'YES' : 'NO'}</p>
</div>
```

ブラウザのウィンドウ幅を縮めたり、OS のダーク設定を切り替えてみてください。

---

## 9. イベント登録 — `useEventListener`

`window` や任意の要素にイベントを登録する処理を抽象化します。**最新のハンドラを呼ぶ** ためのテクニックが核心。

### 9-1. 課題: stale closure

普通に `useEffect` で `addEventListener` するとこうなる:

```tsx
useEffect(() => {
	const handler = () => console.log(count); // ← この count は登録時の値
	window.addEventListener('click', handler);
	return () => window.removeEventListener('click', handler);
}, []); // ← count を入れないと古い値、入れると毎回 add/remove で重い
```

依存に入れないと **stale closure**、入れると **毎レンダーで登録/解除** という困った状態。

### 9-2. 解決策: ref に最新ハンドラを保持

`useRef` に最新のコールバックを保持しておき、登録するハンドラはその ref を読むだけ。これで:
- ハンドラの登録は 1 回（マウント時）
- でも常に最新のロジックが実行される

### 9-3. コード⑨ — `useEventListener`

**`src/lessons/08-custom-hooks/useEventListener.ts`**

```ts
import { useEffect, useRef } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(
	eventName: K,
	handler: (event: WindowEventMap[K]) => void,
	element: Window | HTMLElement | null = window,
) {
	const savedHandler = useRef(handler);

	// 最新の handler を ref に同期
	useEffect(() => {
		savedHandler.current = handler;
	}, [handler]);

	useEffect(() => {
		if (!element) return;
		const listener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
		element.addEventListener(eventName, listener);
		return () => element.removeEventListener(eventName, listener);
	}, [eventName, element]);
}
```

**ポイント**:
- `savedHandler` ref で最新のハンドラを参照 → stale closure 回避
- 登録/解除は `eventName` / `element` が変わらない限り 1 回だけ
- React 19 の新フック `useEffectEvent`（実験的）が安定すれば、この ref パターンは置き換え可能

### 9-4. デモ追加

```tsx
import { useState } from 'react';
import { useEventListener } from './useEventListener';

// コンポーネント内
const [pos, setPos] = useState({ x: 0, y: 0 });
useEventListener('mousemove', (e) => setPos({ x: e.clientX, y: e.clientY }));

// JSX
<div style={{ marginTop: 16 }}>
	<p>マウス位置: ({pos.x}, {pos.y})</p>
</div>
```

---

## 10. フックを合成する — `useDarkMode`

カスタムフックの **真価** は組み合わせ。既に作った `useLocalStorage` と `useMediaQuery` を合成して、**「OS 設定を初期値とし、ユーザー選択を localStorage に保存し、html 要素にクラスを付与する」** ダークモードフックを作ります。

### 10-1. コード⑩ — `useDarkMode`

**`src/lessons/08-custom-hooks/useDarkMode.ts`**

```ts
import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useMediaQuery } from './useMediaQuery';

export function useDarkMode() {
	const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
	const [enabled, setEnabled] = useLocalStorage<boolean | null>('dark-mode', null);

	// localStorage に明示設定がない時は OS 設定に従う
	const isDark = enabled ?? prefersDark;

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark);
	}, [isDark]);

	const toggle = useCallback(() => setEnabled(!isDark), [isDark, setEnabled]);
	const reset = useCallback(() => setEnabled(null), [setEnabled]);

	return { isDark, toggle, reset } as const;
}
```

**この合成の美点**:
- 各フックは **単一責任**（永続化 / DOM 監視 / 副作用適用）
- ロジックの全体像が **読み取りやすい 10 行** にまとまった
- それぞれを独立にテスト可能

### 10-2. デモ追加

```tsx
import { useDarkMode } from './useDarkMode';

// コンポーネント内
const { isDark, toggle, reset } = useDarkMode();

// JSX
<div style={{ marginTop: 16 }}>
	<p>現在: {isDark ? '🌙 dark' : '☀️ light'}</p>
	<button onClick={toggle}>切替</button>
	<button onClick={reset}>OS 設定に従う</button>
</div>
```

CSS で `.dark { background: #111; color: #eee; }` などを定義すると効果が見えます。

---

## 11. ベストプラクティス 11 か条

カスタムフックを書く・使う上での実務的な指針。

### 11-1. ✅ 命名は必ず `use` で始める

ESLint がフックかどうかを判定する基準。`useUserData` ◯、`getUserData` ✗（中で `useState` 呼んでるなら）。

### 11-2. ✅ 単一責任を守る

1 つのフックは 1 つの関心事。`useUser` が「フェッチ + 認証 + プロフィール編集」を全部やっているなら分割を検討。**5 つ以上の引数 / 8 つ以上の戻り値** は分割サインです。

### 11-3. ✅ 引数が 3 つを超えるならオブジェクトに

```ts
// ❌ NG: 順番がわからない
useThing(true, 100, false, 'hello');

// ✅ OK: 自己説明的
useThing({ enabled: true, delayMs: 100, autoFocus: false, message: 'hello' });
```

### 11-4. ✅ 戻り値の関数は `useCallback` で固定

呼び出し側が `useEffect` の依存に入れたくなる場面が多いため。**フック作者の責務として参照を安定化**しておく。

### 11-5. ✅ 副作用は `useEffect` の中だけ、reducer/フック本体は純粋に

```ts
// ❌ NG: フック本体で localStorage を読み書き
function useBad() {
	const [v, setV] = useState(() => {
		localStorage.setItem('foo', 'bar'); // ← レンダー中に書き込み
		return localStorage.getItem('foo');
	});
}

// ✅ OK: 読み取りは lazy initial state、書き込みは useEffect
function useGood() {
	const [v, setV] = useState(() => localStorage.getItem('foo')); // 読み取りはOK
	useEffect(() => {
		localStorage.setItem('foo', v ?? '');
	}, [v]);
}
```

### 11-6. ✅ クリーンアップを忘れない

タイマー、リスナ、購読、AbortController など。**「登録したら解除も書く」を即座にセット**で書く習慣を。

### 11-7. ✅ SSR セーフを意識する

`window` / `document` / `localStorage` を直接触るフックは:
- 初回値計算で `typeof window !== 'undefined'` ガード
- 副作用は `useEffect` 内に閉じ込める（サーバーでは実行されない）

### 11-8. ✅ TypeScript ジェネリクスで型を保つ

```ts
// ❌ NG: any で握り潰し
export function useLocalStorage(key: string, initial: any): [any, (v: any) => void];

// ✅ OK: ジェネリクス
export function useLocalStorage<T>(key: string, initial: T): readonly [T, (v: T | ((p: T) => T)) => void];
```

### 11-9. ✅ JSDoc で意図を残す

カスタムフックは **API**。利用者が IDE のホバーで使い方が分かるよう、`@param` / `@returns` / `@example` を書く。

### 11-10. ✅ 早すぎる抽象化を避ける

**1 箇所でしか使ってない、似た処理を 2 箇所で書いた、という段階ではまだ抽出しない**。3 回目に同じパターンが出たら抽出を検討（**Rule of Three**）。

抽出が早すぎると、後で要件が分岐したとき「無理にフック内部で分岐」させて複雑度爆発、というアンチパターンに陥ります。

### 11-11. ✅ 状態管理ライブラリの代替にしない

カスタムフック単体では **状態は共有されない**。アプリ全体で共有したい状態は:
- `useContext` + カスタムフック（中規模）
- Zustand / Jotai / Redux Toolkit など（大規模）

「カスタムフックさえあれば Redux いらない」は **間違い**。両者の役割は違います。

---

## 12. アンチパターン集（やりがちな罠）

### 12-1. 🚫 `use` で始まる名前なのにフックを呼んでいない

ESLint がフックとみなして厳しくチェックするので、ただの関数なのに `use` で始めると逆に困る。

### 12-2. 🚫 条件付きで Hook を呼ぶ

```tsx
function useBad(enabled: boolean) {
	if (enabled) {
		useEffect(() => {...}); // ← NG
	}
}
```

代わりに **Hook の中で条件分岐** する:

```tsx
function useGood(enabled: boolean) {
	useEffect(() => {
		if (!enabled) return;
		// ...
	}, [enabled]);
}
```

### 12-3. 🚫 同じカスタムフックを呼べば状態が共有される、と思っている

**共有されない**。状態を共有したいなら Context / 外部ストア。

### 12-4. 🚫 依存配列を `// eslint-disable` で握りつぶす

「依存配列の警告がうるさいから無効化」は **ほぼ常にバグの種**。依存に入れると無限ループするなら、**設計が間違っている可能性が高い**。

正しい対処:
- 値を `useCallback` / `useMemo` で固定
- 関数を ref に保持して effect の依存から外す
- そもそも effect ではなくイベントハンドラに移す

### 12-5. 🚫 effect 内で setState を無条件呼び出し → 無限ループ

```tsx
// ❌ 毎レンダー effect → setState → 再レンダー → effect → ... 無限
useEffect(() => {
	setCount(count + 1);
});
```

依存配列を必ず指定し、effect の責務を絞る。

### 12-6. 🚫 不要な `useCallback` / `useMemo`

メモ化はコストです（依存比較・参照保持）。**子に渡さない関数を `useCallback` する** / **`a + 1` を `useMemo` する** のは無駄。

判断基準:
- `useCallback`: **`React.memo` した子に渡す** / **他フックの依存に入れる** ときだけ
- `useMemo`: **計算が重い** / **参照同一性を保ちたい** ときだけ

### 12-7. 🚫 Provider 内で毎回新しいオブジェクトを value に渡す

```tsx
// ❌ Provider 再レンダーで全 Consumer が再レンダー
<Ctx value={{ a, b }}>
```

`useMemo` で固定する（`react-hooks-deep-dive.md` の 6 章参照）。

### 12-8. 🚫 「とりあえず外側のフック」

UI コンポーネントの中身を全部カスタムフックに移して、**コンポーネント側はほぼ空**になっている設計。**読みにくく、テストしにくく、抽象が複雑**。
カスタムフックは **再利用できる単位** で抽出するもの。1 コンポーネントだけのために抽出するのは過剰。

---

## 13. カスタムフックのテスト方針

カスタムフックの **テストしやすさ** は大きな利点。

### 13-1. テスト戦略の選び方

| 方法 | 内容 | いつ |
|---|---|---|
| **コンポーネント経由** | フックを使うコンポーネントを描画してアサート | UI が密結合な時 |
| **`renderHook` で直接** | `@testing-library/react` の `renderHook` でフックだけ実行 | フック単体の振る舞いを検証したい時 |

### 13-2. インストール

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

`vitest.config.ts` に環境設定:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	test: { environment: 'jsdom', globals: true },
});
```

### 13-3. `useCounter` のテスト例

**`src/lessons/08-custom-hooks/useCounter.test.ts`**

```ts
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
	it('initial に従って初期化される', () => {
		const { result } = renderHook(() => useCounter({ initial: 5 }));
		expect(result.current.count).toBe(5);
	});

	it('increment で +step', () => {
		const { result } = renderHook(() => useCounter({ initial: 0, step: 2 }));
		act(() => result.current.increment());
		expect(result.current.count).toBe(2);
	});

	it('max を超えない', () => {
		const { result } = renderHook(() => useCounter({ initial: 9, max: 10 }));
		act(() => result.current.increment());
		act(() => result.current.increment());
		expect(result.current.count).toBe(10);
	});

	it('reset で初期値に戻る', () => {
		const { result } = renderHook(() => useCounter({ initial: 0 }));
		act(() => result.current.increment());
		act(() => result.current.reset());
		expect(result.current.count).toBe(0);
	});
});
```

**ポイント**:
- `renderHook(() => useXxx(...))` で **フック単独で実行**
- 状態を変える操作は `act(() => ...)` で囲む
- `result.current` で最新の戻り値にアクセス

### 13-4. `useLocalStorage` のテスト例（外部依存をモック）

```ts
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
	beforeEach(() => localStorage.clear());

	it('初期値が無ければ initial を返す', () => {
		const { result } = renderHook(() => useLocalStorage('k', 'init'));
		expect(result.current[0]).toBe('init');
	});

	it('set 後に localStorage へ保存される', () => {
		const { result } = renderHook(() => useLocalStorage('k', 'a'));
		act(() => result.current[1]('b'));
		expect(result.current[0]).toBe('b');
		expect(localStorage.getItem('k')).toBe(JSON.stringify('b'));
	});
});
```

---

## 14. 卒業課題（やってみよう）

ここまで読んで写経したら、以下の課題を **自力で** やってみてください。すべて実用的なフックです。

### 14-1. 初級

1. **`useToggle` の応用**: `useDisclosure` を作る（`isOpen` / `open` / `close` / `toggle` を返す）
2. **`useInterval`**: 一定間隔でコールバックを呼ぶ（`useRef` で最新コールバックを保持）
3. **`useWindowSize`**: ウィンドウサイズを返す（リサイズ追従）

### 14-2. 中級

4. **`useClickOutside`**: 指定要素の外をクリックしたらコールバックを呼ぶ（モーダル閉じに使う）
5. **`useCopyToClipboard`**: クリップボードにコピー（`[copy(text), { copied, error }]` の形）
6. **`useScrollPosition`**: スクロール位置を返す（パフォーマンスのため `requestAnimationFrame` でスロットル）

### 14-3. 上級

7. **`useUndo`**: 任意の state に Undo / Redo 機能を付ける（`useReducer` で history を管理）
8. **`useQuery`**: SWR の劣化版を作る（`{ data, error, isLoading, refetch }` を返し、同じキーは重複フェッチしない）
9. **`useForm`**: フォーム状態を管理（`{ values, errors, handleChange, handleSubmit, reset }`）

各課題、解答例は **本ドキュメントには載せていません**。自分で考えて書き、動かし、テストしてみてください。詰まったらこのドキュメントの章に戻る → React 公式ドキュメントを読む → それでも分からなければ質問。

---

## 15. チートシート

### 15-1. カスタムフック設計フローチャート

```
このロジック、複数の場所で使う？
├── No  → コンポーネント内に直接書く（早すぎる抽象化を避ける）
└── Yes → カスタムフック化を検討
         │
         ├── 状態を共有したい？
         │   ├── No  → 普通のカスタムフック
         │   └── Yes → useContext + カスタムフック / 外部ストア
         │
         └── 副作用が含まれる？
             └── Yes → useEffect でクリーンアップを必ず書く
```

### 15-2. 戻り値の選び方

| 戻り値の数 | 推奨 | 例 |
|---|---|---|
| 1 個 | プリミティブ | `useDebounce` → `T` |
| 2 個（値+setter） | タプル | `useToggle` → `[v, toggle]` |
| 3 個以上 | オブジェクト | `useFetch` → `{ data, error, status }` |

### 15-3. メモ化の判断

| ケース | `useCallback` | `useMemo` |
|---|---|---|
| 子に渡す関数（`memo` 子） | ✅ | — |
| 他フックの依存に入れる関数 | ✅ | — |
| `useEffect` の依存に入る計算結果 | — | ✅ |
| 重い計算 (>1ms) | — | ✅ |
| 子に渡すオブジェクト/配列 (`memo` 子) | — | ✅ |
| ただの加算など軽い処理 | ❌ | ❌ |

### 15-4. クリーンアップ必要なやつ一覧

| 設置物 | 解除方法 |
|---|---|
| `setTimeout` / `setInterval` | `clearTimeout` / `clearInterval` |
| `addEventListener` | `removeEventListener` |
| WebSocket / EventSource | `.close()` |
| Subscription（RxJS など） | `.unsubscribe()` |
| `fetch` | `AbortController.abort()` |
| `MutationObserver` / `IntersectionObserver` | `.disconnect()` |

「**`useEffect` 内で何かを start したら、必ず stop する return を書く**」と覚える。

---

## 完走おめでとうございます 🎉

ここまでで、あなたは以下を身につけました:

- ✅ Hooks のルールを **理由付きで** 説明できる
- ✅ カスタムフックを **目的別に** 設計できる（永続化、タイマー、非同期、DOM、合成）
- ✅ ベストプラクティス・アンチパターンを実例で判別できる
- ✅ カスタムフックを **テスト** できる

次のステップ:
- React 19 の新フック（`use` / `useActionState` / `useOptimistic` / `useTransition`）を学ぶ
- 実プロジェクトの "重複っぽいロジック" を見つけて、カスタムフックに抽出する練習
- TanStack Query / SWR / Jotai / Zustand のソースを読んで、プロのカスタムフック設計を学ぶ
