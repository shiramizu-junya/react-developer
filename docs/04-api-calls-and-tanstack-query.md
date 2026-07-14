# API 通信と TanStack Query 徹底入門 — 「素の fetch」から「サーバー状態管理」まで

> この1ファイルだけを **上から順に読みながら、自分の手でコードを書いていけば** 、
> 「React で API をどう叩くか」「なぜ生の `fetch` だけだと辛いのか」「その辛さを TanStack Query がどう肩代わりするのか」、最後に「自作の Django REST API と TanStack Query を接続して一覧取得＋登録（キャッシュ更新）まで」やり切れるように作っています。
>
> - 教材（解説）とコードは **分離していません** 。読み進める流れの中でコードが出てきます。
> - **写経 → 穴埋め → 自力** の順で、後半ほどあなたが書く量を増やします。
> - 各ステップに「**核 / 補足**」「**予測 → 動作確認**」「**想起チェック**」を必ず置いています。流し読みせず、隠して再現してください。
>
> 前提: このリポジトリは既に **Vite + React 19 + TypeScript** がセットアップ済みです（`docs/01`〜`03` 済みの状態）。TanStack Query と Django は本編の中で導入します。
>
> 想定読者: React/TypeScript は中級（`useState`/`useEffect`/カスタムフックは書ける）。バックエンドは Python/Django を学習中。「API 通信は `useEffect` で `fetch` すればいいんでしょ？ TanStack Query って結局なにが嬉しいの？」という人。

---

## 目次

