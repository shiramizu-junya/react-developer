# React 状態管理 完全攻略ガイド — State Management / Jotai / Zustand

> このドキュメントは「上から順に読んで・順に書いて・順に動かす」 1 ファイル完結の教材です。
> 解説とコードがセットになっており、各章で番号付きコード（①, ②, ...）を **自分の手で `src/lessons/10-state-management/` 配下に書く** ことで身につきます。
> 環境: React 19 + TypeScript + Vite (このプロジェクト) + jotai + zustand。
> 前提知識: `docs/react-hooks-deep-dive.md` の `useState` / `useReducer` / `useContext`。

---

## 目次

0. [このドキュメントの使い方](#0-このドキュメントの使い方)
1. [そもそも State Management とは何か](#1-そもそも-state-management-とは何か)
2. [React の state の 5 つの「階層」と持ち場](#2-react-の-state-の-5-つの階層と持ち場)
3. [なぜ Context だけでは厳しいのか](#3-なぜ-context-だけでは厳しいのか)
4. [状態管理ライブラリの 2 大流派 — Atomic vs Store](#4-状態管理ライブラリの-2-大流派--atomic-vs-store)
5. [ライブラリのインストール](#5-ライブラリのインストール)
6. [Jotai ① — 最小例（atom と useAtom）](#6-jotai--最小例atom-と-useatom)
7. [Jotai ② — 読み書きを分ける `useAtomValue` / `useSetAtom`](#7-jotai--読み書きを分ける-useatomvalue--usesetatom)
8. [Jotai ③ — 派生 atom（derived atom）](#8-jotai--派生-atomderived-atom)
9. [Jotai ④ — Writable derived atom（actions パターン）](#9-jotai--writable-derived-atomactions-パターン)
10. [Jotai ⑤ — 非同期 atom と Suspense](#10-jotai--非同期-atom-と-suspense)
11. [Jotai ⑥ — `atomWithStorage` で永続化](#11-jotai--atomwithstorage-で永続化)
12. [Jotai ⑦ — Provider でスコープを切る](#12-jotai--provider-でスコープを切る)
13. [Zustand ① — 最小例（create と useStore）](#13-zustand--最小例create-と-usestore)
14. [Zustand ② — セレクタでパフォーマンス最適化](#14-zustand--セレクタでパフォーマンス最適化)
15. [Zustand ③ — persist ミドルウェアで永続化](#15-zustand--persist-ミドルウェアで永続化)
16. [Zustand ④ — devtools / immer ミドルウェア](#16-zustand--devtools--immer-ミドルウェア)
17. [Zustand ⑤ — スライスパターンで大規模化に備える](#17-zustand--スライスパターンで大規模化に備える)
18. [Zustand ⑥ — 非同期 actions](#18-zustand--非同期-actions)
19. [Context / Jotai / Zustand 選定ガイド](#19-context--jotai--zustand-選定ガイド)
20. [ベストプラクティス](#20-ベストプラクティス)
21. [アンチパターン集](#21-アンチパターン集)
22. [やってみよう（卒業課題）](#22-やってみよう卒業課題)
23. [チートシート](#23-チートシート)

---

## 0. このドキュメントの使い方

### 0-1. 進め方

1. 各章の **解説** を読む
2. 「**コード①**」などの番号付きブロックを、指示されたパスに **自分の手で写経** する
3. 章末の **動作確認** で挙動を見る
4. 章末の **やってみよう** で改造する

### 0-2. ディレクトリ構成（最終形）

```
src/lessons/10-state-management/
├── StateManagementDemo.tsx       ← 各章の表示切替の起点
├── jotai/
│   ├── atoms.ts
│   ├── BasicDemo.tsx             ← コード①
│   ├── ReadWriteDemo.tsx         ← コード②
│   ├── DerivedDemo.tsx           ← コード③
│   ├── ActionAtomDemo.tsx        ← コード④
│   ├── AsyncDemo.tsx             ← コード⑤
│   ├── PersistDemo.tsx           ← コード⑥
│   └── ProviderDemo.tsx          ← コード⑦
└── zustand/
    ├── useCounterStore.ts        ← コード⑧
    ├── BasicDemo.tsx
    ├── SelectorDemo.tsx          ← コード⑨
    ├── usePersistedStore.ts      ← コード⑩
    ├── PersistDemo.tsx
    ├── slices/
    │   ├── createBearSlice.ts    ← コード⑪
    │   ├── createFishSlice.ts
    │   └── useBoundStore.ts
    └── AsyncDemo.tsx             ← コード⑫
```

---

## 1. そもそも State Management とは何か

### 1-1. 一文で言うと

> **「アプリ全体で **保持する必要のあるデータ** を、いつ・誰が・どう更新して・どこから見えるようにするかを設計すること」**

具体例:
- ログインユーザー情報 → ヘッダーにも、設定ページにも出る
- ショッピングカート → カートページにも、各商品ページの「カートに入れる」ボタンにも影響
- テーマ（ダーク/ライト） → 全画面の見た目に効く

これらを **どこか 1 箇所にまとめて、必要な場所から読み書きできる** ようにするのが状態管理の仕事です。

### 1-2. なぜ「管理」が必要なのか

state は「**真実の源（Single Source of Truth）**」になる必要があります。同じデータが別々に存在すると:

```
ヘッダー: ログイン中 ✅
設定ページ: ログアウト中 ❌
```

…のような **不整合** が起きる。これを防ぐため、「ある事実は 1 つの場所にだけ持つ」のが鉄則。

### 1-3. 入力（input）と状態（state）の関係

引用元記事の定義に従うと:

| 用語 | 意味 |
|---|---|
| **input** | ユーザーがアプリに与える情報（クリック、入力、API レスポンスなど） |
| **state** | input が積み上がって出来た「アプリの今の姿」 |

つまり「state とは、これまで起きた input の集積結果」。同じ input 系列を再生すると同じ state に至る（→ Redux の time-travel デバッグの原理）。

---

## 2. React の state の 5 つの「階層」と持ち場

「状態管理ライブラリを使うべきか？」を判断するために、まず **「state の階層」** を理解しましょう。

### 2-1. 5 つの階層

```
┌────────────────────────────────────────┐
│ ① ローカル UI 状態（コンポーネント内）  │  useState / useReducer
├────────────────────────────────────────┤
│ ② 親子で共有する状態                    │  props で渡す
├────────────────────────────────────────┤
│ ③ ツリーをまたぐ共有状態                 │  useContext
├────────────────────────────────────────┤
│ ④ アプリ全体のグローバル状態             │  Jotai / Zustand / Redux
├────────────────────────────────────────┤
│ ⑤ サーバー由来のキャッシュ状態           │  TanStack Query / SWR
└────────────────────────────────────────┘
```

### 2-2. それぞれの判別基準

| 階層 | 例 |
|---|---|
| ① ローカル | モーダルの開閉、入力欄の中身、トグル |
| ② 親子で | 親の選択 → 子のフィルタ表示 |
| ③ Context | テーマ、言語、認証ユーザー（読み取り中心、変更が稀） |
| ④ Global | カート、通知、UI 全体の状態（**頻繁に更新される共有 state**） |
| ⑤ Server cache | API から取ってきた一覧データ、ユーザー一覧 |

### 2-3. よくある勘違い

> **「とりあえず Redux/Zustand に入れとけ」は失敗の元。**

ローカル UI 状態までグローバルに置くと:
- 不要な再レンダー
- テストしにくい（DOM と state がアプリ全体に依存）
- 何のための state か分からなくなる

**まず `useState`、足りなくなったら昇格** が鉄則。

---

## 3. なぜ Context だけでは厳しいのか

「グローバル状態は useContext で良くない？」という疑問。**ある程度までは良い** けど、規模が大きくなると問題が出ます。

### 3-1. 問題: Context 値が変わると配下の全 Consumer が再レンダー

```tsx
const AppCtx = createContext({ user: null, theme: 'light', cart: [] });

<AppCtx.Provider value={{ user, theme, cart }}>
  <Header />   // user だけ使ってる
  <Sidebar />  // theme だけ使ってる
  <Main />     // cart だけ使ってる
</AppCtx.Provider>
```

`cart` が変わっただけで、**user / theme しか使ってない Header / Sidebar まで再レンダー** されます。

これは React の **`useContext` の仕様**（Provider の `value` が変わると配下の全 Consumer が再レンダー）によるもの。Context を **分割** すれば回避できますが…

### 3-2. 分割しても辛い

```tsx
<UserCtx.Provider>
  <ThemeCtx.Provider>
    <CartCtx.Provider>
      ...
    </CartCtx.Provider>
  </ThemeCtx.Provider>
</UserCtx.Provider>
```

「Provider ピラミッド」と呼ばれる地獄。さらに **派生値**（`user.isAdmin` のような計算結果）を作りにくい、**非同期更新**が書きにくい、**永続化**を毎回手で書く必要がある、など辛みが増えます。

### 3-3. 状態管理ライブラリの存在理由

そこで「**Context の良さを残しつつ、再レンダー範囲を細かく制御し、派生・非同期・永続化を簡潔に書ける**」ライブラリが生まれます。代表が:

- **Jotai** — atom 単位で購読、原子論的（Atomic）
- **Zustand** — store 単位で購読、シンプルでフックベース
- **Redux Toolkit** — 大規模・厳格な構造（本ドキュメントは対象外）
- **Recoil** — Meta 製、最近メンテ停止傾向

---

## 4. 状態管理ライブラリの 2 大流派 — Atomic vs Store

ここを押さえると Jotai と Zustand の違いがスッと入ります。

### 4-1. Atomic（原子論）派 — Jotai, Recoil

> **「小さい状態（atom）をたくさん作って、組み合わせて使う」**

```
counter atom: 0
name atom: 'Alice'
isAdmin atom: false
↓ 組み合わせて
displayName atom = name + (isAdmin ? '(admin)' : '')
```

**特徴**:
- ボトムアップ
- 各 atom を購読しているコンポーネントだけ再レンダー（=細かい制御が無料）
- 派生（derived）が自然に書ける
- Context API と相性が良い

### 4-2. Store（中央集権）派 — Zustand, Redux

> **「大きな箱（store）に全 state を入れて、欲しい部分だけ取り出す」**

```ts
store = {
  count: 0,
  user: { name: 'Alice' },
  cart: [...],
  increment, addToCart, ...
}
```

**特徴**:
- トップダウン
- 1 つの store にまとまるので **全体像が見やすい**
- セレクタで欲しい部分だけ取って再レンダーを抑える
- React 外（普通の JS から）でも使える

### 4-3. どっちがどっち向き？

| 状態の性質 | Atomic (Jotai) | Store (Zustand) |
|---|---|---|
| 多くの小さな独立 state | ◎ | ○ |
| 関連する state がまとまった塊 | ○ | ◎ |
| 派生計算が多い | ◎ | ○ |
| React 外から触りたい | △ | ◎ |
| Suspense との統合 | ◎ | △ |
| 学習コスト | 中 | 低 |

「**どっちが正解**」ではなく、**チーム文化と state の性質次第**。両方触ってから決めると判断材料が増えます。

---

## 5. ライブラリのインストール

```bash
npm install jotai zustand
```

`package.json` の `dependencies` に両方が入っていれば OK。

---

## 6. Jotai ① — 最小例（atom と useAtom）

ここから Jotai を触っていきます。**「`useState` のグローバル版」** という感覚で始めましょう。

### 6-1. コード① — まずはカウンタ

**`src/lessons/10-state-management/jotai/atoms.ts`**

```ts
import { atom } from 'jotai';

// グローバルな状態の単位（atom）を定義
export const countAtom = atom(0);
```

**`src/lessons/10-state-management/jotai/BasicDemo.tsx`**

```tsx
import { useAtom } from 'jotai';
import { countAtom } from './atoms';

function CounterA() {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      <p>A 側の count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>A で +1</button>
    </div>
  );
}

function CounterB() {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      <p>B 側の count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>B で +1</button>
    </div>
  );
}

export function JotaiBasicDemo() {
  return (
    <section style={{ border: '1px solid #ccc', padding: 12 }}>
      <h2>Jotai ① basic</h2>
      <CounterA />
      <CounterB />
    </section>
  );
}
```

### 6-2. 動作確認

`StateManagementDemo.tsx` に `<JotaiBasicDemo />` を表示してください。

- A で +1 → B も同じ count に変わる ✅ 共有されている
- 何の Provider もラップしていないのに動く ✅ デフォルトの Store が暗黙的に用意されている

### 6-3. ポイント

```ts
const countAtom = atom(0);
```

これだけで:
- `countAtom` は **「初期値 0、誰でも読み書き可能な共有変数」** になる
- どこからでも `useAtom(countAtom)` で読み書きできる
- 値が変わると **その atom を購読しているコンポーネントだけ** 再レンダー

`useState` との違いは **「複数の場所で同じ state を共有できる」** こと。コンポーネント間で **props を渡さずに** 同期します。

---

## 7. Jotai ② — 読み書きを分ける `useAtomValue` / `useSetAtom`

`useAtom` は `useState` 同様 `[value, setter]` を返しますが、**読みたいだけ / 書きたいだけ** の場合に使える専用フックがあります。

### 7-1. なぜ分けるか

- `useAtomValue(atom)` … **読み取り専用**。atom の値が変わったときだけ再レンダー
- `useSetAtom(atom)` … **書き込み専用**。**値の変化で再レンダーされない**

「ボタンが atom を書き換えるだけで値は使わない」というケースで `useSetAtom` を使うと、**atom 変化時にそのボタンは再レンダーされません**。細かい最適化。

### 7-2. コード② — 表示と操作を分離

**`src/lessons/10-state-management/jotai/ReadWriteDemo.tsx`**

```tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { countAtom } from './atoms';

function Display() {
  const count = useAtomValue(countAtom);
  console.log('Display render');
  return <p>count = {count}</p>;
}

function Buttons() {
  const setCount = useSetAtom(countAtom);
  console.log('Buttons render');
  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={() => setCount(0)}>reset</button>
    </div>
  );
}

export function JotaiReadWriteDemo() {
  return (
    <section style={{ border: '1px solid #ccc', padding: 12 }}>
      <h2>Jotai ② read/write 分離</h2>
      <Display />
      <Buttons />
    </section>
  );
}
```

### 7-3. 動作確認

`+1` を押す → コンソールで **`Display render` だけが出る**（`Buttons render` は出ない）。

これは、`Buttons` は `useSetAtom` しか使ってないので **atom 値の変化で再レンダーされない** から。

> 💡 こうした「**購読範囲の細かい制御**」が Atomic 派の強み。

---

## 8. Jotai ③ — 派生 atom（derived atom）

複数の atom から **計算で求まる値** を作る仕組み。Redux でいうところの selector。

### 8-1. コード③ — derived atom

`atoms.ts` に追加:

```ts
import { atom } from 'jotai';

export const firstNameAtom = atom('Taro');
export const lastNameAtom = atom('Yamada');

// 派生 atom: 第 1 引数は (get) => ... の関数
export const fullNameAtom = atom((get) => `${get(firstNameAtom)} ${get(lastNameAtom)}`);
```

**`src/lessons/10-state-management/jotai/DerivedDemo.tsx`**

```tsx
import { useAtom, useAtomValue } from 'jotai';
import { firstNameAtom, fullNameAtom, lastNameAtom } from './atoms';

export function JotaiDerivedDemo() {
  const [first, setFirst] = useAtom(firstNameAtom);
  const [last, setLast] = useAtom(lastNameAtom);
  const full = useAtomValue(fullNameAtom);

  return (
    <section style={{ border: '1px solid #ccc', padding: 12 }}>
      <h2>Jotai ③ derived</h2>
      <input value={first} onChange={(e) => setFirst(e.target.value)} />
      <input value={last} onChange={(e) => setLast(e.target.value)} />
      <p>full = {full}</p>
    </section>
  );
}
```

### 8-2. ポイント

- `atom((get) => ...)` で **読み取り専用の派生 atom** を作る
- `get(otherAtom)` で他の atom の値を取り出す
- React のレンダリングと無関係に、**依存している atom が変わったときだけ再計算**される（メモ化込み）

`useMemo` を自分で書かなくて良い、というのが地味に大きいです。

---

## 9. Jotai ④ — Writable derived atom（actions パターン）

`atom((get) => ...)` は読み取り専用。第 2 引数を渡すと **書き込みもできる** 派生 atom が作れます。これを使って **「副作用つきの actions」** を表現するのが定番パターン。

### 9-1. コード④ — increment action atom

`atoms.ts` に追加:

```ts
// 第 2 引数で「set されたときの挙動」を定義
export const incrementCountAtom = atom(
  null,                            // 読み取りは常に null（書き込み専用 atom）
  (get, set) => {
    set(countAtom, get(countAtom) + 1);
    console.log('incremented');
  },
);
```

**`src/lessons/10-state-management/jotai/ActionAtomDemo.tsx`**

```tsx
import { useAtomValue, useSetAtom } from 'jotai';
import { countAtom, incrementCountAtom } from './atoms';

export function JotaiActionAtomDemo() {
  const count = useAtomValue(countAtom);
  const increment = useSetAtom(incrementCountAtom); // 書き込み専用 atom の setter = action

  return (
    <section style={{ border: '1px solid #ccc', padding: 12 }}>
      <h2>Jotai ④ action atom</h2>
      <p>count: {count}</p>
      <button onClick={() => increment()}>increment via action atom</button>
    </section>
  );
}
```

### 9-2. ポイント

- Read 側を `null` にすると **「action 専用 atom」** になる
- `useSetAtom(actionAtom)` で **action 関数のように** 呼べる
- Redux の dispatch みたいなことを atom レベルで表現できる
- 複雑な更新（複数 atom を一度に変える、ログを残す、API を叩く）をここに集約

> 💡 「**state は atom**、**action も atom**」が Jotai 流。

---

## 10. Jotai ⑤ — 非同期 atom と Suspense

`atom` の戻り値を `Promise` にすると **非同期 atom** になります。`useAtomValue` で Promise を受け取ると、Jotai は **Suspense** と連携してくれます。

### 10-1. コード⑤ — API から取得

`atoms.ts` に追加:

```ts
type Todo = { id: number; title: string };

export const todoIdAtom = atom(1); // 取得したい ID
export const todoAtom = atom(async (get): Promise<Todo> => {
  const id = get(todoIdAtom);
  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
  return res.json();
});
```

**`src/lessons/10-state-management/jotai/AsyncDemo.tsx`**

```tsx
import { Suspense } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { todoAtom, todoIdAtom } from './atoms';

function TodoView() {
  const todo = useAtomValue(todoAtom); // ← Promise が解決するまで Suspense
  return <p>#{todo.id}: {todo.title}</p>;
}

export function JotaiAsyncDemo() {
  const [id, setId] = useAtom(todoIdAtom);
  return (
    <section style={{ border: '1px solid #ccc', padding: 12 }}>
      <h2>Jotai ⑤ async</h2>
      <button onClick={() => setId((i) => i + 1)}>次の TODO へ</button>
      <p>現在の ID: {id}</p>
      <Suspense fallback={<p>loading...</p>}>
        <TodoView />
      </Suspense>
    </section>
  );
}
```

### 10-2. ポイント

- `atom(async (get) => ...)` で非同期 atom
- `useAtomValue(asyncAtom)` は **Promise が解決するまで Suspense** に投げる（読み出した瞬間に "throw promise" になる）
- `todoIdAtom` を変えると `todoAtom` が **自動で再フェッチ** される（依存関係が宣言的）

`useEffect + fetch + setState + loading` を全部書かなくて良い。

### 10-3. エラーハンドリング

`<ErrorBoundary>` を上に置けば、`throw` されたエラーをそこでキャッチできます:

```tsx
<ErrorBoundary fallback={<p>エラー</p>}>
  <Suspense fallback={...}>
    <TodoView />
  </Suspense>
</ErrorBoundary>
```

`ErrorBoundary` は React の標準機能（自作 or `react-error-boundary` パッケージ）。

---

## 11. Jotai ⑥ — `atomWithStorage` で永続化

ブラウザを閉じても値を残したい場合、`atomWithStorage` を使うと **localStorage / sessionStorage と自動同期** されます。

### 11-1. コード⑥ — テーマを永続化

`atoms.ts` に追加:

```ts
import { atomWithStorage } from 'jotai/utils';

export const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');
```

**`src/lessons/10-state-management/jotai/PersistDemo.tsx`**

```tsx
import { useAtom } from 'jotai';
import { themeAtom } from './atoms';

export function JotaiPersistDemo() {
  const [theme, setTheme] = useAtom(themeAtom);
  return (
    <section style={{ border: '1px solid #ccc', padding: 12, background: theme === 'dark' ? '#222' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
      <h2>Jotai ⑥ persist</h2>
      <p>theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切替</button>
    </section>
  );
}
```

リロードしても theme が残れば成功。

### 11-2. ポイント

- 第 1 引数: **localStorage のキー**
- 第 2 引数: **初期値**
- 内部で `JSON.stringify/parse` するので、オブジェクトもそのまま保存できる
- **タブ間で自動同期** される（storage イベント経由）

---

## 12. Jotai ⑦ — Provider でスコープを切る

デフォルトでは Jotai は **アプリ全体で 1 つの Store** を使います。が、**`Provider` で囲むと、その配下だけ別のスコープ** にできます。

### 12-1. ユースケース

- モーダル内の form state を、モーダルを開くたびにリセットしたい
- 1 つのコンポーネントを 2 箇所に置きたいけど state は独立させたい
- テスト時に他の atom と分離したい

### 12-2. コード⑦ — 独立スコープ

**`src/lessons/10-state-management/jotai/ProviderDemo.tsx`**

```tsx
import { Provider, useAtom } from 'jotai';
import { countAtom } from './atoms';

function Counter({ label }: { label: string }) {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      <p>{label}: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}

export function JotaiProviderDemo() {
  return (
    <section style={{ border: '1px solid #ccc', padding: 12 }}>
      <h2>Jotai ⑦ Provider scope</h2>
      <p>同じ countAtom でも Provider が違えば値は独立</p>
      <Provider><Counter label="Scope A" /></Provider>
      <Provider><Counter label="Scope B" /></Provider>
      <Counter label="グローバル（Provider 無し）" />
    </section>
  );
}
```

### 12-3. ポイント

- `<Provider>` 配下では **その atom が独立した Store** を使う
- Provider 外（or 別 Provider）の Counter とは値が同期しない
- Provider をアンマウントすれば値も消える

---

## 13. Zustand ① — 最小例（create と useStore）

ここから Zustand です。**「グローバル変数だけど React と統合された」** という感覚。

### 13-1. コード⑧ — カウンタストア

**`src/lessons/10-state-management/zustand/useCounterStore.ts`**

```ts
import { create } from 'zustand';

type CounterStore = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

**`src/lessons/10-state-management/zustand/BasicDemo.tsx`**

```tsx
import { useCounterStore } from './useCounterStore';

function Display() {
  const count = useCounterStore((s) => s.count);
  return <p>count = {count}</p>;
}

function Buttons() {
  const { increment, decrement, reset } = useCounterStore();
  return (
    <div>
      <button onClick={decrement}>-1</button>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>reset</button>
    </div>
  );
}

export function ZustandBasicDemo() {
  return (
    <section style={{ border: '1px solid #ccc', padding: 12 }}>
      <h2>Zustand ① basic</h2>
      <Display />
      <Buttons />
    </section>
  );
}
```

### 13-2. ポイント

```ts
create<T>((set) => ({ ... }))
```

- `create` で **「フックそのもの」** を返す（`useXxxStore` は呼べばフックになる）
- 第 1 引数の `set` を使って state を更新（React の `setState` 風）
- 戻り値の `{ ... }` が **store の中身**（state + actions）
- **Provider 不要**。モジュールスコープの変数に state が居る
- TS では `create<CounterStore>` でジェネリック指定 → 型安全

### 13-3. 重要な特徴

- 1 つの `useXxxStore()` だけ呼べば、コンポーネントは **store 全体の変更で再レンダー**
- 部分だけ取りたいなら **セレクタ** を渡す（次章）

---

## 14. Zustand ② — セレクタでパフォーマンス最適化

`useStore()` を引数なしで呼ぶと、store の **どの部分が変わっても再レンダー** されてしまいます。必要な部分だけ取る **セレクタ** を使うのが原則。

### 14-1. コード⑨ — セレクタの威力

**`src/lessons/10-state-management/zustand/SelectorDemo.tsx`**

```tsx
import { useCounterStore } from './useCounterStore';

function DisplayBad() {
  // ❌ store 全体を取ってる → 何が変わっても再レンダー
  const store = useCounterStore();
  console.log('DisplayBad render');
  return <p>BAD count = {store.count}</p>;
}

function DisplayGood() {
  // ✅ count だけ取る → count が変わったときだけ再レンダー
  const count = useCounterStore((s) => s.count);
  console.log('DisplayGood render');
  return <p>GOOD count = {count}</p>;
}

function IncrementButton() {
  // ✅ actions だけ取る → 関数の参照は変わらないので再レンダーしない
  const increment = useCounterStore((s) => s.increment);
  console.log('IncrementButton render');
  return <button onClick={increment}>+1</button>;
}

export function ZustandSelectorDemo() {
  return (
    <section style={{ border: '1px solid #ccc', padding: 12 }}>
      <h2>Zustand ② selector</h2>
      <DisplayBad />
      <DisplayGood />
      <IncrementButton />
    </section>
  );
}
```

### 14-2. セレクタの使い分け

```tsx
// ① 単一プロパティ
const count = useStore((s) => s.count);

// ② 複数プロパティ → オブジェクトで返すと「毎回新オブジェクト」になり再レンダーが頻発
const { count, name } = useStore((s) => ({ count: s.count, name: s.name })); // ❌

// ③ 上の正解: useShallow で「中身が同じなら同じ」と判定させる
import { useShallow } from 'zustand/react/shallow';
const { count, name } = useStore(useShallow((s) => ({ count: s.count, name: s.name }))); // ✅
```

`useShallow` は浅い比較で「中身が等しいなら再レンダーしない」を実現します。

### 14-3. ポイント

- **何も考えず `useStore()` を呼ぶと再レンダー過多** になりやすい
- 単一プロパティはセレクタで取り出す
- 複数プロパティが必要なら `useShallow` を挟む
- actions だけ取るパターン（`useStore((s) => s.action)`) は **値変化で再レンダーされない** のでボタンに最適

---

## 15. Zustand ③ — persist ミドルウェアで永続化

ミドルウェアで `create` をラップすると、永続化・devtools 連携・immer など追加機能が入ります。

### 15-1. コード⑩ — persist

**`src/lessons/10-state-management/zustand/usePersistedStore.ts`**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Settings = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const usePersistedStore = create<Settings>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'settings-storage', // localStorage のキー
      // storage: createJSONStorage(() => sessionStorage), // セッションに切替も可
    },
  ),
);
```

**`src/lessons/10-state-management/zustand/PersistDemo.tsx`**

```tsx
import { usePersistedStore } from './usePersistedStore';

export function ZustandPersistDemo() {
  const theme = usePersistedStore((s) => s.theme);
  const toggle = usePersistedStore((s) => s.toggleTheme);
  return (
    <section style={{ border: '1px solid #ccc', padding: 12, background: theme === 'dark' ? '#222' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
      <h2>Zustand ③ persist</h2>
      <p>theme: {theme}</p>
      <button onClick={toggle}>切替</button>
    </section>
  );
}
```

リロードしても theme が残ります。

### 15-2. ポイント

- `persist(stateCreator, { name })` でラップ
- `create<T>()(...)` の **`()` を 2 回呼ぶ書き方**（カリー化）は TS 推論のため
- 一部だけ永続化したい時は `partialize` オプション

```ts
persist(stateCreator, {
  name: 'foo',
  partialize: (state) => ({ theme: state.theme }), // theme だけ保存
})
```

---

## 16. Zustand ④ — devtools / immer ミドルウェア

### 16-1. devtools

```ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create<T>()(
  devtools(
    (set) => ({ ... }),
    { name: 'my-store' },
  ),
);
```

Chrome の **Redux DevTools 拡張** をインストールしておくと、Zustand の state 変化が **Redux 風のタイムライン** で見られます。デバッグの強力な武器。

### 16-2. immer

```ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = { todos: { id: number; done: boolean }[] };

export const useStore = create<State>()(
  immer((set) => ({
    todos: [],
    toggle: (id: number) =>
      set((state) => {
        // ↓ 直接ミューテーションして OK（immer が内部でイミュータブルに変換）
        const t = state.todos.find((t) => t.id === id);
        if (t) t.done = !t.done;
      }),
  })),
);
```

ネストが深い state を更新するとき、`{ ...prev, foo: { ...prev.foo, bar: 1 } }` のスプレッド地獄を回避できます。

### 16-3. ミドルウェアの組み合わせ

```ts
create<T>()(
  devtools(
    persist(
      immer((set) => ({ ... })),
      { name: 'my-store' },
    ),
  ),
);
```

順序は **外から内** に効いていく。デバッグ用に devtools を一番外に置くのが定番。

---

## 17. Zustand ⑤ — スライスパターンで大規模化に備える

store が肥大化すると 1 ファイルが地獄になります。**スライス** で機能ごとに切り分けます。

### 17-1. コード⑪ — スライス例

**`src/lessons/10-state-management/zustand/slices/createBearSlice.ts`**

```ts
import type { StateCreator } from 'zustand';

export type BearSlice = {
  bears: number;
  addBear: () => void;
};

export const createBearSlice: StateCreator<BearSlice & FishSlice, [], [], BearSlice> = (set) => ({
  bears: 0,
  addBear: () => set((s) => ({ bears: s.bears + 1 })),
});

import type { FishSlice } from './createFishSlice'; // 循環参照気味だが型のみなので OK
```

**`src/lessons/10-state-management/zustand/slices/createFishSlice.ts`**

```ts
import type { StateCreator } from 'zustand';

export type FishSlice = {
  fishes: number;
  addFish: () => void;
};

export const createFishSlice: StateCreator<BearSlice & FishSlice, [], [], FishSlice> = (set) => ({
  fishes: 0,
  addFish: () => set((s) => ({ fishes: s.fishes + 1 })),
});

import type { BearSlice } from './createBearSlice';
```

**`src/lessons/10-state-management/zustand/slices/useBoundStore.ts`**

```ts
import { create } from 'zustand';
import { createBearSlice, type BearSlice } from './createBearSlice';
import { createFishSlice, type FishSlice } from './createFishSlice';

export const useBoundStore = create<BearSlice & FishSlice>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}));
```

使う側:

```tsx
const bears = useBoundStore((s) => s.bears);
const addBear = useBoundStore((s) => s.addBear);
const fishes = useBoundStore((s) => s.fishes);
```

### 17-2. ポイント

- スライスごとに **state + actions** をまとめる
- store 本体（`useBoundStore`）はスライスを **マージするだけ**
- 機能追加 = 新スライス追加で済む
- 大規模アプリで Zustand を使うときの定番構成

---

## 18. Zustand ⑥ — 非同期 actions

API 呼び出しなどの非同期処理も、actions の中に書けます。

### 18-1. コード⑫ — fetch する action

```ts
type TodoStore = {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
};

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  loading: false,
  error: null,
  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Todo[] = await res.json();
      set({ todos: data, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },
}));
```

使う側:

```tsx
const { todos, loading, error, fetchTodos } = useTodoStore(useShallow((s) => ({
  todos: s.todos, loading: s.loading, error: s.error, fetchTodos: s.fetchTodos,
})));

useEffect(() => { fetchTodos(); }, [fetchTodos]);
```

### 18-2. ポイント

- 非同期処理は **action 関数の中** で完結（`async/await` をそのまま書ける）
- 進行中・成功・失敗で `set` を分けて状態機械を表現
- **TanStack Query との比較**: 単純な API キャッシュ用途なら TanStack Query の方が機能豊富（リトライ、キャッシュ無効化、ポーリングなど）。Zustand で自前実装は学習用 or 軽量用途向け

---

## 19. Context / Jotai / Zustand 選定ガイド

### 19-1. 判断フローチャート

```
そのデータ、本当にコンポーネント外に出す必要ある？
├── No → useState / useReducer のまま
└── Yes
    │
    ├── テーマ・認証ユーザーなど「読み取り中心・変更稀」？
    │   └── Yes → useContext で十分
    │
    ├── 細かい派生・非同期・Suspense 連携が欲しい？
    │   └── Yes → Jotai
    │
    ├── 1 つの大きい store にまとめたほうが見やすい？
    │   └── Yes → Zustand
    │
    └── サーバーから取ったデータのキャッシュ管理？
        └── Yes → TanStack Query / SWR
```

### 19-2. 比較表

| 観点 | useContext | Jotai | Zustand |
|---|---|---|---|
| **設定の手間** | ◎（標準）| ◯ | ◎ |
| **Provider 必須** | ◎（必須）| △（任意）| ◎（不要）|
| **再レンダー制御** | △ | ◎（atom 単位）| ○（セレクタ）|
| **派生値の宣言** | △ | ◎ | △ |
| **非同期/Suspense** | △ | ◎ | △ |
| **devtools** | × | △ | ◎（Redux DevTools）|
| **永続化** | 自前 | `atomWithStorage` | `persist` ミドル |
| **React 外で使える** | × | △ | ◎ |
| **学習コスト** | 低 | 中 | 低 |

### 19-3. プロジェクト規模別おすすめ

| 規模 | おすすめ |
|---|---|
| 小（〜数画面） | `useContext` |
| 中（10〜30 画面） | `Zustand` 一択でシンプルに |
| 大（複雑な派生・分散 state） | `Jotai`（or RTK Query + Jotai）|
| サーバー state が主役 | `TanStack Query` + 上記いずれか |

---

## 20. ベストプラクティス

### 20-1. ✅ **まずローカル**、足りなくなったら昇格

`useState` で書く → 共有が必要になったら Context → さらに困ったら Jotai/Zustand。**逆順から始めない**。

### 20-2. ✅ **state と actions を一緒に置く**

「state を変更する全ロジック」を store/atom 内に集約。コンポーネントは action を呼ぶだけ。テストしやすく、追跡しやすい。

### 20-3. ✅ **派生値は派生 atom / セレクタで宣言**

コンポーネント内で `useMemo` で計算するより、store/atom 側で宣言する方がキャッシュ効率と再利用性が良い。

### 20-4. ✅ **セレクタは細かく**

Zustand なら `useStore((s) => s.foo)`、Jotai なら個別 atom。一気に取らない。

### 20-5. ✅ **non-serializable は入れない**

DOM ノード、関数、`Date` インスタンス、`Map`/`Set` を store に入れるのはトラブルの元。永続化・devtools・SSR で詰む。state はプレーンに保つ。

### 20-6. ✅ **server state と client state を混ぜない**

API から取ったデータ → TanStack Query / SWR で管理。UI 状態 → Zustand / Jotai。同じ store に混ぜるとキャッシュ・無効化が地獄。

### 20-7. ✅ **ストア外（普通の関数）から呼べる利点を活用**

Zustand なら `useCounterStore.getState().increment()` のように React 外から触れる。WebSocket ハンドラ、axios インターセプタなど、フックを使えない場所での state 更新に便利。

### 20-8. ✅ **テストで store をリセット**

```ts
// Zustand
beforeEach(() => useCounterStore.setState({ count: 0 }));

// Jotai
test('...', () => {
  // Provider でラップしてスコープを切る
  render(<Provider><Component /></Provider>);
});
```

---

## 21. アンチパターン集

### 21-1. 🚫 ローカル state まで全部 global

入力中の値、モーダル開閉などまで Zustand に入れる → 不要な再レンダー、テストしにくい。**ローカル UI は useState**。

### 21-2. 🚫 1 つの巨大 Context に全部詰める

`<AppContext>` に user, theme, cart, notifications を全部入れる → 1 つ変わると全 Consumer 再レンダー。**役割で分割**するか、Jotai/Zustand に移行。

### 21-3. 🚫 Zustand で `useStore()` 引数なし呼び

```tsx
const { count } = useStore(); // ❌ どのフィールドが変わっても再レンダー
```

→ 必ずセレクタを書く。

### 21-4. 🚫 セレクタの中で毎回新オブジェクトを返す

```tsx
const { a, b } = useStore((s) => ({ a: s.a, b: s.b })); // ❌
```

→ `useShallow` を使うか、別々に取る。

### 21-5. 🚫 atom や store の中で副作用を直接実行

```ts
const myAtom = atom((get) => {
  fetch(...); // ❌ atom の評価中に副作用
  return 0;
});
```

→ 非同期 atom や action atom で `set` のタイミングに副作用を入れる。

### 21-6. 🚫 同じデータを Server cache と Global store の両方に持つ

両者が乖離する。**真実の源を 1 つに**。

### 21-7. 🚫 永続化したいから何でも persist

API レスポンス、フォーム入力中などを persist するとリロード後の挙動が破綻。「**ユーザー設定**」「**カート**」など意図的なもののみ。

---

## 22. やってみよう（卒業課題）

### 22-1. 初級

1. **Jotai でカウンタ**: A/B 2 つのコンポーネントで `useAtom` を呼んで同期確認
2. **Jotai の derived**: `priceAtom` と `quantityAtom` から `totalAtom` を作る
3. **Zustand でトグル**: `useToggleStore` を作って 2 つの場所から同期させる

### 22-2. 中級

4. **Jotai で非同期 TODO 一覧**: `atomWithDefault` + 非同期 atom で API を叩いて Suspense 表示
5. **Zustand のカート**: 商品を追加/削除/数量変更できる store。selector で合計金額を出す
6. **Zustand + persist + immer**: ToDo リストを永続化、`toggle` を immer で書く

### 22-3. 上級

7. **Jotai vs Zustand 競作**: 同じ機能（ToDo アプリ）を両方で書いてコード量・再レンダー数を比較
8. **Zustand スライスパターン**: ユーザー/通知/UI の 3 スライスに分けた store を構築
9. **Jotai + ErrorBoundary**: 非同期 atom がエラーになったときフォールバック表示

---

## 23. チートシート

### 23-1. Jotai API 早見

| API | 用途 |
|---|---|
| `atom(initial)` | プリミティブ atom |
| `atom((get) => ...)` | 読み取り専用派生 atom |
| `atom(null, (get, set, arg) => ...)` | action atom |
| `atom((get, set) => ..., (get, set, arg) => ...)` | Writable derived atom |
| `atom(async (get) => ...)` | 非同期 atom |
| `atomWithStorage(key, initial)` | 永続化 atom |
| `useAtom(atom)` | `[value, setter]` |
| `useAtomValue(atom)` | 読み取り専用フック |
| `useSetAtom(atom)` | 書き込み専用フック |
| `<Provider>` | スコープ切り |

### 23-2. Zustand API 早見

| API | 用途 |
|---|---|
| `create<T>()(stateCreator)` | store を作る |
| `useStore((s) => s.foo)` | セレクタ |
| `useStore.getState()` | React 外から状態取得 |
| `useStore.setState({ ... })` | React 外から更新 |
| `useStore.subscribe(listener)` | 変更購読 |
| `persist(creator, { name })` | 永続化 |
| `devtools(creator)` | Redux DevTools 連携 |
| `immer(creator)` | ミューテーション風に書ける |
| `useShallow(selector)` | 複数フィールド取得時の浅い比較 |

### 23-3. 「どれ使う？」3 秒判定

```
状態の性質                            → 推奨

コンポーネント内だけ                  → useState
親子で渡せば足りる                    → props
ツリーをまたぐが変更が稀              → useContext
頻繁に変わる共有状態 (中規模)        → Zustand
派生・非同期が複雑                    → Jotai
サーバー由来データのキャッシュ        → TanStack Query
```

---

## 完走おめでとうございます 🎉

ここまでで、あなたは以下を身につけました:

- ✅ State Management の概念と「state の階層」が分かる
- ✅ Context だけでは厳しい理由（再レンダー範囲）を説明できる
- ✅ Atomic 派（Jotai）と Store 派（Zustand）の違いを理解
- ✅ Jotai の **atom / derived / action / 非同期 / 永続化 / Provider** を実装できる
- ✅ Zustand の **store / セレクタ / ミドルウェア / スライス / 非同期** を実装できる
- ✅ Context / Jotai / Zustand / TanStack Query の使い分けが判断できる

次のステップ:

- 既存の `07-todo-app` を Jotai / Zustand で書き直してみる
- `06-useContext` の `ThemeContext` を Jotai/Zustand に置き換えて比較
- TanStack Query を学んで「server state」を切り分ける感覚を掴む
- 大規模アプリでは **「Zustand + TanStack Query」** か **「Jotai + TanStack Query」** が現代の鉄板構成
