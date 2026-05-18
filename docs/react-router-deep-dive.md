# React Router 完全攻略ガイド — SPA ルーティングの基礎から実践まで

> このドキュメントは「上から順に読んで・順に書いて・順に動かす」 1 ファイル完結の教材です。
> 解説とコードがセットになっており、各章で番号付きコード（①, ②, ...）を **自分の手で `src/lessons/09-react-router/` 配下に書く** ことで身につきます。
> 環境: React 19 + TypeScript + Vite (このプロジェクト) + react-router-dom v7。
> 前提知識: 基本的な React コンポーネント・props・state。`docs/react-hooks-deep-dive.md` を済ませているとなお良し。

---

## 目次

0. [このドキュメントの使い方](#0-このドキュメントの使い方)
1. [SPA とルーティングって何？](#1-spa-とルーティングって何)
2. [React Router をインストールする](#2-react-router-をインストールする)
3. [最初のルート — 3 個の登場人物](#3-最初のルート--3-個の登場人物)
4. [ページ間を移動する — `<Link>`](#4-ページ間を移動する--link)
5. [動的なURL — `useParams`](#5-動的なurl--useparams)
6. [ネストされたルート — `<Outlet>` でレイアウト共有](#6-ネストされたルート--outlet-でレイアウト共有)
7. [インデックスルート](#7-インデックスルート)
8. [現在のページをハイライト — `<NavLink>`](#8-現在のページをハイライト--navlink)
9. [プログラム的に遷移する — `useNavigate`](#9-プログラム的に遷移する--usenavigate)
10. [クエリパラメータ — `useSearchParams`](#10-クエリパラメータ--usesearchparams)
11. [404 ページと `<Navigate>` リダイレクト](#11-404-ページと-navigate-リダイレクト)
12. [認証ガード — 保護されたルート](#12-認証ガード--保護されたルート)
13. [データを取りに行く — Loaders（Data API）](#13-データを取りに行く--loadersdata-api)
14. [データを送る — Actions と `<Form>`](#14-データを送る--actions-と-form)
15. [遅延ロード — ルートごとにコード分割](#15-遅延ロード--ルートごとにコード分割)
16. [ベストプラクティス](#16-ベストプラクティス)
17. [アンチパターン集](#17-アンチパターン集)
18. [やってみよう（卒業課題）](#18-やってみよう卒業課題)
19. [チートシート](#19-チートシート)

---

## 0. このドキュメントの使い方

### 0-1. 進め方

1. 各章の **解説** を読む
2. 「**コード①**」「**コード②**」と番号がついたブロックを、指示されたパス（例: `src/lessons/09-react-router/routes/Home.tsx`）に **自分の手で写経** する
3. `src/App.tsx` に切替用 import を追加して、画面で動作確認
4. 章末の **やってみよう** で改造する

### 0-2. ディレクトリ構成（最終的にこうなる）

```
src/lessons/09-react-router/
├── RouterRoot.tsx          ← ルートの起点（App.tsx から呼ぶ）
├── routes/
│   ├── Layout.tsx          ← 共通ヘッダ + Outlet
│   ├── Home.tsx
│   ├── About.tsx
│   ├── NotFound.tsx
│   ├── users/
│   │   ├── UsersLayout.tsx
│   │   ├── UsersList.tsx
│   │   ├── UserDetail.tsx
│   │   └── NewUser.tsx
│   ├── Login.tsx
│   └── Dashboard.tsx
└── auth.ts                  ← 認証のダミー
```

### 0-3. 動作確認

```bash
npm run dev
```

`App.tsx` で `<RouterRoot />` を表示するように切り替えます（最初の章で説明）。

---

## 1. SPA とルーティングって何？

### 1-1. 昔の Web（MPA = Multi Page Application）

サーバーに HTML が複数置いてあって、リンクを押すたびにブラウザが **新しい HTML をダウンロード** してました。

```
/about をクリック
  → ブラウザがサーバーに about.html を要求
    → サーバーが HTML を返す
      → ブラウザが画面ごと再描画（白くなって読み込み直し）
```

ページ遷移のたびに画面が真っ白になるアレです。

### 1-2. 今の Web（SPA = Single Page Application）

最初に **1 つの HTML だけ** ダウンロードしておき、画面の中身は **JavaScript が差し替える**。

```
最初のアクセス
  → index.html + React の JS をダウンロード
ページ遷移
  → JavaScript が必要な部分だけ書き換える（URL は変わるけどページは再読込されない）
```

ユーザー体験はスムーズ（画面が点滅しない、状態が保たれる）。

### 1-3. SPA の困りごと

ただし、SPA には **「URL とコンポーネントの対応を自前で管理する」** 必要があります。

```
ユーザーが /about にアクセス
  → どのコンポーネントを描画する？
  → ブラウザの戻る/進むボタンも動くようにしたい
  → URL を共有してもちゃんと開けるようにしたい
  → /users/123 みたいな動的 URL も扱いたい
```

この **「URL → コンポーネント」のマッピングと履歴管理** を担当するのが **ルーティングライブラリ**。React 界隈ではほぼ事実上の標準として **React Router** が使われています。

---

## 2. React Router をインストールする

```bash
npm install react-router-dom
```

> このプロジェクトでは v7 系がインストールされます。本ドキュメントは v7 を前提に書いています（v6 とほぼ同じ API）。

`package.json` を見て `react-router-dom` がある dependencies に入っていれば成功。

---

## 3. 最初のルート — 3 個の登場人物

React Router の最小構成は **3 つのコンポーネント** で表現できます。

| コンポーネント | 役割 |
|---|---|
| `<BrowserRouter>` | アプリ全体をラップ。ブラウザの履歴 API を有効化 |
| `<Routes>` | 複数の `<Route>` をまとめる枠 |
| `<Route>` | URL とコンポーネントを紐付ける 1 行 |

### 3-1. コード① — まずは 2 ページだけのアプリ

**`src/lessons/09-react-router/routes/Home.tsx`**

```tsx
export function Home() {
  return <h2>🏠 Home Page</h2>;
}
```

**`src/lessons/09-react-router/routes/About.tsx`**

```tsx
export function About() {
  return <h2>📖 About Page</h2>;
}
```

**`src/lessons/09-react-router/RouterRoot.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './routes/Home';
import { About } from './routes/About';

export function RouterRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**`src/App.tsx`** で表示する:

```tsx
import { RouterRoot } from './lessons/09-react-router/RouterRoot';

export default function App() {
  return <RouterRoot />;
}
```

### 3-2. 動作確認

- ブラウザで `http://localhost:5173/` → Home Page
- ブラウザのアドレスバーに `/about` を直接入れる → About Page

ただし今はまだ **画面内にリンクが無い** ので、URL を直打ちする必要があります。次の章で `<Link>` を導入します。

### 3-3. ポイントの整理

```tsx
<Route path="/about" element={<About />} />
```

- `path` … マッチさせる URL パス
- `element` … マッチしたときに描画する JSX（**コンポーネントを書く** のではなく **JSX 要素を渡す**）

> ⚠️ `element={About}` は **ダメ**。`element={<About />}` と JSX で書く。

---

## 4. ページ間を移動する — `<Link>`

普通の `<a href="/about">` でもページ遷移は動きますが、**画面の再読み込みが起きてしまう** ので SPA の意味が無くなります。

React Router 製の **`<Link>`** を使うと、JavaScript で URL だけ変更して、React Router が必要な部分だけ再描画してくれます。

### 4-1. コード② — リンクで遷移できるようにする

`Home.tsx` を以下に差し替え:

```tsx
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <h2>🏠 Home Page</h2>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>
    </div>
  );
}
```

`About.tsx` も同じく `<Link>` を追加して、相互に行き来できるようにします。

### 4-2. ポイント

- `<a href>` の代わりに `<Link to>` を使う
- ページが点滅せず、URL だけ変わって中身が差し替わる
- ブラウザの戻る/進むボタンも普通に動く

ただし、これだとリンクをページごとに書く必要があって面倒。**次の章のレイアウト** で解消します。

---

## 5. 動的なURL — `useParams`

「ユーザー詳細ページ」のような **URL の一部が可変** なケースは、`path` に `:変数名` を書きます。

### 5-1. コード③ — ユーザー詳細ページ

**`src/lessons/09-react-router/routes/users/UserDetail.tsx`**

```tsx
import { useParams } from 'react-router-dom';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <div>
      <h2>👤 User Detail</h2>
      <p>ユーザーID: {id}</p>
    </div>
  );
}
```

`RouterRoot.tsx` にルートを追加:

```tsx
<Route path="/users/:id" element={<UserDetail />} />
```

### 5-2. 動作確認

- `/users/1` にアクセス → 「ユーザーID: 1」
- `/users/abc` にアクセス → 「ユーザーID: abc」

### 5-3. ポイント

- `path="/users/:id"` の `:id` が **動的セグメント**
- `useParams()` でその値を取り出せる
- 型は **常に string**（URL は文字列だから）。数値が欲しければ `Number(id)` する

### 5-4. 複数の動的セグメント

```tsx
<Route path="/users/:userId/posts/:postId" element={<PostDetail />} />

const { userId, postId } = useParams<{ userId: string; postId: string }>();
```

---

## 6. ネストされたルート — `<Outlet>` でレイアウト共有

### 6-1. やりたいこと

「Header + コンテンツ + Footer」のような **共通レイアウト** を 1 箇所に書きたい。各ページで何度も書きたくない。

### 6-2. 解決策: `<Outlet>`

親ルートに **レイアウト用コンポーネント** を置き、その中の `<Outlet />` の場所に子ルートが差し込まれます。

```
<Layout>
  Header
  ┌──────────────┐
  │  <Outlet />  │  ← ここに子ルートのコンポーネントが入る
  └──────────────┘
  Footer
</Layout>
```

### 6-3. コード④ — レイアウトを作る

**`src/lessons/09-react-router/routes/Layout.tsx`**

```tsx
import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div>
      <header style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/users/1">User 1</Link>
        </nav>
      </header>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>

      <footer style={{ borderTop: '1px solid #ccc', padding: 8, marginTop: 16 }}>
        <small>© 2026 My App</small>
      </footer>
    </div>
  );
}
```

### 6-4. ルート定義をネスト

`RouterRoot.tsx` を書き換え:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './routes/Layout';
import { Home } from './routes/Home';
import { About } from './routes/About';
import { UserDetail } from './routes/users/UserDetail';

export function RouterRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="users/:id" element={<UserDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

ポイント:
- 親の `path="/"` `<Layout />` の中に `<Outlet />` が描画される
- 子ルートの `path` は **親に対する相対パス**（`/about` ではなく `about`）

### 6-5. もう各ページにリンクを書かなくて済む

`Home.tsx` / `About.tsx` から `<Link>` を消して、コンテンツだけにしましょう:

```tsx
export function Home() {
  return <h2>🏠 Home Page</h2>;
}
```

ヘッダのナビゲーションは `Layout.tsx` に集約されたので、全ページで共通表示されます。

---

## 7. インデックスルート

`/` の場合は `<Home />` を表示したい。でも `/about` の場合は `<About />` を表示したい。
親 `<Route path="/">` を `Layout` にするとき、**「親の URL ちょうどに該当するページ」** をどう書くかというと…

### 7-1. `index` ルートを使う

```tsx
<Route path="/" element={<Layout />}>
  <Route index element={<Home />} />            {/* ← / にマッチ */}
  <Route path="about" element={<About />} />    {/* ← /about にマッチ */}
  <Route path="users/:id" element={<UserDetail />} />
</Route>
```

`index` は `path` の代わりに書く特別な属性。**「親と同じパスのとき表示する子」** を意味します。

> 💡 「フォルダの index.html」と同じ感覚。

---

## 8. 現在のページをハイライト — `<NavLink>`

**今いるページのリンクを太字にしたい** とか **アクティブ状態のスタイルを当てたい** ときは、`<Link>` の代わりに `<NavLink>` を使います。

### 8-1. コード⑤ — NavLink を導入

`Layout.tsx` の `<Link>` を `<NavLink>` に置き換え:

```tsx
import { NavLink, Outlet } from 'react-router-dom';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  fontWeight: isActive ? 'bold' : 'normal',
  color: isActive ? '#0070f3' : '#333',
  textDecoration: 'none',
});

export function Layout() {
  return (
    <div>
      <header style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <NavLink to="/" end style={linkStyle}>Home</NavLink>
          <NavLink to="/about" style={linkStyle}>About</NavLink>
          <NavLink to="/users/1" style={linkStyle}>User 1</NavLink>
        </nav>
      </header>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
```

### 8-2. ポイント

- `style` (もしくは `className`) に **関数** を渡すと `isActive` を受け取れる
- `end` プロパティを `/` の `NavLink` に付ける理由: 付けないと `/about` でも `/` がアクティブ判定される（`/about` は `/` で **始まる** ため）。`end` を付けると **「完全一致のときだけアクティブ」** になる

---

## 9. プログラム的に遷移する — `useNavigate`

「フォーム送信が成功したら詳細ページに飛ばす」「ログアウトしたらトップに戻す」など、**ボタンや関数の中から遷移したい** ケース。

### 9-1. コード⑥ — useNavigate でログイン遷移

**`src/lessons/09-react-router/routes/Login.tsx`**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    // ログイン処理 ... (今はダミー)
    navigate('/dashboard');
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>🔐 Login</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="名前" />
      <button type="submit">ログイン</button>
    </form>
  );
}
```

### 9-2. useNavigate の主な使い方

```tsx
navigate('/about');                    // 指定パスへ
navigate('/users/1', { replace: true }); // 履歴を「置き換え」（戻るで戻れない）
navigate(-1);                          // ブラウザの「戻る」と同じ
navigate(1);                           // 「進む」
navigate('/users/1', { state: { from: 'home' } }); // state を持って遷移
```

### 9-3. `<Link>` と `useNavigate` の使い分け

| 場面 | 使うもの |
|---|---|
| **クリックで遷移できる UI**（メニュー、リスト項目） | `<Link>` / `<NavLink>` |
| **処理の後で遷移**（フォーム送信成功時、API レスポンス後） | `useNavigate` |

**「クリックされたら遷移」は必ず `<Link>`** を使う（右クリック → 新しいタブで開く、Cmd+クリックなどが動くため）。

---

## 10. クエリパラメータ — `useSearchParams`

`/search?q=react&page=2` のような **クエリ文字列** を読み書きするフック。

### 10-1. コード⑦ — 検索ページ

**`src/lessons/09-react-router/routes/Search.tsx`**

```tsx
import { useSearchParams } from 'react-router-dom';

export function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const page = Number(params.get('page') ?? '1');

  return (
    <div>
      <h2>🔍 Search</h2>
      <input
        value={q}
        onChange={(e) => setParams({ q: e.target.value, page: '1' })}
        placeholder="検索ワード"
      />
      <p>検索ワード: {q || '（未入力）'}</p>
      <p>ページ: {page}</p>
      <button onClick={() => setParams({ q, page: String(page + 1) })}>次へ</button>
    </div>
  );
}
```

ルート追加:

```tsx
<Route path="search" element={<Search />} />
```

### 10-2. 動作確認

- `/search?q=react` → 検索ワード: react
- 入力するたびに URL が変わる
- 「次へ」を押すと `?q=react&page=2` のように page が増える
- ブラウザの戻るボタンで前の検索状態に戻れる ← **これが SPA + URL state の強み**

### 10-3. ポイント

- `useSearchParams` は `useState` 的に `[params, setParams]` を返す
- `params.get('key')` で読み出し（**常に `string | null`**）
- `setParams({ ... })` で書き換え（全置換）
- 部分更新したいときは:

```tsx
const next = new URLSearchParams(params);
next.set('page', '2');
setParams(next);
```

---

## 11. 404 ページと `<Navigate>` リダイレクト

### 11-1. 存在しない URL に 404 を表示

**`src/lessons/09-react-router/routes/NotFound.tsx`**

```tsx
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div>
      <h2>😵 404 — Page Not Found</h2>
      <Link to="/">ホームに戻る</Link>
    </div>
  );
}
```

ルートに **`path="*"`** を追加:

```tsx
<Route path="/" element={<Layout />}>
  {/* ... 他のルート ... */}
  <Route path="*" element={<NotFound />} />
</Route>
```

`*` は **「他のどれにもマッチしなかった場合」** を意味するワイルドカード。**最後に書く** のがお作法。

### 11-2. `<Navigate>` でリダイレクト

「`/home` にアクセスされたら `/` にリダイレクトしたい」のような場合:

```tsx
import { Navigate } from 'react-router-dom';

<Route path="home" element={<Navigate to="/" replace />} />
```

`replace` を付けると **履歴に残らない**（戻るで戻ってこない）。リダイレクトでは普通 `replace` を付けます。

---

## 12. 認証ガード — 保護されたルート

「ログインしてないと `/dashboard` には入れないようにしたい」というケース。React Router には専用の仕組みは無く、**自前のラッパーコンポーネント** で実現します。

### 12-1. ダミーの認証モジュール

**`src/lessons/09-react-router/auth.ts`**

```ts
// 学習用のダミー認証。実プロジェクトでは Context / Zustand / Auth0 などを使う
let _user: { name: string } | null = null;
const listeners = new Set<() => void>();

export const auth = {
  get user() {
    return _user;
  },
  login(name: string) {
    _user = { name };
    listeners.forEach((l) => l());
  },
  logout() {
    _user = null;
    listeners.forEach((l) => l());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
```

> 💡 これは超簡易版。実務では `useContext` や状態管理ライブラリで管理します。

### 12-2. 保護用ラッパー

**`src/lessons/09-react-router/routes/Protected.tsx`**

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../auth';

export function Protected({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!auth.user) {
    // 元々行こうとしたページを覚えておいて、ログイン後に戻れるように
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
```

### 12-3. 使い方

ルート定義で囲む:

```tsx
<Route path="dashboard" element={
  <Protected><Dashboard /></Protected>
} />
```

### 12-4. ログイン後に元のページに戻る

`Login.tsx` を改良:

```tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../auth';

export function Login() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    auth.login(name);
    navigate(from, { replace: true });
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>🔐 Login</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="名前" />
      <button type="submit">ログイン</button>
    </form>
  );
}
```

これで:
1. ログアウト状態で `/dashboard` にアクセス → `/login` にリダイレクト（`state.from` に元のパス）
2. ログイン → `from` のパスに戻る

これは **「ガード → リダイレクト → 復帰」** という SPA の標準パターン。覚えて損なし。

---

## 13. データを取りに行く — Loaders（Data API）

ここまでの API（`<BrowserRouter>` / `<Routes>` / `<Route>`）は **古くからのルート定義 API**。React Router v6.4+ から **データルーター** という新しい API が増え、**Loader / Action** という機能でデータ取得まで一元化できるようになりました。

### 13-1. 何がうれしいか

これまでは:

```tsx
function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }, [id]);
  if (!user) return <p>Loading...</p>;
  return <div>{user.name}</div>;
}
```

…という **「コンポーネントに `useEffect` でデータ取得を書く」** パターンが普通でした。これだとローディングのちらつき、競合状態、エラーハンドリングを毎回書く必要があります。

**Loader** を使うと:
- ルートにマッチした瞬間、**コンポーネント描画前** にデータ取得が走る
- 取得完了するまで **前の画面のまま** で待つ（ちらつき無し）
- データはコンポーネントが `useLoaderData()` で受け取るだけ

### 13-2. データルーターのセットアップ

`<BrowserRouter>` を使う JSX 方式ではなく、**`createBrowserRouter`** を使います。

**`src/lessons/09-react-router/RouterRoot.tsx`** を書き換え:

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './routes/Layout';
import { Home } from './routes/Home';
import { About } from './routes/About';
import { UserDetail, userLoader } from './routes/users/UserDetail';
import { NotFound } from './routes/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />, // 後述
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'users/:id',
        element: <UserDetail />,
        loader: userLoader, // ← データロード関数を紐付け
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function RouterRoot() {
  return <RouterProvider router={router} />;
}
```

### 13-3. Loader を定義する

**`src/lessons/09-react-router/routes/users/UserDetail.tsx`**

```tsx
import { useLoaderData, type LoaderFunctionArgs } from 'react-router-dom';

type User = { id: string; name: string; email: string };

// Loader: ルートにマッチしたとき React Router が呼んでくれる関数
export async function userLoader({ params }: LoaderFunctionArgs): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${params.id}`);
  if (!res.ok) throw new Response('User not found', { status: 404 });
  return (await res.json()) as User;
}

export function UserDetail() {
  const user = useLoaderData() as User;
  return (
    <div>
      <h2>👤 {user.name}</h2>
      <p>email: {user.email}</p>
    </div>
  );
}
```

### 13-4. ローディング表示は？

`useNavigation()` で「現在ルーティング中か」を取れるので、`<Layout>` に書きます:

```tsx
import { NavLink, Outlet, useNavigation } from 'react-router-dom';

export function Layout() {
  const nav = useNavigation();
  return (
    <div>
      <header>...</header>
      <main>
        {nav.state === 'loading' && <p style={{ color: 'gray' }}>読み込み中...</p>}
        <Outlet />
      </main>
    </div>
  );
}
```

### 13-5. エラー処理 — `errorElement`

Loader で投げた `throw new Response(...)` や、コンポーネント内のエラーを **`errorElement`** がキャッチします。

```tsx
{
  path: 'users/:id',
  element: <UserDetail />,
  loader: userLoader,
  errorElement: <NotFound />, // loader が throw したらこっちが表示される
}
```

エラー詳細は `useRouteError()` で取れます:

```tsx
import { useRouteError } from 'react-router-dom';

export function NotFound() {
  const err = useRouteError();
  return <p>エラー: {err instanceof Response ? err.statusText : String(err)}</p>;
}
```

### 13-6. なぜ Loader が嬉しいか

| 項目 | useEffect 方式 | Loader 方式 |
|---|---|---|
| ローディングのちらつき | あり（マウント → useEffect → fetch） | 無し（マウント前に取得済み） |
| 競合状態 | 自分で AbortController | React Router が自動キャンセル |
| エラーハンドリング | コンポーネントごと | `errorElement` で集約 |
| 戻る/進むの再フェッチ | 自分で書く | 自動 |

ただし学習コストはあるので、**簡単なケースは useEffect / SWR / TanStack Query** でも全然 OK。役割が違うとも言えます。

---

## 14. データを送る — Actions と `<Form>`

Loader が「取得」なら、Action は「送信」。**HTML の `<form>` の感覚** で POST/PUT/DELETE を扱えます。

### 14-1. コード⑧ — 新規ユーザー追加

**`src/lessons/09-react-router/routes/users/NewUser.tsx`**

```tsx
import { Form, redirect, type ActionFunctionArgs } from 'react-router-dom';

export async function newUserAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  if (!name) throw new Response('name required', { status: 400 });

  // 実際は API へ POST する
  await fetch('https://jsonplaceholder.typicode.com/users', {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });

  return redirect('/users/1'); // 成功後に遷移
}

export function NewUser() {
  return (
    <Form method="post">
      <h2>➕ New User</h2>
      <input name="name" required placeholder="名前" />
      <button type="submit">追加</button>
    </Form>
  );
}
```

ルート登録:

```tsx
{
  path: 'users/new',
  element: <NewUser />,
  action: newUserAction,
}
```

### 14-2. なぜ `<form>` ではなく `<Form>` か

- `<form action="/users/new">` だと **ブラウザがそのままサーバーに POST** してしまう（SPA じゃなくなる）
- `<Form method="post">` は **クライアント内で React Router の action を呼ぶ**

`<input name="name">` の値が `formData` に自動で入るので、状態管理コード（`useState`）を 1 行も書かなくて良いのがメリット。

### 14-3. 送信中の状態

`useNavigation().state === 'submitting'` で「送信中か」を判定できます:

```tsx
const nav = useNavigation();
<button type="submit" disabled={nav.state === 'submitting'}>
  {nav.state === 'submitting' ? '送信中...' : '追加'}
</button>
```

### 14-4. 補足

Loader / Action を使い倒すと **state を React に持たずに URL とサーバーに任せる** スタイルになり、コード量がガクッと減ります。慣れると気持ちいい。

ただし学習コスト高めなので、最初は **`<Routes>` + `useEffect` の組み合わせ** で書けるようになってから挑戦するのが良いです。

---

## 15. 遅延ロード — ルートごとにコード分割

アプリが大きくなると、**初回ロードで全ページの JS を読み込むのが重くなる**。「そのページにアクセスされたときに初めて JS を読み込む」のが **遅延ロード（lazy loading）** です。

### 15-1. JSX 方式（`React.lazy`）

```tsx
import { lazy, Suspense } from 'react';
const About = lazy(() => import('./routes/About').then(m => ({ default: m.About })));

<Route path="about" element={
  <Suspense fallback={<p>Loading...</p>}>
    <About />
  </Suspense>
} />
```

### 15-2. データルーター方式（`lazy` プロパティ）

```tsx
{
  path: 'about',
  lazy: async () => {
    const { About } = await import('./routes/About');
    return { Component: About };
  },
}
```

これだけで、`/about` に初めてアクセスしたときだけ `About.tsx` の JS が読み込まれます。

### 15-3. いつ使うべきか

- 管理画面など **大量のページ** がある SPA → ほぼ必須
- ページが 5 つくらいの小規模 → 不要（むしろ初回読み込みが分割される分、ちらつきが増える）

---

## 16. ベストプラクティス

### 16-1. ✅ `<Link>` を使う

`<a href>` は SPA で使うとリロードが起きる。**遷移は必ず `<Link>` か `useNavigate`**。

### 16-2. ✅ レイアウトは `Outlet` で共有

ヘッダー / フッター / サイドバーを各ページで重複させない。`<Outlet>` を使った親ルート設計に。

### 16-3. ✅ URL を state として活用する

検索ワード、ページ番号、選択中のタブなどは **`useSearchParams` で URL に持つ**。**ブラウザ戻る/進むが効く、URL 共有できる** という SPA の本質的な強みが活きる。
逆に **「他のページで使わない一時的 UI 状態」**（モーダルの開閉など）は `useState` でローカルに持つのが良い。

### 16-4. ✅ 認証は `<Protected>` のようなラッパーで集約

ルートに散らかすと管理が破綻。

### 16-5. ✅ Loader / Action は **データ取得・更新を URL に紐付けたい時** に使う

無理に全部 Loader にしなくて良い。複雑度とのトレードオフ。

### 16-6. ✅ `errorElement` は最低 1 つ用意する

Loader が失敗したり、コンポーネントが throw したときの受け皿。本番で white screen を避けるための保険。

### 16-7. ✅ `NavLink` の `end` を `/` には必ず付ける

付けないと **全ページで `/` がアクティブ判定**される地獄になる。

### 16-8. ✅ 動的 import で初期ロードを軽くする

ページ数が多いなら遅延ロードを導入。

### 16-9. ✅ ルート定義は **1 ファイルにまとめる**

`RouterRoot.tsx` などにルート全体が見える状態を保つ。ルート定義があちこちに散ると **「このアプリの全 URL を知るのが大変」** になる。

---

## 17. アンチパターン集

### 17-1. 🚫 `<a href>` を使う

```tsx
<a href="/about">About</a>  {/* ← ページがリロードされる */}
```

### 17-2. 🚫 `useEffect` で `window.location.href` を書き換える

```tsx
useEffect(() => {
  if (!isLoggedIn) window.location.href = '/login'; // ← フルリロード
}, []);
```

`<Navigate to="/login" />` か `useNavigate` を使う。

### 17-3. 🚫 ルートを動的生成しないで if 文だらけ

```tsx
function App() {
  const path = window.location.pathname;
  if (path === '/') return <Home />;
  if (path === '/about') return <About />;
  // ...
}
```

完全にアンチパターン。これを解決するために React Router がある。

### 17-4. 🚫 全ページで状態を `useState` に押し込む

検索条件、ソート、フィルタ、ページ番号などを `useState` に持つと:
- リロードで失われる
- URL を共有できない
- 戻る/進むが効かない

→ `useSearchParams` で URL に持つ。

### 17-5. 🚫 認証チェックを各ページの先頭で `if (!user) return <Navigate />` 重複

DRY じゃない。`<Protected>` で囲む形に集約。

### 17-6. 🚫 `<NavLink to="/">` に `end` を付け忘れる

全ページで Home がアクティブ表示される。

### 17-7. 🚫 ルートを 1 つの巨大な配列にズラズラ書く

100 個超えてくると把握不能。`routes/` フォルダで分割管理。

---

## 18. やってみよう（卒業課題）

### 18-1. 初級

1. **ブログ風** — `/posts` 一覧、`/posts/:slug` 詳細、`/posts/new` 投稿フォーム
2. **テーマ切替を URL に持つ** — `/page?theme=dark` でクエリから読み取って、リンクで切り替え

### 18-2. 中級

3. **タブ付きユーザー詳細** — `/users/:id/info` `/users/:id/posts` `/users/:id/settings` をネスト
4. **検索ページのページネーション** — `?q=react&page=2` を URL に持つ
5. **ログイン後に元の URL に戻る** — `state.from` パターンを実装

### 18-3. 上級

6. **Loader で `jsonplaceholder` API からデータ取得** — `errorElement` で 404 ハンドリング
7. **Action でフォーム送信** — `<Form>` でユーザー追加、成功後リダイレクト
8. **遅延ロード** — 全ページを `lazy` で分割、Network タブで JS の遅延読み込みを確認
9. **`useBlocker`** で「フォーム入力中に他ページへ遷移しようとしたら警告」

---

## 19. チートシート

### 19-1. コンポーネント

| コンポーネント | 役割 |
|---|---|
| `<BrowserRouter>` | アプリ全体を囲う（JSX 方式） |
| `<RouterProvider router={...}>` | アプリ全体を囲う（Data API 方式） |
| `<Routes>` / `<Route>` | ルート定義（JSX 方式） |
| `<Outlet>` | 子ルートの差し込み位置 |
| `<Link to>` | クリックで遷移 |
| `<NavLink to>` | アクティブ状態が分かるリンク |
| `<Navigate to>` | レンダー時に即リダイレクト |
| `<Form method>` | Action と連携するフォーム |

### 19-2. フック

| フック | 戻り値 | 用途 |
|---|---|---|
| `useParams()` | `{ id, slug, ... }` | 動的セグメントの値 |
| `useSearchParams()` | `[params, setParams]` | クエリ文字列 |
| `useNavigate()` | `navigate(to, opts)` | プログラム的遷移 |
| `useLocation()` | `{ pathname, search, state }` | 現在の URL 情報 |
| `useLoaderData()` | Loader の戻り値 | Data API のデータ取得 |
| `useActionData()` | Action の戻り値 | Action 完了後の結果 |
| `useNavigation()` | `{ state, location }` | ルーティング中の状態 |
| `useRouteError()` | エラー | errorElement 内で使用 |
| `useMatch(pattern)` | マッチ情報 or null | パスマッチング判定 |
| `useOutletContext()` | 親が渡した context | Outlet 経由のデータ受け渡し |

### 19-3. パス記法

| 記法 | 意味 | 例 |
|---|---|---|
| 静的 | 固定パス | `/about` |
| 動的 | 変数化セグメント | `/users/:id` |
| 任意 | あってもなくても良い（v7） | `/users/:id?` |
| ワイルドカード | 残り全部 | `/files/*` |
| 全マッチ | 他のどれにも該当しなければ | `*` |

### 19-4. ルート定義の判断

```
データ取得が無いシンプルなルート？
├── Yes → <BrowserRouter> + <Routes> でOK
└── No  → createBrowserRouter + loader/action を使う
```

---

## 完走おめでとうございます 🎉

ここまでで、あなたは以下を身につけました:

- ✅ SPA とルーティングの本質を理解した
- ✅ `<Routes>` `<Route>` `<Outlet>` でレイアウト共有付きアプリを組める
- ✅ `<Link>` `<NavLink>` `useNavigate` で遷移を扱える
- ✅ 動的セグメント・クエリ・404・リダイレクトを実装できる
- ✅ 認証ガードを書ける
- ✅ Loader / Action でデータ取得・送信を URL に紐付けられる
- ✅ 遅延ロードで初期ロードを軽くできる
- ✅ ベストプラクティスとアンチパターンを判別できる

次のステップ:

- **公式ドキュメント**（https://reactrouter.com/）の Tutorial を写経して、Loader / Action を更に深掘り
- 実プロジェクトで **「state を URL に逃がす」** リファクタを試す
- **TanStack Router** や **Next.js App Router** との設計の違いを比較してみる
- フォーム周りは **react-hook-form** と React Router の `<Form>` の住み分けを意識して使う