1. [概要 — この教材で学べること](#1-概要--この教材で学べること)
2. [前提知識・環境](#2-前提知識環境)
3. [環境構築](#3-環境構築)
4. 本編（ステップ式）
   - [Step 1 素の `fetch` + `useEffect` でデータ取得（核）](#step-1-素の-fetch--useeffect-でデータ取得核)
   - [Step 2 loading / error の3状態を手で管理する（核）](#step-2-loading--error-の3状態を手で管理する核)
   - [Step 3 入力で再取得 — 依存配列とフォーム送信（核＋補足）](#step-3-入力で再取得--依存配列とフォーム送信核補足)
   - [Step 4 カスタムフックへ抽出し、汎用 `useQuery` を自作する（核）](#step-4-カスタムフックへ抽出し汎用-usequery-を自作する核)
   - [Step 5 TanStack Query 導入 — 自作 `useQuery` を捨てる（核）](#step-5-tanstack-query-導入--自作-usequery-を捨てる核)
   - [Step 6 実践 — Django REST API と接続し、`useMutation` で登録する（核＋補足）](#step-6-実践--django-rest-api-と接続しusemutation-で登録する核補足)
   - [Step 7 実務仕上げ — `staleTime` / `retry` / Devtools（補足）](#step-7-実務仕上げ--staletime--retry--devtools補足)
5. [つまずきポイント](#5-つまずきポイント)
6. [まとめ](#6-まとめ)
7. [宿題（アウトプット課題）](#7-宿題アウトプット課題)
8. [発展](#8-発展)

---

## 1. 概要 — この教材で学べること

元記事は2トピック（[API Calls] と [TanStack Query]）です。要点をまとめると：

- **API とは software-to-software のインターフェース** 。別のアプリと会話し、データや機能をやり取りする。React から API を叩く方法は複数あり（`fetch` / `axios` / カスタムフック / ライブラリ）、目的に応じて選ぶ。
- 素の React で API を叩く基本は **`useState`（データ置き場）＋ `useEffect`（マウント時に取得）** 。ただし「ローディング」「エラー」「再取得」「競合（race condition）」「キャッシュ」まで手で面倒を見ると、あっという間にコードが膨らむ。
- **TanStack Query（旧 React Query）** は、この「サーバー状態（server state）」の取得・**キャッシュ**・同期・更新を宣言的に扱うライブラリ。`useQuery`（取得）と `useMutation`（更新）＋ `invalidateQueries`（キャッシュ無効化＆再取得）が核。自動リトライ・バックグラウンド更新・重複排除などを **標準で** やってくれる。

この教材の流れは元記事の学習アークをそのまま使います：**まず生の `fetch` で辛さを体感 → 自分で `useQuery` もどきを作る → 「それ、TanStack Query が全部やってくれます」** という順で腹落ちさせます。

> 💡補足：元記事はフロントエンドの話が中心です。**バックエンド連携（Step 6・宿題 Lv3）は記事には無く**、あなたの学習スタック（Python/Django）に合わせて **私が追加** した部分です。明示します。
>
> 💡補足：元記事のサンプルは `axios` を使っていますが、本教材は **依存を増やさないため標準の `fetch`** を主に使います（`axios` 版の差分はその都度示します）。これは私の置き換えです。

[API Calls]: https://reactjs.org/docs/faq-ajax.html
[TanStack Query]: https://tanstack.com/query/latest

---

## 2. 前提知識・環境

| 区分 | 必要なもの | 確認コマンド |
|------|-----------|-------------|
| フロント | Node.js 20+ / npm | `node -v` |
| フロント | このリポジトリ（Vite + React 19 + TS） | `cat package.json` |
| フロント | `@tanstack/react-query`（Step 5 で入れる） | `npm ls @tanstack/react-query` |
| バック（Step 6〜） | uv（Python の環境・依存管理） | `uv --version` |
| バック（Step 6〜） | Python 3.11+（uv が無ければ自動で入る） | `uv python list` |
| 知識 | React の `useState` / `useEffect` / カスタムフック | — |
| 知識 | TypeScript の基本（型注釈・ジェネリクス少々） | — |
| 知識 | `async/await` と `Promise` の基本 | — |

**既知の知識との接続**：Step 1〜4 は `src/lessons/08-custom-hooks` で書いた「ロジックをフックに切り出す」発想の延長です。実は **`useQuery` という名前のフックを自分で作ってしまえば、TanStack Query の API はほぼ写し** です。Step 4 でそれを体感してから Step 5 に進みます。

Step 1〜4 は **公開 API（Hacker News の検索 API）** を使うので、**バックエンドは不要** です。Django が要るのは Step 6 からです。

---

## 3. 環境構築

### 3-1. フロント側（今すぐ）

このリポジトリの運用どおり、学習用コンポーネントは `src/lessons/13-data-fetching-tanstack/` に作り、`src/App.tsx` で表示を切り替えます。

```bash
# 1. 開発サーバを起動（http://localhost:5173）
npm run dev
```

> 📁 これから作るフォルダ：`src/lessons/13-data-fetching-tanstack/`

TanStack Query のインストールは **Step 5 の直前** で行います（それまでは標準機能だけで進めます）。

### 3-2. バック側（Step 6 で使う Django。今すぐでなくてOK）

`docs/03` と同じ構成です。**ルート直下の `backend/` に Django を立て、テンプレートは使わず JSON を返す REST API** にします。Step 6 の直前で実行すれば十分です。

```bash
# 0. リポジトリのルート（react-developer/）にいることを確認
pwd   # .../react-developer

# 1. ルート直下に backend/ を作って入る（既に docs/03 で作っていれば再利用でOK）
mkdir backend && cd backend

# 2. uv プロジェクトを初期化（pyproject.toml を作る。--bare でサンプルを作らない）
uv init --bare

# 3. 依存を追加（.venv を自動作成し pyproject.toml / uv.lock に記録）
uv add "django>=5.0" django-ninja django-cors-headers

# 4. Django プロジェクトを作成（backend/manage.py が生える）
uv run django-admin startproject config .
```

> 💡補足（uv）：uv は仮想環境を手動で activate しなくてよいのが利点。コマンドは `uv run <cmd>` で `.venv` 内のものが走ります。`uv add` は `pip install` ＋ `pyproject.toml`/`uv.lock` への記録を一度に行います。Python 自体が無ければ `uv python install 3.12`。
>
> 💡補足（バックエンド選定）：本教材は **Django Ninja** を採用（型ヒントから自動で JSON を返し、ボイラープレートが少ない）。DRF（Django REST Framework）でも同じことができ、差分は Step 6 に置きます。

---

## Step 1 素の `fetch` + `useEffect` でデータ取得（核）

**目的**：React で API を叩く「いちばん素の形」を写経する。記事の言う「`useState`（データ置き場）＋ `useEffect`（マウント時に取得）」を体感する。
**これは核**：面接で「React でどうやって API を叩く？」に、まずこの最小形を淀みなく書けることがゴール。

> 元記事は `axios` を使った JavaScript。ここでは **標準 `fetch` ＋ TypeScript に置き換え** ています（置き換え箇所：`axios(...)` → `fetch(...).then(r => r.json())`、および型注釈の追加）。ロジックは記事のままです。

### コード（写経）

Hacker News の検索 API（`https://hn.algolia.com/api/v1/search?query=react`）は、`{ hits: [{ objectID, title, url }, ...] }` という JSON を返します。これを一覧表示します。

> 📁 `src/lessons/13-data-fetching-tanstack/HnSearch.tsx`

```tsx
import { useEffect, useState } from 'react'

// APIのエンドポイント。?query=... で検索語を渡す
const API = 'https://hn.algolia.com/api/v1/search'

// レスポンスの1件分の型。TSの型は「サーバーが返すJSONの形」に合わせる
type Story = {
  objectID: string
  title: string
  url: string
}

export function HnSearch() {
  // データの置き場。初期値は空配列（まだ何も来ていない）
  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    // ❌ useEffectのコールバック自体を async にはしない（後述）。
    //    中に async 関数を定義して、それを呼ぶ。
    const fetchData = async () => {
      const res = await fetch(`${API}?query=react`)
      const json = await res.json()
      setStories(json.hits) // 取得できたらstateに入れる → 再レンダー
    }
    fetchData()
  }, []) // ← 空配列: マウント時に1回だけ実行

  return (
    <ul>
      {stories.map((story) => (
        <li key={story.objectID}>
          <a href={story.url}>{story.title}</a>
        </li>
      ))}
    </ul>
  )
}
```

`src/App.tsx` で表示します（以降、各ステップで表示するコンポーネントを差し替えていきます）。

```tsx
// src/App.tsx（該当行だけ）
import { HnSearch } from './lessons/13-data-fetching-tanstack/HnSearch'
// ...
<HnSearch />
```

### 解説（ブロックごと）

- **`useState<Story[]>([])`**：取得したデータの置き場。「サーバーから来るデータも、結局は React の state に入れて描画する」——これが素の API 通信の骨格。
- **`useEffect(() => {...}, [])`**：副作用（＝レンダリング以外の処理。ここでは通信）はレンダー中ではなく `useEffect` の中で行う。第2引数の **空配列 `[]` が「マウント時に1回だけ」** を意味する。
- **なぜ `useEffect(async () => ...)` にしないのか（核）**：`async` 関数は必ず `Promise` を返す。`useEffect` はコールバックの戻り値を「クリーンアップ関数」と解釈するので、`Promise` を返すと React が混乱する（警告が出る）。だから **中に `fetchData` を定義して呼ぶ** のが定石。
- **既知との接続**：`08-custom-hooks` で「副作用は `useEffect`、値は `useState`」と学んだそのままの適用です。

### 予測 → 動作確認

> 🔮 **実行する前に出力を予想してみよう**：観点 →「初回レンダーでは `stories` は空配列なので、一瞬 **何も表示されない**。通信が返ってきて `setStories` された **次のレンダー** で一覧が出るはず」。つまり画面には最初は空 → 少し遅れてリンク一覧、で合っているか？

```bash
npm run dev   # http://localhost:5173 を開く
```

期待される表示：

- 一瞬、空の `<ul>`（何も見えない）。
- 数百ミリ秒後、"react" に関する記事タイトルのリンクが並ぶ。
- ブラウザの Network タブに `search?query=react` へのリクエストが **1回** 記録される。

### 想起チェック

<details><summary>Q. なぜ <code>useEffect(async () =&gt; { ... })</code> と書いてはいけない？ 正しい書き方は？</summary>

`async` 関数は `Promise` を返す。`useEffect` はコールバックの戻り値を **クリーンアップ関数** とみなすため、`Promise` が返ると意図しない挙動・警告になる。正しくは **`useEffect` の中に `async` 関数（`fetchData`）を定義して、それを呼ぶ**。第2引数の空配列 `[]` で「マウント時1回」を表す。

</details>

---

## Step 2 loading / error の3状態を手で管理する（核）

**目的**：通信には「読み込み中」「成功」「失敗」の3状態がある。これを **手で** state 管理して、その面倒さを味わう。
**これは核**：この「3状態」は TanStack Query が `isPending` / `data` / `isError` として **標準で** くれるもの。まず手で書くことで、後で「これが自動で付いてくる」ありがたみが分かる。

### コード（写経）

> 📁 `src/lessons/13-data-fetching-tanstack/HnSearch.tsx`（Step 1 を拡張）

```tsx
import { useEffect, useState } from 'react'

const API = 'https://hn.algolia.com/api/v1/search'

type Story = {
  objectID: string
  title: string
  url: string
}

export function HnSearch() {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(false) // 読み込み中フラグ
  const [isError, setIsError] = useState(false) // エラーフラグ

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false) // 再実行に備えて毎回リセット
      setIsLoading(true) // 通信開始 → ローディングON

      try {
        const res = await fetch(`${API}?query=react`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`) // fetchは404等でも例外を投げない点に注意
        const json = await res.json()
        setStories(json.hits)
      } catch (error) {
        setIsError(true) // 通信/パース失敗
      } finally {
        setIsLoading(false) // 成功でも失敗でも最後にローディングOFF
      }
    }
    fetchData()
  }, [])

  if (isError) return <div>Something went wrong ...</div>
  if (isLoading) return <div>Loading ...</div>

  return (
    <ul>
      {stories.map((story) => (
        <li key={story.objectID}>
          <a href={story.url}>{story.title}</a>
        </li>
      ))}
    </ul>
  )
}
```

### 解説（ブロックごと）

- **3つの state**：`stories`（成功データ）/ `isLoading`（読み込み中）/ `isError`（失敗）。API 通信は最低でもこの3つが要る。
- **`try / catch / finally`**：`try` で成功時の処理、`catch` で失敗時に `isError` を立て、`finally` で **成功・失敗どちらでも** `isLoading` を落とす。
- **`fetch` の落とし穴（核）**：`fetch` は **404 や 500 でも例外を投げない**（`res.ok` が `false` になるだけ）。だから `if (!res.ok) throw ...` を自分で書く必要がある。`axios` はこれを自動で例外にしてくれる（← `axios` が好まれる理由の一つ）。
- **描画の分岐**：`isError` → `isLoading` → 本体、の順で早期 return するのが読みやすい。

> 💡補足（`axios` 版の差分）：`axios` なら `const res = await axios(url)` でデータは `res.data`、HTTP エラーは自動で `catch` に飛ぶので `if (!res.ok)` が不要。導入は `npm install axios`。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「初回は `isLoading=true` なので **"Loading ..." が先に出て**、通信完了後に一覧へ切り替わるはず」。試しに `API` を `'https://hn.algolia.com/api/v1/NOPE'` のような壊れた URL にしたら、"Loading ..." の後に何が出る？

```bash
npm run dev
```

期待される表示：

- 正常時：`Loading ...` → 一覧。
- URL を壊した時：`Loading ...` → `Something went wrong ...`（`res.ok` が false で例外を投げるため）。

### 想起チェック

<details><summary>Q. <code>fetch</code> で 404 が返ったとき、そのままだと <code>catch</code> に入らない。どう対処する？</summary>

`fetch` は HTTP エラーステータス（404/500 等）では **例外を投げない**。レスポンスの `res.ok`（`false`）や `res.status` を見て、自分で `throw new Error(...)` する必要がある。`axios` は 2xx 以外を自動で例外にするのでこの手当てが不要。

</details>

---

## Step 3 入力で再取得 — 依存配列とフォーム送信（核＋補足）

**目的**：検索ボックスから語を入力して **再取得** できるようにする。ここで `useEffect` の **依存配列** の使い方が核になる。
**これは核**：`useEffect(fn, [dep])` の「`dep` が変わったら再実行」を、通信のトリガーとして使う。
**これは補足**：「入力中の値」と「実際に検索する値」を分けるテクニック（毎キーストロークで通信しない工夫）。

ここからは **穴埋め（`// TODO`）** です。まず自分で埋めてから解答例を開いてください。

### コード（穴埋め）

> 📁 `src/lessons/13-data-fetching-tanstack/HnSearch.tsx`

```tsx
import { useEffect, useState } from 'react'

const API = 'https://hn.algolia.com/api/v1/search'

type Story = {
  objectID: string
  title: string
  url: string
}

export function HnSearch() {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // 「入力中の値」と「実際に検索する値」を分ける
  const [search, setSearch] = useState('') // input の value（毎キーストローク更新）
  const [activeQuery, setActiveQuery] = useState('react') // 実際に投げる検索語

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false)
      setIsLoading(true)
      try {
        // TODO(1): activeQuery を使ってfetchする（テンプレートリテラルで ?query= に埋める）
        // TODO(2): res.ok を確認し、json.hits を setStories する
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
    // TODO(3): この effect は「activeQuery が変わったら」再実行したい。依存配列に何を入れる？
  }, [/* TODO(3) */])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // フォームのデフォルト送信（ページリロード）を止める
    // TODO(4): 入力中のsearchを、実際の検索語activeQueryに反映する
  }

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
  )
}
```

<details><summary>解答例</summary>

```tsx
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false)
      setIsLoading(true)
      try {
        const res = await fetch(`${API}?query=${activeQuery}`) // TODO(1)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json() // TODO(2)
        setStories(json.hits)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [activeQuery]) // TODO(3): activeQuery が変わるたびに再取得

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setActiveQuery(search) // TODO(4): submit時だけ検索語を確定
  }
```

</details>

### 解説（ブロックごと）

- **依存配列 `[activeQuery]`（核）**：`useEffect` は依存配列の **いずれかの値が前回と変わったとき** に再実行される。`activeQuery` が変われば通信し直す＝「検索の再取得」を宣言的に書ける。もし `[]`（空）なら初回しか取得されず、検索が効かない。逆に `[search]` にすると **1文字打つたびに通信** してしまう。
- **`search` と `activeQuery` を分ける理由**：`input` は毎キーストロークで `search` を更新するが、通信は `activeQuery`（submit で確定）だけをトリガーにする。これで「打鍵ごとの無駄打ち」を防ぐ。
- **`event.preventDefault()`**：`<form>` はデフォルトで送信時にページをリロードする。SPA では困るので止める。既知との接続：`07-todo-app` のフォーム送信で書いたのと同じ定石。

> 💡補足：本来なら「入力が止まったら自動検索（debounce）」も選択肢だが、依存配列の理解を優先してここでは submit 方式にしている。debounce は宿題 Lv2 の発想で触れる。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「入力中は通信は **飛ばない**。`Search` を押した瞬間だけ Network に新しいリクエストが出るはず」。`redux` と打って Search を押すと、Network タブには何回リクエストが増える？

```bash
npm run dev
```

期待される動作：

- 入力中（`onChange`）は通信ゼロ。`Search` 押下で `?query=redux` のリクエストが **1本** 増え、一覧が入れ替わる。
- 初回は `activeQuery='react'` なので react の記事が出る。

### 想起チェック

<details><summary>Q. 依存配列を <code>[search]</code> にすると何が起きる？ なぜ <code>[activeQuery]</code> にするのか？</summary>

`[search]` にすると `input` に **1文字打つごとに** `useEffect` が再実行され、キーストロークのたびに API を叩いてしまう。`activeQuery` は `Search` 押下時にだけ更新されるので、`[activeQuery]` にすることで「送信したときだけ再取得」になる。依存配列は「この値が変わったら副作用を再実行する」を宣言する場所。

</details>

---

## Step 4 カスタムフックへ抽出し、汎用 `useQuery` を自作する（核）

**目的**：Step 3 までの取得ロジックを **カスタムフックに切り出し**、さらに「どんな取得にも使える汎用形」まで一般化する。ついでに **競合（race condition）対策** も入れる。
**これは核**：ここで作る自作フックの形（`queryKey` / `queryFn` を受け取り `data` / `isLoading` / `isError` を返す）は、**次章の TanStack Query とほぼ同じ**。「TanStack Query は、この面倒を全部やってくれる完成版」だと腑に落とすのが狙い。

### コード（穴埋め）

まず、Step 3 のロジックを **ドメインに依存しない汎用フック** に切り出します。

> 📁 `src/lessons/13-data-fetching-tanstack/useQuery.ts`

```ts
import { useEffect, useState } from 'react'

// 汎用useQueryの引数。TanStack Queryの useQuery とわざと似せている
type UseQueryArgs<T> = {
  queryKey: unknown[] // これが変わったら再取得する（＝依存配列の役割）
  queryFn: () => Promise<T> // 実際の取得処理（何を返すかは呼び出し側が決める）
  initialData: T // 取得前の初期値
}

export function useQuery<T>({ queryKey, queryFn, initialData }: UseQueryArgs<T>) {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    // 競合対策のフラグ。古い通信の結果で新しいstateを上書きしないため
    let didCancel = false

    const fetchData = async () => {
      setIsError(false)
      setIsLoading(true)
      try {
        const result = await queryFn()
        // TODO(1): didCancel が false のときだけ setData する
      } catch (error) {
        // TODO(2): didCancel が false のときだけ setIsError(true)
      } finally {
        // TODO(3): didCancel が false のときだけ setIsLoading(false)
      }
    }
    fetchData()

    // TODO(4): クリーンアップで didCancel を true にする関数を返す
  }, [/* TODO(5): queryKeyの中身が変わったら再実行したい */])

  return { data, isLoading, isError }
}
```

<details><summary>解答例</summary>

```ts
  useEffect(() => {
    let didCancel = false

    const fetchData = async () => {
      setIsError(false)
      setIsLoading(true)
      try {
        const result = await queryFn()
        if (!didCancel) setData(result) // TODO(1)
      } catch (error) {
        if (!didCancel) setIsError(true) // TODO(2)
      } finally {
        if (!didCancel) setIsLoading(false) // TODO(3)
      }
    }
    fetchData()

    return () => {
      didCancel = true // TODO(4): このeffectが片付くとき、進行中の結果を無視させる
    }
  }, [...queryKey]) // TODO(5): 配列を展開して依存にする
```

</details>

次に、これを使う側。Step 3 の `HnSearch` を **自作 `useQuery` で書き直し** ます。

> 📁 `src/lessons/13-data-fetching-tanstack/HnSearch.tsx`

```tsx
import { useState } from 'react'
import { useQuery } from './useQuery'

const API = 'https://hn.algolia.com/api/v1/search'

type Story = {
  objectID: string
  title: string
  url: string
}

export function HnSearch() {
  const [search, setSearch] = useState('')
  const [activeQuery, setActiveQuery] = useState('react')

  const { data: stories, isLoading, isError } = useQuery<Story[]>({
    queryKey: [activeQuery], // activeQuery が変われば再取得
    queryFn: async () => {
      const res = await fetch(`${API}?query=${activeQuery}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.hits as Story[] // queryFn は「欲しいデータそのもの」を返す
    },
    initialData: [],
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setActiveQuery(search)
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
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
  )
}
```

### 解説（ブロックごと）

- **ジェネリクス `<T>`（核）**：`queryFn` が返す型 `T` を呼び出し側が決められる。`Story[]` でも `Product` でも同じフックが使える。「ロジックは1つ、対象は何でも」というカスタムフックの旨み。
- **`queryKey` = 依存配列**：`[...queryKey]` を `useEffect` の依存にすることで、キーが変われば再取得。TanStack Query の `queryKey` と **役割が同じ**。
- **`didCancel`（競合対策 / race condition・核）**：「react」を検索した直後に「redux」を検索すると、遅く返ってきた「react」の結果が「redux」の表示を **上書き** してしまうことがある。クリーンアップで `didCancel = true` にし、`if (!didCancel)` で古い結果を捨てることで防ぐ。**これを毎回自前で書くのは面倒** ——という不満が、次章への動機になる。
- **既知との接続**：`08-custom-hooks` の「共通ロジックはフックへ」を、通信という題材で一般化したもの。

> 💡補足：ここまでで「取得・ローディング・エラー・依存による再取得・競合対策」を手作りした。だが **キャッシュ（同じ検索を再度開いたら即表示）・重複リクエストの排除・ウィンドウ復帰時の再取得・リトライ** はまだ無い。これらを足すと自作フックは一気に複雑化する。そこで登場するのが TanStack Query。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「見た目・動作は Step 3 と **まったく同じ** はず（内部をフックに移しただけ）。ただしコンポーネント側の通信コードは消えて、`useQuery({...})` の1呼び出しになっている」。UI は変わらず、コードだけ短くなっている、で合っているか？

```bash
npm run dev
```

期待される動作：Step 3 と同一（検索して再取得できる）。コンポーネントから `useEffect`/`try-catch` が消え、宣言的になっている。

### 想起チェック

<details><summary>Q. <code>didCancel</code> フラグは何を防いでいる？ 無いとどんなバグが出る？</summary>

**競合（race condition）** を防いでいる。検索語を素早く切り替えると、複数の通信が並行し、**遅く返ってきた古い通信の結果が新しい表示を上書き** することがある。`useEffect` のクリーンアップで `didCancel = true` にし、`if (!didCancel)` で古い結果を捨てることで、最後に投げたクエリの結果だけを反映できる。TanStack Query はこれを内部で自動処理してくれる。

</details>

---

## Step 5 TanStack Query 導入 — 自作 `useQuery` を捨てる（核）

**目的**：Step 4 で手作りした `useQuery` を、本物の **TanStack Query** に置き換える。ほぼ同じ書き味で、キャッシュ・重複排除・リトライ・競合対策が **タダで** 付いてくることを体感する。
**これは核**：`QueryClient` / `QueryClientProvider` / `useQuery(queryKey, queryFn)` は TanStack Query の「3つの核概念」。これを空で書けることがゴール。

### 導入（インストールとプロバイダ設定）

```bash
# TanStack Query 本体と、開発用の可視化ツール（Devtools）を入れる
npm install @tanstack/react-query @tanstack/react-query-devtools
```

アプリ全体を `QueryClientProvider` で包みます。**キャッシュはこの `QueryClient` が握る** ので、アプリのルートに1つ置きます。

> 📁 `src/App.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HnSearch } from './lessons/13-data-fetching-tanstack/HnSearch'

// キャッシュや設定を保持する司令塔。アプリで基本1個
const queryClient = new QueryClient()

export default function App() {
  return (
    // これで配下のどのコンポーネントでも useQuery / useMutation が使える
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <HnSearch />
      </div>
      {/* 画面隅にキャッシュの中身を可視化するパネルが出る（開発時のみ） */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

> 💡補足（既知との接続）：`QueryClientProvider` は `06-useContext` で学んだ **Context Provider** そのもの。配下のコンポーネントが `useQuery` で `queryClient`（＝キャッシュ）を Context 経由で受け取る。だから「アプリの外側で1回 provide する」形になっている。

### コード（穴埋め — 自作フックを本物に差し替える）

`useQuery.ts`（自作）はもう不要です。`HnSearch.tsx` の import を **本物に差し替え** ます。API はわざと似せてあったので、変更は驚くほど小さいです。

> 📁 `src/lessons/13-data-fetching-tanstack/HnSearch.tsx`

```tsx
import { useState } from 'react'
// TODO(1): 自作 './useQuery' ではなく '@tanstack/react-query' から useQuery を import する
import { useQuery } from '???'

const API = 'https://hn.algolia.com/api/v1/search'

type Story = {
  objectID: string
  title: string
  url: string
}

export function HnSearch() {
  const [search, setSearch] = useState('')
  const [activeQuery, setActiveQuery] = useState('react')

  const { data, isPending, isError } = useQuery({
    // TODO(2): キャッシュを一意に識別するキー。文字列と変数を配列で
    queryKey: [/* ??? */],
    // TODO(3): 取得処理。fetchして hits を返す（Step4のqueryFnをほぼ流用）
    queryFn: async () => {
      const res = await fetch(`${API}?query=${activeQuery}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.hits as Story[]
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setActiveQuery(search)
  }

  // data は取得前 undefined になりうる → 空配列でフォールバック
  const stories = data ?? []

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit">Search</button>
      </form>
      {isError && <div>Something went wrong ...</div>}
      {isPending ? (
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
  )
}
```

<details><summary>解答例</summary>

```tsx
import { useQuery } from '@tanstack/react-query' // TODO(1)

// ...

  const { data, isPending, isError } = useQuery({
    queryKey: ['stories', activeQuery], // TODO(2): 'stories' は名前空間、activeQuery で細分化
    queryFn: async () => {              // TODO(3)
      const res = await fetch(`${API}?query=${activeQuery}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.hits as Story[]
    },
  })
```

自作フックとの違いはほぼ import だけ。`initialData` は不要になり、代わりに `data` が `undefined` になりうるので `data ?? []` で受ける。「読み込み中」は v5 では `isPending` を使う（`isLoading` でも可）。

</details>

### 解説（ブロックごと）

- **`queryKey`（核）**：キャッシュを識別する **一意なキー**。`['stories', activeQuery]` のように配列で書く。**同じキーの取得結果はキャッシュされ**、次に同じキーで `useQuery` すると **即座にキャッシュを返しつつ裏で更新**（stale-while-revalidate）。`activeQuery` を含めることで「検索語ごとに別キャッシュ」になる（＝依存配列と同じ役割だが、キャッシュのキーも兼ねる）。
- **`queryFn`（核）**：`Promise<欲しいデータ>` を返す関数。Step 4 で書いた `queryFn` がそのまま使える。**成功時は返り値が `data`、例外を投げれば `isError`** に反映。
- **タダで付いてくるもの（核）**：`didCancel` を書かなくても **競合は自動処理**。同じキーへの同時リクエストは **重複排除**。失敗時は **自動リトライ**（デフォルト3回）。ウィンドウ再フォーカスで **自動再取得**。——Step 4 で手作りした苦労が、ほぼ全部標準装備。
- **`isPending` vs `isLoading`（補足）**：v5 では、キャッシュが無くまだデータが無い状態が `isPending`。`isFetching` は「今まさに通信中か（バックグラウンド更新含む）」。初回ローディング表示には `isPending` が素直。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「キャッシュが効くはず」。`react` を検索 → `redux` を検索 → **もう一度 `react`** を検索したとき、3回目の `react` は Network タブに **新規リクエストが出るか？ 出ないか？**（ヒント：`staleTime` のデフォルトは 0 だが、キャッシュ自体は残っている）

```bash
npm run dev
```

期待される動作：

- 検索は Step 4 と同じ見た目で動く。
- Devtools パネル（画面隅）を開くと `['stories','react']` `['stories','redux']` といった **キャッシュエントリ** が並ぶ。
- 3回目の `react`：**キャッシュがあるので一覧が即座に出る**（そのうえで裏側で再取得＝背景更新される。`staleTime` デフォルト0のため）。Step 4 の自作版は毎回まっさらな Loading になっていたはず。

### 想起チェック

<details><summary>Q. TanStack Query の「3つの核概念」を挙げ、<code>queryKey</code> が果たす2つの役割を説明せよ。</summary>

3つの核概念：**① `QueryClient`（＋`QueryClientProvider`）** でキャッシュの司令塔をアプリに提供、**② `useQuery({ queryKey, queryFn })`** で取得、**③ `useMutation` ＋ `invalidateQueries`** で更新（次章）。

`queryKey` の役割は2つ：**(a) キャッシュの一意な識別子**（同じキーは結果を共有・再利用）、**(b) 依存の宣言**（キーが変われば自動で再取得）。`['stories', activeQuery]` のように配列で書くと、検索語ごとに別キャッシュになる。

</details>

---

## Step 6 実践 — Django REST API と接続し、`useMutation` で登録する（核＋補足）

**目的**：公開 API を離れ、**自作の Django REST API** から商品一覧を `useQuery` で取得し、`useMutation` で新規登録。登録成功後に `invalidateQueries` で一覧キャッシュを更新する。
**これは核**：`useMutation` ＋ `invalidateQueries` は「サーバーを変更したら、関連するキャッシュを無効化して最新に保つ」という TanStack Query の3つ目の核。
**これは補足**：バックエンド（Django）部分は記事に無く、私が追加した接続実装。

> 💡補足：ここから **バックエンドは私が追加した部分** です。元記事はフロントのみ。以降のフロントコードは「要件＋自力」に寄せ、解答例は折りたたみます。

### バックエンド（Django Ninja — 写経）

`3-2` で作った `backend/` で作業します。一覧取得（GET）と登録（POST）を用意します。

> 📁 `backend/config/api.py`

```python
# Django Ninja で「商品の一覧取得 + 登録」を返す最小JSON API。
# テンプレートは使わず、JSONを返すREST APIとして実装する。
from ninja import NinjaAPI, Schema

api = NinjaAPI()

# レスポンスの型（フロントのTSの型と1対1で対応させる意識）
class ProductOut(Schema):
    id: int
    name: str
    price: int

# 登録リクエストの型（idはサーバーが採番するので受け取らない）
class ProductIn(Schema):
    name: str
    price: int

# DBは使わず、学習用にメモリ上の固定データ（後でDjango ORMに差し替え可能）
PRODUCTS = [
    {"id": 1, "name": "キーボード", "price": 12000},
    {"id": 2, "name": "マウス", "price": 6000},
    {"id": 3, "name": "モニター", "price": 38000},
]

@api.get("/products", response=list[ProductOut])
def list_products(request):
    return PRODUCTS

@api.post("/products", response=ProductOut)
def create_product(request, payload: ProductIn):
    # 次のidを採番して追加（メモリ上なのでサーバー再起動で消える）
    new_id = max((p["id"] for p in PRODUCTS), default=0) + 1
    product = {"id": new_id, "name": payload.name, "price": payload.price}
    PRODUCTS.append(product)
    return product
```

> 📁 `backend/config/urls.py`

```python
from django.contrib import admin
from django.urls import path
from .api import api  # 上で作った NinjaAPI

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),  # /api/products でアクセスできる
]
```

> 📁 `backend/config/settings.py`（2か所だけ追記）

```python
# INSTALLED_APPS に追記（CORS許可）
INSTALLED_APPS = [
    # ... 既存 ...
    "corsheaders",
]

# MIDDLEWARE の「先頭付近」に追記
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # できるだけ上に
    # ... 既存 ...
]

# 末尾に追記：Vite開発サーバ(5173)からのfetchを許可
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

> 💡補足（DRF版の差分）：DRF なら `@api_view(["GET", "POST"])` の関数ビューで `Response(PRODUCTS)` / `Response(new, status=201)` を返し、`INSTALLED_APPS` に `rest_framework` を足すだけ。CORS 設定は共通。

起動して疎通確認：

```bash
# backend/ で（uv run で .venv 内の python を実行。activate不要）
uv run python manage.py migrate     # 初回のDB初期化（admin用。商品はメモリなので警告回避目的）
uv run python manage.py runserver   # http://127.0.0.1:8000
```

> 🔮 **予想してみよう**：観点 →「`GET /api/products` は3件の JSON 配列。`POST` すると4件目が返り、以降 `GET` は4件になるはず」。

```bash
# 一覧
curl http://127.0.0.1:8000/api/products
# 登録（-d でJSONを送る）
curl -X POST http://127.0.0.1:8000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Webカメラ","price":8000}'
```

期待される出力：

```json
[{"id": 1, "name": "キーボード", "price": 12000}, {"id": 2, "name": "マウス", "price": 6000}, {"id": 3, "name": "モニター", "price": 38000}]
```
```json
{"id": 4, "name": "Webカメラ", "price": 8000}
```

### フロントエンド（要件 → 自力）

**要件**：`src/lessons/13-data-fetching-tanstack/ProductList.tsx` を作る。

- `useQuery`（`queryKey: ['products']`）で `GET /api/products` を取得し、一覧表示する。
- 入力フォーム（商品名・価格）から `useMutation` で `POST /api/products` する。
- **登録成功時（`onSuccess`）に `queryClient.invalidateQueries({ queryKey: ['products'] })`** を呼び、一覧を自動で最新化する。
- `App.tsx` の表示を `<ProductList />` に差し替える。

**ヒント（考え方のみ）**：

- 型は `type Product = { id: number; name: string; price: number }`、送信は `type ProductIn = { name: string; price: number }`。
- `useMutation({ mutationFn, onSuccess })`。`mutationFn` は `fetch(url, { method: 'POST', headers, body: JSON.stringify(...) })` して `.json()` を返す関数。
- キャッシュ操作には `useQueryClient()` で `queryClient` を取り出す。
- 「なぜ手動で一覧 state に push しないのか？」→ サーバーが正（source of truth）。`invalidateQueries` で **サーバーから取り直す** のが TanStack 流。

<details><summary>解答例</summary>

> 📁 `src/lessons/13-data-fetching-tanstack/ProductList.tsx`

```tsx
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API = 'http://127.0.0.1:8000/api'

type Product = { id: number; name: string; price: number }
type ProductIn = { name: string; price: number }

export function ProductList() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  // 一覧取得
  const { data: products, isPending, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const res = await fetch(`${API}/products`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })

  // 登録
  const mutation = useMutation({
    mutationFn: async (newProduct: ProductIn): Promise<Product> => {
      const res = await fetch(`${API}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    onSuccess: () => {
      // 登録が成功したら 'products' のキャッシュを無効化 → 自動で再取得され一覧が更新される
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate({ name, price: Number(price) }) // 送信
    setName('')
    setPrice('')
  }

  if (isPending) return <div>Loading ...</div>
  if (isError) return <div>Something went wrong ...</div>

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="商品名" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="価格" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? '登録中...' : '登録'}
        </button>
      </form>

      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} — {p.price.toLocaleString()}円
          </li>
        ))}
      </ul>
    </div>
  )
}
```

`App.tsx` は Step 5 の `<HnSearch />` を `<ProductList />` に差し替えるだけ（`QueryClientProvider` はそのまま）。

</details>

### 解説（ブロックごと）

- **`useMutation`（核）**：`useQuery` が「読み取り（GET）」なら、`useMutation` は「書き込み（POST/PUT/DELETE）」担当。`mutation.mutate(引数)` で発火する。`mutation.isPending` で送信中を判定できる（ボタンの二重送信防止に便利）。
- **`invalidateQueries`（核）**：登録が成功したら `['products']` キャッシュを **stale（古い）扱いにして再取得** させる。手で一覧 state をいじらず「**サーバーを正として取り直す**」のが TanStack 流。ズレが起きにくい。
- **`useQueryClient`**：`onSuccess` の中でキャッシュ操作するために、Context から `queryClient` を取り出すフック。
- **既知との接続**：`10-state-management` で「クライアント状態」を扱ったが、API から来るデータは **サーバー状態** で性質が違う（常に古くなりうる／再取得が要る）。TanStack Query は「サーバー状態専用の状態管理」と捉えると位置づけがはっきりする。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「登録ボタンを押すと、`POST` の後に **`GET /api/products` がもう一度自動で飛ぶ**（`invalidateQueries` のため）はず。だから画面の一覧に手作業なしで新商品が増える」。Network タブには POST の直後に GET が続けて記録されるか？

```bash
# 端末A（backend/ で）
uv run python manage.py runserver
# 端末B（ルートで）
npm run dev
```

期待される動作：

- 初期表示で3件（キーボード / マウス / モニター）。
- 商品名・価格を入れて「登録」→ 一覧が **自動で4件に増える**（`invalidateQueries` による再取得）。
- Network タブ：`POST /api/products` の直後に `GET /api/products` が自動発火。

### 想起チェック

<details><summary>Q. 登録後に一覧を最新化する方法として、<code>invalidateQueries</code> の代わりに「自分で一覧stateにpushする」やり方が推奨されにくいのはなぜ？</summary>

サーバーが **source of truth（正）** だから。手で push すると、サーバー側の採番（`id`）や別クライアントの変更・バリデーション結果とズレる可能性がある。`invalidateQueries({ queryKey: ['products'] })` は該当キャッシュを古い扱いにして **サーバーから取り直す** ため、常に本物と一致する。`useMutation` の `onSuccess` で呼ぶのが定石。（速度を優先したい場合は「楽観的更新（optimistic update）」という別の手法もある → 発展）

</details>

---

## Step 7 実務仕上げ — `staleTime` / `retry` / Devtools（補足）

**目的**：デフォルト挙動を実務向けに調整する。ここは記事の要点（キャッシュ・リトライ）を実際のオプションで確かめる。
**これは補足**：核概念は Step 5・6 で済んでいる。ここは「知っていると効く」チューニング。

### コード（自力寄り — オプションを足すだけ）

`useQuery` にオプションを渡します。要件だけ示すので、まず自分で書いてみてください。

**要件**：`ProductList` の `useQuery` に、

- `staleTime: 1000 * 60`（60秒間はキャッシュを「新鮮」とみなし、背景再取得しない）
- `retry: 2`（失敗時のリトライを2回に）

を足す。

<details><summary>解答例</summary>

```tsx
  const { data: products, isPending, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const res = await fetch(`${API}/products`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    staleTime: 1000 * 60, // 60秒は fresh（この間は再取得しない）
    retry: 2,             // 失敗時は2回までリトライ
  })
```

</details>

### 解説（ブロックごと）

- **`staleTime`（補足だが重要）**：データが「新鮮（fresh）」でいる時間。この間は再フォーカスや再マウントでも **再取得しない**（無駄な通信を減らせる）。デフォルトは `0`＝取得直後から stale なので、頻繁に背景更新が走る。マスタデータ等は長めにすると効く。
- **`gcTime`（旧 `cacheTime`）**：使われなくなったキャッシュをメモリに保持する時間（デフォルト5分）。`staleTime` と混同しやすい：`staleTime` は「新鮮さ」、`gcTime` は「捨てるまでの猶予」。
- **`retry`**：失敗時のリトライ回数（デフォルト3）。0 にすれば即エラー表示。
- **Devtools**：Step 5 で入れた `<ReactQueryDevtools />` で、各クエリが `fresh` / `stale` / `fetching` のどれかを目で見られる。学習・デバッグの強い味方。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「`staleTime: 60000` を入れると、`ProductList` を一度描画した後、別コンポーネントに切り替えて **すぐ戻っても** `GET /api/products` は飛ばない（60秒以内は fresh だから）はず」。Devtools でクエリの色（fresh/stale）はどう変わる？

```bash
npm run dev
```

期待される動作：

- `staleTime` 適用後、60秒以内の再表示・再フォーカスでは Network に新規 GET が出ない（Devtools で `fresh` 表示）。
- 60秒経過後は `stale` になり、再フォーカス等で背景再取得が走る。

### 想起チェック

<details><summary>Q. <code>staleTime</code> と <code>gcTime</code> の違いを一言で。デフォルト値は？</summary>

`staleTime`（デフォルト **0**）＝ データを「新鮮」とみなす時間。この間は再取得しない。`gcTime`（旧 cacheTime、デフォルト **5分**）＝ 使われなくなったキャッシュをメモリに残す時間。前者は「いつ取り直すか」、後者は「いつ捨てるか」を制御する。

</details>

---

## 5. つまずきポイント

| 症状 | 原因 | 対処 |
|------|------|------|
| `useEffect(async () => ...)` で警告／変な挙動 | `async` が `Promise` を返し、クリーンアップ扱いされる | `useEffect` の中に `async` 関数を定義して呼ぶ |
| `fetch` が 404/500 でも `catch` に入らない | `fetch` はHTTPエラーで例外を投げない | `if (!res.ok) throw new Error(...)` を書く（`axios` なら自動） |
| 検索するたびに古い結果が一瞬混ざる | 競合（race condition） | 自作なら `didCancel` フラグ、TanStack なら自動で解決 |
| `useQuery` で `No QueryClient set` エラー | `QueryClientProvider` で包んでいない | ルートを `<QueryClientProvider client={queryClient}>` で包む |
| `queryFn` が `undefined` を返す | `return` 忘れ／`res.json()` を返していない | `queryFn` は必ず「欲しいデータ」を `return` する |
| 登録しても一覧が古いまま | `invalidateQueries` を呼んでいない／キーが不一致 | `onSuccess` で `invalidateQueries({ queryKey: ['products'] })`。キーを一覧と揃える |
| Django に `fetch` すると CORS エラー | CORS 未許可 | `django-cors-headers` を入れ、`CorsMiddleware` を先頭付近に、`CORS_ALLOWED_ORIGINS` に `http://localhost:5173` |
| `curl` は通るのにブラウザだけ失敗 | プロトコル/ポート/オリジン違い | フロントURLと `CORS_ALLOWED_ORIGINS` を一致（`localhost` と `127.0.0.1` は別物扱い） |
| POST が 405/419 になる | メソッド不一致／CSRF | Ninja はデフォルトでAPIにCSRF不要。`method: 'POST'` と URL を確認 |

---

## 6. まとめ

- **API 通信の骨格**は `useState`（データ）＋ `useEffect`（マウント時取得）。`useEffect` に直接 `async` は渡さない。
- 手で通信すると **loading / error / 再取得（依存配列）/ 競合（didCancel）** まで面倒を見る必要があり、コードが膨らむ。
- それらを **カスタムフック（自作 `useQuery`）** に切り出すと、`queryKey` / `queryFn` を渡す宣言的な形になる——**これが TanStack Query とほぼ同じ設計**。
- **TanStack Query** の核は3つ：**`QueryClient`/`QueryClientProvider`（司令塔）**・**`useQuery`（取得＋キャッシュ）**・**`useMutation` + `invalidateQueries`（更新＋キャッシュ同期）**。競合対策・重複排除・リトライ・背景更新が標準装備。
- `queryKey` は「**キャッシュの識別子**」かつ「**再取得の依存**」の二役。
- 更新後は自分で state をいじらず、**`invalidateQueries` でサーバーから取り直す**のが基本。`staleTime`/`retry`/Devtools で実務向けに調整する。
- サーバーから来るデータは **サーバー状態**。クライアント状態（`useState`/Zustand 等）とは性質が違い、TanStack Query はその専用ツール。

---

## 7. 宿題（アウトプット課題）

本編で作った `HnSearch` / `ProductList` の **続き** として解けます。元記事は2トピック（API Calls / TanStack Query）なので、**Lv1・Lv2 は各トピックごと**、**Lv3 は全体を統合する1問**にしています。

---

### Lv1-A（基礎確認 / API Calls）— 表示項目を増やす

**課題**：本編 Step 2 の `HnSearch`（素の `fetch` 版）を改造する。

- `Story` 型に `points: number`（記事のスコア）と `author: string` を追加する。
- Hacker News の検索APIは `hits[].points` / `hits[].author` を返すので、一覧に `by {author} / {points} pts` を併記する。

**ヒント**：型に2フィールド足し、`<li>` の中身を増やすだけ。API 側の変更は不要（既に返ってきている）。

**判定基準**：`npm run dev` で一覧の各行に「タイトル / by 著者名 / N pts」が表示される。

<details><summary>解答例</summary>

```tsx
type Story = {
  objectID: string
  title: string
  url: string
  points: number
  author: string
}

// ...一覧の中身
<li key={story.objectID}>
  <a href={story.url}>{story.title}</a>
  <small> — by {story.author} / {story.points} pts</small>
</li>
```

</details>

---

### Lv1-B（基礎確認 / TanStack Query）— キャッシュ挙動を観察する

**課題**：本編 Step 5 の `HnSearch`（TanStack 版）で、`useQuery` に `staleTime: 1000 * 30` を足す。

- `react` → `redux` → `react` と検索して、3回目の `react` で **GET が飛ばない**（キャッシュがfresh）ことを Devtools と Network タブで確認する。

**ヒント**：`staleTime` を足すだけ。Devtools のクエリ色（fresh=緑）を見る。

**判定基準**：30秒以内に同じ検索語へ戻ったとき、Network に新規リクエストが出ず、一覧が即表示される。Devtools で該当クエリが `fresh`。

<details><summary>解答例</summary>

```tsx
const { data, isPending, isError } = useQuery({
  queryKey: ['stories', activeQuery],
  queryFn: async () => { /* ...同じ... */ },
  staleTime: 1000 * 30, // 30秒は再取得しない
})
```

観察：`staleTime` が 0（デフォルト）だとキャッシュはあっても即 stale なので背景再取得が走る。30秒にすると、その間は完全に通信ゼロで即表示される。

</details>

---

### Lv2-A（応用 / API Calls）— 別の公開APIを自力で取得する

**課題**：`HnSearch` とは別に、新コンポーネント `UserList.tsx` を作り、**本編の `useQuery`（TanStack）を使わず**、Step 2 の手法（生 `fetch` ＋ `useState`/`useEffect` ＋ loading/error）だけで JSONPlaceholder のユーザー一覧を取得・表示する。

- エンドポイント：`https://jsonplaceholder.typicode.com/users`（`[{ id, name, email }, ...]` を返す）
- loading 中は "Loading ..."、失敗時は "Something went wrong ..." を出す。

**ヒント**：Step 2 の `HnSearch` を土台に、型を `User = { id: number; name: string; email: string }` に、URL とレンダリングを差し替える。`hits` のような入れ子は無く、レスポンスがそのまま配列。

**判定基準**：`npm run dev` でユーザー名とメールの一覧が出る。オフライン等でエラーにすると "Something went wrong ..."。

<details><summary>解答例</summary>

```tsx
import { useEffect, useState } from 'react'

type User = { id: number; name: string; email: string }

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false)
      setIsLoading(true)
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setUsers(await res.json())
      } catch {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isError) return <div>Something went wrong ...</div>
  if (isLoading) return <div>Loading ...</div>

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name} — {u.email}</li>
      ))}
    </ul>
  )
}
```

</details>

---

### Lv2-B（応用 / TanStack Query）— `useMutation` で削除する

**課題**：本編 Step 6 の `ProductList` に **削除機能** を足す。

- バックエンドに `DELETE /api/products/{id}` を追加する（該当 id を `PRODUCTS` から除く）。
- フロントは各商品行に「削除」ボタンを付け、`useMutation` で `DELETE` を叩く。
- **成功時に `invalidateQueries({ queryKey: ['products'] })`** で一覧を更新する。

**ヒント**：Ninja は `@api.delete("/products/{product_id}")` でパスパラメータを受け取れる。フロントの `mutationFn` は `id: number` を受け、`fetch(url, { method: 'DELETE' })`。登録の mutation とほぼ同型。

**判定基準**：
```bash
curl -X DELETE http://127.0.0.1:8000/api/products/2
curl http://127.0.0.1:8000/api/products   # id:2 が消えている
```
画面でも「削除」を押すと一覧から即消える。

<details><summary>解答例</summary>

バックエンド（`api.py` に追記）：

```python
@api.delete("/products/{product_id}")
def delete_product(request, product_id: int):
    global PRODUCTS
    PRODUCTS = [p for p in PRODUCTS if p["id"] != product_id]
    return {"success": True}
```

フロント（`ProductList.tsx` に追記）：

```tsx
const deleteMutation = useMutation({
  mutationFn: async (id: number) => {
    const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  },
})

// 一覧の各行に
<li key={p.id}>
  {p.name} — {p.price.toLocaleString()}円
  <button onClick={() => deleteMutation.mutate(p.id)}>削除</button>
</li>
```

</details>

---

### Lv3（発展 / 統合）— ページネーション＋バリデーション＋エラー処理

記事には無いが実務で必須の3点を、Django ＋ TanStack Query の全体で統合する。

**課題**：本編 `ProductList` を拡張する。

- **バックエンド**
  - `GET /api/products` を **ページング対応**：クエリ `page`（1始まり）と `size`（1ページ件数、デフォルト2）を受け、該当範囲を返す。総件数も分かるようにする（`{ items: [...], total: N }` の形にする）。
  - **バリデーション**：`POST` で `price <= 0` または `name` が空なら **HTTP 422** でエラーメッセージを返す。
- **フロント**
  - `queryKey: ['products', page]` にして **ページ切り替えで再取得**。「前へ / 次へ」ボタンを付ける（`keepPreviousData` 相当でチラつきを抑えられればなお良し）。
  - 登録フォームで **422 を受けたらエラーメッセージを表示**（`mutation.isError` / `mutation.error` を使う）。

**ヒント**：
- Ninja のページング：`def list_products(request, page: int = 1, size: int = 2):` でスライス。総件数は `len(PRODUCTS)`。
- 422 は Ninja の `from ninja.errors import HttpError` を投げる（`raise HttpError(422, "price must be > 0")`）。
- フロントは `res.ok` が false のとき `res.json()` の中のメッセージを `throw` すると、`mutation.error.message` で拾える。
- ページ切り替えのチラつき対策は v5 では `placeholderData: (prev) => prev`。

**判定基準**：
```bash
curl "http://127.0.0.1:8000/api/products?page=1&size=2"   # items 2件 + total
curl "http://127.0.0.1:8000/api/products?page=2&size=2"   # 次の範囲
curl -i -X POST http://127.0.0.1:8000/api/products \
  -H "Content-Type: application/json" -d '{"name":"","price":-5}'  # → HTTP/1.1 422
```
画面：「次へ」でページが進み一覧が入れ替わる。価格0以下で登録するとフォーム下にエラー文が出て、一覧は変化しない。

<details><summary>解答例</summary>

バックエンド（`api.py`）：

```python
from ninja import NinjaAPI, Schema
from ninja.errors import HttpError

api = NinjaAPI()

class ProductOut(Schema):
    id: int
    name: str
    price: int

class ProductIn(Schema):
    name: str
    price: int

class ProductPage(Schema):
    items: list[ProductOut]
    total: int

PRODUCTS = [
    {"id": 1, "name": "キーボード", "price": 12000},
    {"id": 2, "name": "マウス", "price": 6000},
    {"id": 3, "name": "モニター", "price": 38000},
]

@api.get("/products", response=ProductPage)
def list_products(request, page: int = 1, size: int = 2):
    if page < 1 or size < 1:
        raise HttpError(422, "page and size must be >= 1")
    start = (page - 1) * size
    return {"items": PRODUCTS[start:start + size], "total": len(PRODUCTS)}

@api.post("/products", response=ProductOut)
def create_product(request, payload: ProductIn):
    if not payload.name.strip():
        raise HttpError(422, "name is required")
    if payload.price <= 0:
        raise HttpError(422, "price must be > 0")
    new_id = max((p["id"] for p in PRODUCTS), default=0) + 1
    product = {"id": new_id, "name": payload.name, "price": payload.price}
    PRODUCTS.append(product)
    return product
```

フロント（`ProductList.tsx`）：

```tsx
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API = 'http://127.0.0.1:8000/api'
const SIZE = 2

type Product = { id: number; name: string; price: number }
type ProductPage = { items: Product[]; total: number }

export function ProductList() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const { data, isPending, isError } = useQuery({
    queryKey: ['products', page],
    queryFn: async (): Promise<ProductPage> => {
      const res = await fetch(`${API}/products?page=${page}&size=${SIZE}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    placeholderData: (prev) => prev, // ページ移動中のチラつきを抑える
  })

  const mutation = useMutation({
    mutationFn: async (newProduct: { name: string; price: number }): Promise<Product> => {
      const res = await fetch(`${API}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
        throw new Error(err.detail ?? '登録に失敗しました')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate({ name, price: Number(price) })
  }

  if (isPending) return <div>Loading ...</div>
  if (isError) return <div>Something went wrong ...</div>

  const totalPages = Math.max(1, Math.ceil(data.total / SIZE))

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="商品名" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="価格" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button type="submit" disabled={mutation.isPending}>登録</button>
      </form>
      {mutation.isError && <p style={{ color: 'red' }}>{mutation.error.message}</p>}

      <ul>
        {data.items.map((p) => (
          <li key={p.id}>{p.name} — {p.price.toLocaleString()}円</li>
        ))}
      </ul>

      <div>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>前へ</button>
        <span> {page} / {totalPages} </span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>次へ</button>
      </div>
    </div>
  )
}
```

ポイント：`queryKey: ['products', page]` でページごとにキャッシュ＆再取得。`placeholderData: (prev) => prev` で移動中に前ページを保持しチラつきを防ぐ。登録失敗（422）は `mutation.error.message` に載り、`onSuccess` は走らないので一覧は変わらない。

</details>

---

## 8. 発展

- **楽観的更新（Optimistic Updates）**：`useMutation` の `onMutate` でキャッシュを **先に** 書き換え、失敗したら `onError` でロールバックする。体感速度が上がる。
- **`useInfiniteQuery`**：「もっと読み込む」型の無限スクロール。Lv3 のページングの上位版。
- **`select` オプション**：`useQuery` の結果を必要な形に変換して返す（不要な再レンダーを抑える）。
- **`enabled` オプション**：条件が揃うまでクエリを止める（例：`id` が確定してから取得）。
- **プリフェッチ**：`queryClient.prefetchQuery` で、リンクホバー時などに先読みしておく。
- **サーバー状態 vs クライアント状態**：TanStack Query（サーバー状態）と Zustand/Jotai（クライアント状態）の**役割分担**を意識すると設計が綺麗になる（`docs/10` と接続）。
- **DRF / Flask 版**：バックエンドを DRF のシリアライザや Flask の `jsonify` に置き換えても、フロント（TanStack Query）は一切変わらない——「APIの契約（JSONの形）さえ同じなら、フロントは実装非依存」を実感する良い練習。
- **公式リソース**：[TanStack Query Docs](https://tanstack.com/query/latest) / [GitHub](https://github.com/TanStack/query) / [robinwieruch: React Hooks Fetch Data](https://www.robinwieruch.de/react-hooks-fetch-data/)
