# React スタイリング徹底入門 — Tailwind CSS / CSS-in-JS / Modern CSS

> この1ファイルだけを **上から順に読みながら、自分の手でコードを書いていけば** 、
> 「Reactでのスタイリングの全体像」「Tailwind CSS」「Modern CSS」が一通り身につくように作っています。
>
> - 教材（解説）とコードは **分離していません** 。読み進める流れの中でコードが出てきます。
> - **簡単なものから順番に** 難しくしていきます。途中で投げ出さないでください。
> - 最後に、**バックエンド API を自作**して、そこから取得したデータを Tailwind で装飾する実践課題まで行きます（テンプレ・スキャフォルドは使いません。素の Node で API を書きます）。
>
> 対象プロジェクト: このリポジトリ（Vite + React 19 + TypeScript）。
> 想定読者: React は少し触ったことがあるが、CSS まわりは「なんとなく」でやってきたエンジニア。

---

## 目次

- [第0章 全体像 — なぜ「スタイリング手法」が何種類もあるのか](#第0章-全体像--なぜスタイリング手法が何種類もあるのか)
- [第1章 手法その1: インラインスタイル](#第1章-手法その1-インラインスタイル)
- [第2章 手法その2: 普通のCSS（グローバルCSS）とその落とし穴](#第2章-手法その2-普通のcssグローバルcssとその落とし穴)
- [第3章 手法その3: CSS Modules（スコープ問題の解決）](#第3章-手法その3-css-modulesスコープ問題の解決)
- [第4章 手法その4: CSS-in-JS（styled-components の考え方）](#第4章-手法その4-css-in-jsstyled-components-の考え方)
- [第5章 手法その5: ユーティリティファースト = Tailwind CSS の思想](#第5章-手法その5-ユーティリティファースト--tailwind-css-の思想)
- [第6章 Tailwind をこのプロジェクトに導入する](#第6章-tailwind-をこのプロジェクトに導入する)
- [第7章 Tailwind 基本ユーティリティを手で打つ](#第7章-tailwind-基本ユーティリティを手で打つ)
- [第8章 レスポンシブ・状態（hover/focus）・ダークモード](#第8章-レスポンシブ状態hoverfocusダークモード)
- [第9章 Tailwind のカスタマイズ（デザイントークンと @theme）](#第9章-tailwind-のカスタマイズデザイントークンと-theme)
- [第10章 Tailwind の「クラス地獄」問題と向き合う](#第10章-tailwind-のクラス地獄問題と向き合う)
- [第11章 Modern CSS — Tailwind の下で動いている現代の CSS](#第11章-modern-css--tailwind-の下で動いている現代の-css)
- [第12章 実践: 自作 API + fetch + Tailwind でカード一覧を作る](#第12章-実践-自作-api--fetch--tailwind-でカード一覧を作る)
- [第13章 まとめとチートシート](#第13章-まとめとチートシート)

---

## 第0章 全体像 — なぜ「スタイリング手法」が何種類もあるのか

最初に地図を持っておきましょう。Reactアプリに色や余白を付ける方法は、大きく次の5つに分類できます。

| # | 手法 | 一言で言うと | 代表例 |
|---|------|-------------|--------|
| 1 | インラインスタイル | JSの`style`属性に直接書く | `style={{ color: 'red' }}` |
| 2 | 普通のCSS | `.css`を読み込んで`className`で当てる | `index.css` |
| 3 | CSS Modules | 普通のCSSだがクラス名が自動でユニークになる | `Button.module.css` |
| 4 | CSS-in-JS | JSの中にCSSを書く（コンポーネント単位） | styled-components / Emotion |
| 5 | ユーティリティファースト | 小さな部品クラスを組み合わせる | **Tailwind CSS** |

### なぜ分かれているのか — 全部が解こうとしている「3つの問題」

歴史的に、CSSには次の悩みがありました。手法はこれらをどう解くかで分かれています。

1. **スコープ問題**: CSSはデフォルトで「全部グローバル」。`.title`と書くと、アプリ中の全`.title`に効いてしまう。誰かのスタイルが、別の誰かを壊す。
2. **重複・命名問題**: `card-title`, `card__title`, `cardTitle`… 命名規則（BEMなど）を決めても、人間が手で守るのは大変。
3. **動的スタイル問題**: 「ログイン状態なら青、未ログインなら灰色」のように、JSの状態に応じてスタイルを変えたい。

各手法は次のように解いています。

- インライン → スコープ問題は完璧に解決（その要素にしか効かない）。でも再利用・擬似クラス(`:hover`)・メディアクエリが苦手。
- 普通のCSS → 何も解決していない（が、シンプルで速い）。
- CSS Modules → スコープ問題をビルド時のクラス名変換で解決。
- CSS-in-JS → スコープ＋動的スタイルをJSの力で解決。ただし実行時コストやセットアップが増える。
- Tailwind → 「そもそも自分でクラスを命名しない」ことで命名・スコープ問題を消し去る。最初は見た目が独特。

> **結論を先に言うと**: 2026年現在、新規Reactプロジェクトのデファクトは **Tailwind CSS** です。ただし「なぜTailwindが選ばれたか」は、他の手法の痛みを知らないと腑に落ちません。だからこの教材は、わざわざ1→5の順で全部触ります。

それでは、一番素朴な「インラインスタイル」から、実際に手を動かしていきましょう。

---

## 第1章 手法その1: インラインスタイル

まず、現状のプロジェクトを起動できるようにしておきます。ターミナルで:

```bash
npm install
npm run dev
```

`http://localhost:5173` が開けばOKです。

> このリポジトリの表示の仕組み: `src/main.tsx` は `<App />` を描画するだけで、**今どのレッスンを画面に出すかは `src/App.tsx` で切り替えます**。`App.tsx` を見ると、たくさんの import がコメントアウトされていて、「学習中の章のコンポーネントだけコメントを外す」運用になっています。この教材でも、その既存スタイルにそろえて「作ったレッスンを `App.tsx` で表示する」方式で進めます（React Router は使いません。1画面ずつ確認する方がスタイリング学習には向くため）。

### 1-1. 練習用ページを作る

学習用の独立したページを1枚作りましょう。`src/lessons/` というフォルダを作り、その中に作業していきます。

> 📁 **あなたが作るファイル**: `src/lessons/InlineStyleLesson.tsx`

まず、何のスタイルも当てない素のコンポーネントを書きます。**実際にエディタで打ってください。**

```tsx
// src/lessons/InlineStyleLesson.tsx
export function InlineStyleLesson() {
  return (
    <div>
      <h1>インラインスタイルの練習</h1>
      <p>これは段落です。</p>
      <button>ボタン</button>
    </div>
  )
}
```

### 1-2. App.tsx で画面に出す

作ったコンポーネントを画面に表示します。`src/App.tsx` を開いてください。既存の `App.tsx` は、こんな形になっているはずです（学習中のものだけ表示する運用）:

```tsx
// src/App.tsx（既存）
// import { ... } from '...'  ← いろいろコメントアウトされている
import { StateManagementDemo } from './lessons/10-state-management/StateManagementDemo';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <StateManagementDemo />
    </div>
  );
}
```

これを、今回作ったレッスンを表示するように一時的に書き換えます。**既存の行はコメントアウトして残しておく**と、あとで戻せて便利です。

```tsx
// src/App.tsx
import { InlineStyleLesson } from './lessons/InlineStyleLesson';
// import { StateManagementDemo } from './lessons/10-state-management/StateManagementDemo';

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <InlineStyleLesson />
      {/* <StateManagementDemo /> */}
    </div>
  );
}
```

保存すると、`http://localhost:5173` にさっきの素のページが表示されます。

> 💡 これ以降の章でも「新しいレッスン用コンポーネントを作る → `App.tsx` で `import` して表示する（前のはコメントアウト）」を繰り返します。最初の1回さえ分かれば、あとは同じ作業です。以降の各章では単に「**`App.tsx` で表示する（第1章の要領）**」とだけ書きます。

### 1-3. style 属性でスタイルを当てる

HTMLの`style="color: red"`とは違い、Reactの`style`は **JavaScriptのオブジェクト** を受け取ります。ここが最初のつまずきポイントなので、ゆっくり。

```tsx
// src/lessons/InlineStyleLesson.tsx
export function InlineStyleLesson() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'tomato', fontSize: 28 }}>インラインスタイルの練習</h1>
      <p style={{ color: '#555', lineHeight: 1.7 }}>これは段落です。</p>
      <button
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 8,
        }}
      >
        ボタン
      </button>
    </div>
  )
}
```

ここで覚えるべきルールは3つだけ:

1. `style={{ ... }}` の **外側の `{}` は「JSを書く」合図**、**内側の `{}` はオブジェクトリテラル**。だから波カッコが2重になる。
2. プロパティ名は **キャメルケース**。CSSの`background-color`はJSでは`backgroundColor`、`font-size`は`fontSize`。
3. 値は文字列か数値。**数値を渡すと自動で `px` が付く**（`fontSize: 28` → `28px`）。`%`や`rem`を使いたいときは文字列で `'1.5rem'`。

### 1-4. 動的スタイル（インラインの最大の強み）

インラインの良いところは、JSの変数をそのまま値に使えること。`useState`で「押すと色が変わるボタン」を作ってみましょう。

```tsx
// src/lessons/InlineStyleLesson.tsx
import { useState } from 'react'

export function InlineStyleLesson() {
  const [on, setOn] = useState(false)

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'tomato' }}>インラインスタイルの練習</h1>
      <button
        onClick={() => setOn((prev) => !prev)}
        style={{
          backgroundColor: on ? '#16a34a' : '#9ca3af', // 状態で色を変える
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        {on ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}
```

クリックして色とラベルが切り替われば成功です。`backgroundColor: on ? ... : ...` のように、**状態に応じてスタイルを三項演算子で出し分けられる**のがインラインの真骨頂です。

### 1-5. インラインスタイルの限界

便利そうですが、実務では「補助的にしか使わない」のが普通です。理由:

- **`:hover` や `:focus` が書けない**（擬似クラスはJSオブジェクトで表現できない）。
- **メディアクエリ（レスポンシブ）が書けない**。
- スタイルが要素にベタ書きされるので **再利用しづらい** し、JSXが読みにくくなる。
- パフォーマンス上も、毎レンダリングで新しいオブジェクトが作られる。

> ✅ **第1章のまとめ**: インラインは「動的・一点物」に向く。`:hover`やレスポンシブが必要になった瞬間、別の手法が欲しくなる。その「別の手法」を次章から見ていきます。

---

## 第2章 手法その2: 普通のCSS（グローバルCSS）とその落とし穴

次は、Web開発の王道「`.css`ファイルを書いて`className`で当てる」方法です。`:hover`もメディアクエリも書けます。

### 2-1. CSSファイルとコンポーネントを作る

> 📁 **あなたが作るファイル**: `src/lessons/GlobalCssLesson.css`

```css
/* src/lessons/GlobalCssLesson.css */
.lesson-card {
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  max-width: 360px;
}

.lesson-title {
  font-size: 24px;
  color: #111827;
}

.lesson-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

/* インラインでは書けなかった :hover がCSSなら書ける！ */
.lesson-button:hover {
  background-color: #1d4ed8;
}
```

> 📁 **あなたが作るファイル**: `src/lessons/GlobalCssLesson.tsx`

```tsx
// src/lessons/GlobalCssLesson.tsx
import './GlobalCssLesson.css' // CSSをimportするだけで全体に適用される

export function GlobalCssLesson() {
  return (
    <div className="lesson-card">
      <h1 className="lesson-title">グローバルCSSの練習</h1>
      <button className="lesson-button">ホバーしてみて</button>
    </div>
  )
}
```

`App.tsx` で表示して（第1章と同じ要領）、ブラウザで確認。ボタンにマウスを乗せると色が濃くなれば成功です。`className`（HTMLでは`class`だがJSXでは`className`）でCSSのクラスを当てる、という基本形を押さえてください。

### 2-2. 落とし穴を体験する（重要）

「`import './GlobalCssLesson.css'` で全体に適用される」と書きました。**全体に**、です。ここに罠があります。実演しましょう。

別の人が、別のページ用に次のCSSを書いたとします。

```css
/* 例えば src/lessons/OtherPage.css に、誰かがこう書いた */
.lesson-title {
  color: red;       /* この人は自分のページの見出しを赤くしたかっただけ */
  font-size: 12px;
}
```

このファイルがアプリのどこかで`import`されると、**あなたの`GlobalCssLesson`の見出しまで赤く小さくなります**。CSSはファイルを分けても、最終的に1枚のグローバルな空間にマージされるからです。クラス名が衝突した時点で事故が起きます。

これが第0章で触れた **スコープ問題** です。プロジェクトが大きくなるほど、`.title` `.active` `.container` といったありふれた名前は必ず衝突します。

### 2-3. 昔の対策: 命名規則（BEM）

人類はまず「名前で殴り合わないルールを作ろう」と考えました。代表が **BEM (Block / Element / Modifier)** です。

```css
/* BEM の例: ブロック名__要素名--修飾子 */
.lesson-card__title { /* ... */ }
.lesson-card__button { /* ... */ }
.lesson-card__button--primary { /* ... */ }
```

`lesson-card`というブロック名をプレフィックスにすることで衝突を避けます。効果はありますが、**人間が規律を守り続ける**必要があり、クラス名は長くなります。「規律ではなく、仕組みで解決したい」——そこで登場するのが次のCSS Modulesです。

> ✅ **第2章のまとめ**: 普通のCSSは強力（hover/レスポンシブOK）だが、グローバルなので衝突する。BEMは規律による緩和策。仕組みで解決したい。

---

## 第3章 手法その3: CSS Modules（スコープ問題の解決）

CSS Modules は「**ファイル名を `.module.css` にするだけで、クラス名をビルド時に自動でユニーク化してくれる**」仕組みです。Vite は標準対応しているので、追加インストール不要です。

### 3-1. 書いてみる

> 📁 **あなたが作るファイル**: `src/lessons/ModuleLesson.module.css`

```css
/* src/lessons/ModuleLesson.module.css */
/* 普通のCSSと書き方は同じ。普通の短い名前でOK */
.card {
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  max-width: 360px;
}

.title {
  font-size: 24px;
  color: #111827;
}

.button {
  background-color: #7c3aed;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}
.button:hover {
  background-color: #6d28d9;
}
```

> 📁 **あなたが作るファイル**: `src/lessons/ModuleLesson.tsx`

```tsx
// src/lessons/ModuleLesson.tsx
import styles from './ModuleLesson.module.css' // ★ オブジェクトとしてimportする

export function ModuleLesson() {
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>CSS Modules の練習</h1>
      <button className={styles.button}>ボタン</button>
    </div>
  )
}
```

`App.tsx` で表示して確認しましょう。

### 3-2. 何が起きているのか（仕組みの理解）

ポイントは `import styles from './ModuleLesson.module.css'` の部分。

- 普通のCSSは「`import './x.css'`」と副作用的に読み込むだけでした。
- CSS Modules は **`styles` というオブジェクト** をくれます。中身は `{ card: "ModuleLesson_card_a1b2c", title: "ModuleLesson_title_x9y8z", ... }` のように、**元のクラス名 → 自動生成されたユニークな名前** の対応表です。

ブラウザの開発者ツールで要素を調べると、`class="ModuleLesson_card_a1b2c"` のようにハッシュ付きの名前になっているはずです。つまり:

- あなたは `.card` という **短くて分かりやすい名前** を書ける。
- 実際のクラス名はファイルごとにユニーク化されるので、**別ファイルの `.card` と絶対に衝突しない**。

第2章の「`.lesson-title`が他人に壊される」問題が、**規律ではなく仕組みで** 消えました。これがCSS Modulesの価値です。

### 3-3. 複数クラスや動的クラス

複数のクラスを当てたい、状態で出し分けたい場合はテンプレートリテラルや配列で組み立てます。

```tsx
import styles from './ModuleLesson.module.css'

export function ModuleLesson({ active }: { active: boolean }) {
  return (
    <button className={`${styles.button} ${active ? styles.active : ''}`}>
      ボタン
    </button>
  )
}
```

このつなぎ合わせが面倒になってくると、後述の `clsx` のようなライブラリを使います（第10章で登場）。

> ✅ **第3章のまとめ**: CSS Modules は「普通のCSSの書き味」＋「自動スコープ」。手堅い選択肢。ただし、ファイルが2つ(.tsxと.module.css)に分かれる・動的スタイルがやや面倒、という弱点は残る。

---

## 第4章 手法その4: CSS-in-JS（styled-components の考え方）

CSS-in-JS は「**JavaScript/TypeScript のファイルの中に、その場でCSSを書いてしまう**」アプローチです。代表は `styled-components` と `Emotion`。スコープ問題も動的スタイルも、JSの力で同時に解決します。

> ⚠️ このプロジェクトには styled-components を**入れません**（依存を増やさないため、そして「考え方」を理解するのが目的だから）。この章は **概念の理解** が中心です。最後に、ライブラリ無しで雰囲気を再現する小さな自作版も作ります。

### 4-1. styled-components ならこう書く（概念）

もし `npm install styled-components` していたら、こう書けます:

```tsx
// ※これはイメージ。実際にこのプロジェクトで動かす必要はありません
import styled from 'styled-components'

// 「styled.button」= styleが当たったbuttonコンポーネントを作る
const Button = styled.button`
  background-color: ${(props) => (props.$primary ? '#2563eb' : '#9ca3af')};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    opacity: 0.85;   /* :hover も書ける */
  }
`

function App() {
  return (
    <div>
      <Button $primary>主ボタン</Button>
      <Button>副ボタン</Button>
    </div>
  )
}
```

ここで起きていることを言葉にすると:

- `styled.button\`...\`` は **タグ付きテンプレートリテラル**。バッククォートの中に普通のCSSを書く。
- 戻り値の `Button` は **普通のReactコンポーネント**。`className`を書く必要がない。
- `${(props) => ...}` で、**propsに応じてCSSの値を動的に差し込める**。これがCSS-in-JS最大の魅力。
- スコープは自動（styled-componentsが内部でユニークなクラス名を生成して`<head>`に注入する）。

つまり「CSS Modulesの自動スコープ」＋「インラインの動的さ」＋「`:hover`やメディアクエリも書ける」を一手に得られる、というのが売りです。

### 4-2. 代償（なぜ最近Tailwindに押されているか）

良いことづくめに見えますが、トレードオフがあります。

- **実行時コスト**: 多くのCSS-in-JSは、ブラウザ上でJSが動いてスタイルを生成・注入します。レンダリングのたびに処理が走り、大規模だと無視できない負荷に。
- **SSR/RSCとの相性**: React Server Components（サーバー側で実行されるコンポーネント）と、実行時CSS-in-JSは相性が悪い場面がある。
- **バンドルサイズ**: ライブラリ分のJSが増える。
- これらを嫌って、近年は「ビルド時にCSSへ変換する」ゼロランタイム系（vanilla-extract, Linaria, PandaCSS 等）や、そもそも **Tailwind** に流れる動きが強いです。

### 4-3. ライブラリ無しで「考え方」だけ自作してみる

「JSの中でスタイルを組み立てて返す」感覚を掴むため、依存無しの簡易版を書いてみましょう。CSSオブジェクトをpropsで組み立て、インラインstyleとして返すだけの素朴なものです。

> 📁 **あなたが作るファイル**: `src/lessons/CssInJsLesson.tsx`

```tsx
// src/lessons/CssInJsLesson.tsx
import type { CSSProperties } from 'react'

// 「propsを受け取ってスタイルオブジェクトを返す関数」がCSS-in-JSの核
function buttonStyle(primary: boolean): CSSProperties {
  return {
    backgroundColor: primary ? '#2563eb' : '#9ca3af',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
  }
}

function Button({
  primary = false,
  children,
}: {
  primary?: boolean
  children: React.ReactNode
}) {
  return <button style={buttonStyle(primary)}>{children}</button>
}

export function CssInJsLesson() {
  return (
    <div style={{ padding: 24, display: 'flex', gap: 12 }}>
      <Button primary>主ボタン</Button>
      <Button>副ボタン</Button>
    </div>
  )
}
```

`App.tsx` で表示して確認。これは`:hover`が書けない簡易版ですが、「**スタイルをコンポーネントに閉じ込め、propsで動的に決める**」というCSS-in-JSの思想は体感できます。本物のstyled-componentsは、これを`:hover`やメディアクエリ込みで、本物のCSSとして実現してくれる、というわけです。

> ✅ **第4章のまとめ**: CSS-in-JSは「動的・スコープ・擬似クラス」を全部JSで解決する強力な思想。ただし実行時コストとモダンReactとの相性で、近年は逆風。ここまでで「他の手法の痛みと利点」が揃いました。いよいよ本命のTailwindへ。

---

## 第5章 手法その5: ユーティリティファースト = Tailwind CSS の思想

ここまでの4手法は、どれも「**自分でクラス名を考えて、そこにCSSを書く**」点が共通でした。`.lesson-button { ... }` のように。

Tailwind の発想は真逆です。

> **「クラスを自分で作るのをやめよう。あらかじめ用意された、1つのことだけする小さなクラスを、HTML(JSX)の上で組み合わせよう。」**

これが **ユーティリティファースト (utility-first)** です。

### 5-1. 同じボタンを各手法で書き比べる

これまで作ってきた青いボタンを、Tailwindで書くとこうなります（まだ導入していないので、今は「見るだけ」）:

```html
<!-- Tailwind -->
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  ボタン
</button>
```

各クラスの意味:

- `bg-blue-600` → `background-color` を青(600の濃さ)に
- `text-white` → 文字色を白に
- `px-4` → 左右の `padding` を `1rem` (=16px) に（p=padding, x=横方向, 4=4単位=1rem）
- `py-2` → 上下の `padding` を `0.5rem` (=8px) に
- `rounded-lg` → 角丸(large)
- `hover:bg-blue-700` → **ホバー時だけ** 背景を濃い青に

CSSファイルは1行も書いていません。CSSファイルとJSXを行き来する必要もありません。

### 5-2. 「最初の拒否反応」と、その後の評価

Tailwindを初めて見た人はほぼ全員こう思います: **「クラス名が多すぎて汚い。インラインスタイルと何が違うの?」**

正当な疑問です。違いと利点を整理します。

| 観点 | インラインstyle | Tailwind |
|------|----------------|----------|
| `:hover` `:focus` | ❌ 書けない | ✅ `hover:` `focus:` |
| メディアクエリ（レスポンシブ） | ❌ 書けない | ✅ `md:` `lg:` |
| 値の統一感 | ❌ `13px`等バラバラに書ける | ✅ `p-4`等、決められた目盛りから選ぶ |
| 命名 | 不要 | 不要（**ここがCSS Modules等との差**） |
| スコープ問題 | 起きない | 起きない（グローバルCSSを書かないから） |

つまりTailwindは「インラインの“命名しなくていい身軽さ”」を保ったまま、「インラインの弱点（hover/レスポンシブ不可、値が無秩序）」を全部克服したもの、と理解すると腑に落ちます。

さらに重要な利点:

- **デザインの一貫性**: 余白は`p-1, p-2, p-4...`という決まった目盛り（デザイントークン）からしか選べない。だから「ある人は13px、別の人は15px」みたいなブレが起きにくい。
- **未使用CSSが消える**: Tailwindはビルド時、実際にJSXで使ったクラスだけを最終CSSに含めます。だから何千クラスあっても、本番のCSSは小さい。
- **削除が怖くない**: コンポーネントを消せばクラスも一緒に消える。「このCSS、まだ誰か使ってる?」という恐怖（グローバルCSS最大の悩み）が無い。

### 5-3. では実際に導入しよう

理屈は十分です。次章で、このプロジェクトにTailwindを入れて、手を動かします。

> ✅ **第5章のまとめ**: Tailwind = 「命名しない・小さなクラスを組み合わせる」ユーティリティファースト。インラインの身軽さ＋普通のCSSの表現力＋スコープ安全性。最初は汚く見えるが、一貫性・未使用CSS削除・削除安全性で勝つ。

---

## 第6章 Tailwind をこのプロジェクトに導入する

このプロジェクトは **Vite + React 19** です。Tailwind の最新版（v4系）は、Vite用の専用プラグインを使うのが最も簡単で高速です。

### 6-1. インストール

ターミナルで、プロジェクトのルートで実行します:

```bash
npm install tailwindcss @tailwindcss/vite
```

> 補足: Tailwind v4 から、設定が大きく簡略化されました。**`tailwind.config.js` も `postcss.config.js` も不要**（必要になったら作る）です。昔のネット記事だと「`npx tailwindcss init -p` を実行」と書いてありますが、それは v3 までの手順です。この教材は v4 前提で進めます。

### 6-2. Vite プラグインを登録する

このプロジェクトの `vite.config` を開いてください（`vite.config.ts` か `vite.config.js`）。Tailwindプラグインを足します。だいたい次のような形になります（既存のreactプラグインは残す）:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // ★追加

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ★追加
  ],
})
```

### 6-3. CSS に Tailwind を読み込む

エントリーのCSS、つまり `src/index.css` の **一番上** に次の1行を足します。

```css
/* src/index.css の先頭に追加 */
@import "tailwindcss";
```

> 注意: このプロジェクトの `src/index.css` には、既にデフォルトの色やボタンのスタイルが書かれています。それらが Tailwind の見た目と喧嘩する場合があります。学習中は、`@import "tailwindcss";` だけ残して、既存の見慣れない指定は一旦コメントアウトしてもOKです（あなたの判断で）。

### 6-4. 動作確認

開発サーバを再起動します（プラグインを足したので一度止めて`npm run dev`）。動作確認用に小さなページを作ります。

> 📁 **あなたが作るファイル**: `src/lessons/TailwindHello.tsx`

```tsx
// src/lessons/TailwindHello.tsx
export function TailwindHello() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">
        Tailwind が効いた！
      </h1>
      <p className="mt-2 text-gray-500">
        この文字が青くて太くて大きければ、導入成功です。
      </p>
    </div>
  )
}
```

`App.tsx` で表示して（第1章の要領）、`http://localhost:5173` を開きます。見出しが **青・太字・大きい** 状態で表示されれば、Tailwind導入は完了です。🎉

もし効いていなければチェック:

- `vite.config` に `tailwindcss()` を足したか / サーバを再起動したか
- `src/index.css` に `@import "tailwindcss";` があるか
- その `index.css` が `src/main.tsx` で `import './index.css'` されているか（このプロジェクトは元から import 済み）

> ✅ **第6章のまとめ**: v4は「npm install → viteプラグイン登録 → CSSで`@import "tailwindcss";`」の3ステップ。設定ファイル不要。

---

## 第7章 Tailwind 基本ユーティリティを手で打つ

ここからは実際にクラスを打って体で覚えます。**読むだけでなく、必ず1つずつ画面で確認してください。** クラス名は「カテゴリの接頭辞 + 値」というパターンなので、規則を掴めば暗記は不要です。

作業用に1ファイル用意します。

> 📁 **あなたが作るファイル**: `src/lessons/TailwindBasics.tsx`

```tsx
// src/lessons/TailwindBasics.tsx
export function TailwindBasics() {
  return (
    <div className="p-8 space-y-8">
      {/* この中に、以下の各ブロックを順番に書いていきます */}
    </div>
  )
}
```

`App.tsx` で表示してください（第1章の要領）。以降、`space-y-8` の `div` の中身を増やしていきます。

### 7-1. 余白（margin / padding）

最頻出です。規則:

- `p` = padding, `m` = margin
- 方向: `t`(top) `r`(right) `b`(bottom) `l`(left) `x`(左右) `y`(上下)、無しは全方向
- 数値: `0, 1, 2, 3, 4, 6, 8, ...`。**1 = 0.25rem = 4px**。つまり `p-4` = 16px、`p-2` = 8px。

```tsx
<section>
  <h2 className="text-xl font-bold mb-2">余白</h2>
  <div className="bg-blue-100 p-2">p-2 (8px の内側余白)</div>
  <div className="bg-blue-100 p-6 mt-4">p-6 (24px) で mt-4 (上に16px)</div>
  <div className="bg-blue-100 px-8 py-2 mt-4">px-8 py-2 (左右32px / 上下8px)</div>
</section>
```

「`4`が`16px`」だけ覚えれば、あとは比例計算でだいたい分かります。

### 7-2. 色（背景・文字・枠）

- 背景: `bg-{色}-{濃さ}` 例 `bg-red-500`
- 文字: `text-{色}-{濃さ}` 例 `text-gray-700`
- 枠線色: `border-{色}-{濃さ}`（枠を出すには `border` も必要）
- 濃さ: `50`(薄) → `100, 200, ... 900, 950`(濃)。`500`が基準。

```tsx
<section>
  <h2 className="text-xl font-bold mb-2">色</h2>
  <div className="flex gap-2">
    <span className="bg-red-500 text-white px-3 py-1 rounded">red-500</span>
    <span className="bg-green-600 text-white px-3 py-1 rounded">green-600</span>
    <span className="bg-amber-400 text-black px-3 py-1 rounded">amber-400</span>
  </div>
  <p className="text-gray-500 mt-3">これは text-gray-500 の文字</p>
</section>
```

### 7-3. 文字（タイポグラフィ）

- サイズ: `text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, ...`
- 太さ: `font-light, font-normal, font-medium, font-semibold, font-bold`
- 行間: `leading-tight, leading-normal, leading-relaxed`
- 揃え: `text-left, text-center, text-right`

```tsx
<section>
  <h2 className="text-xl font-bold mb-2">タイポグラフィ</h2>
  <p className="text-3xl font-bold">3xl / bold の見出し</p>
  <p className="text-base text-gray-700 leading-relaxed">
    text-base / leading-relaxed の本文。行間が広めで読みやすい。
  </p>
  <p className="text-sm text-center text-gray-400 mt-2">sm / 中央寄せ / 薄字</p>
</section>
```

### 7-4. 角丸・影・枠線

- 角丸: `rounded-sm, rounded, rounded-lg, rounded-xl, rounded-full`(完全な丸)
- 影: `shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl`
- 枠線: `border`(1px) `border-2` + 色

```tsx
<section>
  <h2 className="text-xl font-bold mb-2">角丸・影・枠</h2>
  <div className="flex gap-4">
    <div className="bg-white border border-gray-300 rounded-lg p-4">border + rounded-lg</div>
    <div className="bg-white rounded-xl shadow-lg p-4">shadow-lg</div>
    <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center">丸</div>
  </div>
</section>
```

### 7-5. Flexbox レイアウト（超重要）

横並び・縦並び・中央寄せはこれで全部やります。

- `flex` で flex コンテナにする
- 方向: `flex-row`(既定/横) `flex-col`(縦)
- 主軸の配置: `justify-start / center / end / between / around`
- 交差軸の配置: `items-start / center / end / stretch`
- 子要素の間隔: `gap-2, gap-4, ...`

```tsx
<section>
  <h2 className="text-xl font-bold mb-2">Flexbox</h2>

  {/* 横並び + 間隔 */}
  <div className="flex gap-3">
    <div className="bg-blue-200 p-3">A</div>
    <div className="bg-blue-200 p-3">B</div>
    <div className="bg-blue-200 p-3">C</div>
  </div>

  {/* 両端寄せ（ナビバーでよく使う） */}
  <div className="flex justify-between items-center bg-gray-100 p-3 mt-4">
    <span className="font-bold">ロゴ</span>
    <button className="bg-blue-600 text-white px-3 py-1 rounded">ログイン</button>
  </div>

  {/* 上下左右の完全中央 */}
  <div className="flex items-center justify-center h-32 bg-gray-100 mt-4">
    <span>ど真ん中</span>
  </div>
</section>
```

`flex items-center justify-center` の3点セットで「中央寄せ」、`flex justify-between items-center` で「ナビバー」。この2つは丸暗記する価値があります。

### 7-6. Grid レイアウト（カード並べ）

格子状に並べるなら Grid。

- `grid` でグリッド化
- 列数: `grid-cols-2, grid-cols-3, ...`
- 間隔: `gap-4`

```tsx
<section>
  <h2 className="text-xl font-bold mb-2">Grid</h2>
  <div className="grid grid-cols-3 gap-4">
    <div className="bg-purple-200 p-6 rounded">1</div>
    <div className="bg-purple-200 p-6 rounded">2</div>
    <div className="bg-purple-200 p-6 rounded">3</div>
    <div className="bg-purple-200 p-6 rounded">4</div>
    <div className="bg-purple-200 p-6 rounded">5</div>
    <div className="bg-purple-200 p-6 rounded">6</div>
  </div>
</section>
```

ここまで打って画面で確認できたら、Tailwindの基礎体力は付いています。次は「画面幅で変わる」「ホバーで変わる」を足します。

> ✅ **第7章のまとめ**: クラスは「接頭辞 + 値」。`p/m`(余白), `bg/text`(色), `text-*`(文字), `rounded/shadow/border`(装飾), `flex/grid`(レイアウト)。`flex items-center justify-center` と `flex justify-between items-center` は必修。

---

## 第8章 レスポンシブ・状態（hover/focus）・ダークモード

Tailwind が「インラインスタイルの上位互換」たる理由がこの章です。**接頭辞（プレフィックス）を付けるだけ**で、条件付きスタイルが書けます。

### 8-1. 状態バリアント（hover / focus / active / disabled）

クラスの前に `hover:` などを付けると「その状態のときだけ効く」スタイルになります。

```tsx
// src/lessons/TailwindStates.tsx
export function TailwindStates() {
  return (
    <div className="p-8 space-y-4">
      <button className="bg-blue-600 text-white px-4 py-2 rounded
                         hover:bg-blue-700
                         active:scale-95
                         focus:outline-none focus:ring-2 focus:ring-blue-400
                         transition">
        ホバー・クリック・フォーカスしてみて
      </button>

      <button
        disabled
        className="bg-blue-600 text-white px-4 py-2 rounded
                   disabled:bg-gray-300 disabled:cursor-not-allowed">
        無効化ボタン
      </button>
    </div>
  )
}
```

- `hover:bg-blue-700` … マウスを乗せたとき濃く
- `active:scale-95` … 押している間ちょっと縮む
- `focus:ring-2 focus:ring-blue-400` … キーボードフォーカス時に青い輪っか（アクセシビリティ的に重要）
- `disabled:bg-gray-300` … `disabled`属性のとき灰色
- `transition` … 状態変化をなめらかに（これが無いとパッと切り替わる）

`App.tsx` で表示して（第1章の要領）、実際にホバー・クリック・Tabキーでフォーカスして確かめてください。

### 8-2. レスポンシブ（画面幅で変える）

接頭辞 `sm: md: lg: xl:` を付けると「その画面幅**以上**で効く」スタイルになります。Tailwindは **モバイルファースト**: 接頭辞無しが「全幅（スマホ含む）」、`md:`は「中サイズ以上で上書き」。

ブレークポイントの目安:
- `sm:` = 640px〜
- `md:` = 768px〜
- `lg:` = 1024px〜
- `xl:` = 1280px〜

```tsx
// src/lessons/TailwindResponsive.tsx
export function TailwindResponsive() {
  return (
    <div className="p-8">
      {/* スマホでは1列、md以上で2列、lg以上で3列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-teal-200 p-6 rounded">A</div>
        <div className="bg-teal-200 p-6 rounded">B</div>
        <div className="bg-teal-200 p-6 rounded">C</div>
      </div>

      {/* 文字サイズも画面で変える */}
      <p className="mt-6 text-base md:text-xl lg:text-3xl">
        画面幅を変えると、この文字サイズが変わります。
      </p>
    </div>
  )
}
```

`App.tsx` で表示して（第1章の要領）、**ブラウザの幅を狭めたり広げたり**してください。列数と文字サイズが段階的に変わります。これがインラインstyleでは絶対にできなかったことです。

> 読み方の練習: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` は「基本1列、768px以上で2列、1024px以上で3列」と左から右へ「広くなるほど上書き」と読みます。

### 8-3. ダークモード

`dark:` 接頭辞で「ダークモード時のスタイル」を書けます。Tailwind v4 の既定は「OSの設定（`prefers-color-scheme`）に追従」です。

```tsx
// src/lessons/TailwindDark.tsx
export function TailwindDark() {
  return (
    <div className="min-h-screen p-8 bg-white text-gray-900
                    dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold">ダークモード対応</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        OSの外観設定をダークにすると、背景と文字色が反転します。
      </p>
      <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
        カードもダーク対応。
      </div>
    </div>
  )
}
```

`App.tsx` で表示し、**OS（Mac: システム設定 > 外観）をダークに切り替えて**確認してください。各要素に `dark:` 版を書いておくだけで対応できます。

> （ボタンでトグルしたい場合は「クラス戦略」への切り替えが必要です。まずはOS追従で仕組みを理解すれば十分です。）

> ✅ **第8章のまとめ**: `hover: focus: disabled:`（状態）、`sm: md: lg:`（画面幅・モバイルファースト）、`dark:`（ダーク）。**接頭辞を重ねるだけ**で条件付きスタイルが書ける。`transition` を忘れずに。

---

## 第9章 Tailwind のカスタマイズ（デザイントークンと @theme）

「`blue-600`じゃなくて、自社ブランドの色を`brand`という名前で使いたい」——こういうときが来ます。Tailwind v4 では **CSSの中で `@theme`** を使ってデザイントークン（色・フォント・間隔などの定義）を増やします。`tailwind.config.js` は不要です。

### 9-1. ブランドカラーを足す

`src/index.css` を開き、`@import "tailwindcss";` の **下** に書きます。

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* --color-{名前} の形で定義すると、bg-{名前} / text-{名前} が自動で使える */
  --color-brand: #6d28d9;
  --color-brand-light: #a78bfa;
  --color-brand-dark: #4c1d95;

  /* 独自フォントや独自ブレークポイントも足せる */
  --font-display: "Georgia", serif;
}
```

これで `bg-brand` `text-brand` `border-brand-dark` `font-display` などが使えるようになります。確認:

```tsx
// src/lessons/TailwindTheme.tsx
export function TailwindTheme() {
  return (
    <div className="p-8 space-y-4">
      <button className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark">
        ブランドカラーのボタン
      </button>
      <p className="text-brand-light font-display text-2xl">
        独自フォント(display)とブランド明色の見出し
      </p>
    </div>
  )
}
```

`App.tsx` で表示して確認。`@theme` で定義した変数が、そのまま `bg-*` `text-*` のクラスに化けるのがポイントです。**「デザイントークンを一元管理し、ユーティリティとして配る」**——これがTailwindの設計思想の核です。

### 9-2. たまにしか無い値: 任意の値（arbitrary values）

「どうしても`top: 117px`にしたい」のような一点物は、角カッコで直接書けます。多用は禁物（一貫性が崩れるため）ですが、逃げ道として知っておくと便利。

```tsx
<div className="mt-[117px] text-[#ff00aa] w-[33.3%]">
  任意の値。普段は使わず、本当に必要なときだけ。
</div>
```

> ✅ **第9章のまとめ**: v4のカスタマイズはCSSの`@theme`で行う。`--color-brand: ...`と定義すれば`bg-brand`等が生える。一点物は`[...]`で書けるが乱用しない。

---

## 第10章 Tailwind の「クラス地獄」問題と向き合う

Tailwindを使うと、必ずこの悩みに当たります: **「同じボタンを何箇所にも書くと、長いクラス列をコピペすることになる。重複が辛い。」**

第5章で見たこの行を、アプリ中に20回コピペしたくはないですよね:

```html
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
```

解決策は2つあり、**1つ目が圧倒的に推奨**です。

### 10-1. 【推奨】コンポーネントに切り出す

Reactなのだから、繰り返す見た目は**コンポーネントにする**のが王道です。クラス列は1箇所だけに書きます。

> 📁 **あなたが作るファイル**: `src/components/Button.tsx`

```tsx
// src/components/Button.tsx
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const base =
    'px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  }
  // 基本クラス + variantのクラス + 呼び出し側が足したクラス
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />
}
```

使う側:

```tsx
import { Button } from '../components/Button'

export function ButtonDemo() {
  return (
    <div className="p-8 flex gap-3">
      <Button>主ボタン</Button>
      <Button variant="secondary">副ボタン</Button>
      <Button disabled>無効</Button>
      <Button className="w-full">幅いっぱい(classNameで追加)</Button>
    </div>
  )
}
```

クラス列は`Button.tsx`の1箇所だけ。呼び出し側は`<Button>`と書くだけ。これがReact + Tailwindの基本戦略です。

### 10-2. クラス結合を綺麗にする clsx（任意）

文字列を `${...} ${...}` で連結すると、条件付きクラスのときに読みにくくなります。`clsx`（または`classnames`）という小さなライブラリを使うと綺麗になります。

```bash
npm install clsx
```

```tsx
import clsx from 'clsx'

function Tag({ active }: { active: boolean }) {
  return (
    <span
      className={clsx(
        'px-2 py-1 rounded text-sm',     // 常に効く
        active && 'bg-blue-600 text-white', // activeのときだけ
        !active && 'bg-gray-200 text-gray-700',
      )}
    >
      タグ
    </span>
  )
}
```

`clsx`は「falsyな値を無視して、truthyなものだけ繋ぐ」ので、`active && '...'` のような条件をそのまま書けます。

> （発展: Tailwindのクラス衝突を賢くマージする `tailwind-merge`、`variant`設計を型安全にする `cva`/`tailwind-variants` といった道具もありますが、まずは「コンポーネント化 + clsx」で十分戦えます。）

### 10-3. 【非推奨寄り】@apply でCSS側にまとめる

CSSの中で `@apply` を使うと、複数のユーティリティを1つのクラスにまとめられます。

```css
/* src/index.css */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700;
}
```

```tsx
<button className="btn-primary">ボタン</button>
```

一見きれいですが、Tailwind公式は **多用を勧めていません**。理由は「結局また独自クラス名を命名・管理することになり、グローバルCSSの問題（第2章）が戻ってくる」から。Reactなら10-1のコンポーネント化が上位互換です。`@apply`は「JSXを使えない場面」など限定的に。

> ✅ **第10章のまとめ**: 重複は **コンポーネント化**で解決（`@apply`ではなく）。条件付きクラスは `clsx`。呼び出し側からの拡張は `className` propを受け取って末尾に連結。

---

## 第11章 Modern CSS — Tailwind の下で動いている現代の CSS

Tailwindは便利ですが、**それ自体が魔法ではありません**。Tailwindのクラスは、結局「現代のCSS機能」に変換されているだけです。エンジニアとして、その土台の **Modern CSS** を知っておくと、Tailwindで詰まったときも自力で解決できます。

ここでは、moderncss.dev や CSS-Tricks が「もう古いハックは要らない」と紹介している、**今使うべきネイティブCSS機能** を、Tailwindとの対応とともに紹介します。

### 11-1. カスタムプロパティ（CSS変数）

`--名前: 値;` で変数を定義し、`var(--名前)` で使います。**第9章の`@theme`の正体がこれ**です（TailwindのトークンはCSS変数として吐き出されます）。

```css
:root {
  --gap: 16px;
  --brand: #6d28d9;
}
.box {
  padding: var(--gap);
  background: var(--brand);
}
```

JSから動的に変えられるのが強力で、テーマ切り替えやアニメーションの土台になります。

```tsx
// JSで変数を上書きする例
<div style={{ ['--brand' as string]: '#16a34a' }} className="...">...</div>
```

### 11-2. clamp() — 流体タイポグラフィ

`clamp(最小, 推奨, 最大)` は「画面に応じて滑らかに変化するが、上限・下限は超えない」値を作ります。メディアクエリでカクカク切り替える代わりに、**連続的に**変化させられます。

```css
.title {
  /* 最小1.5rem、画面幅5vwに比例、最大3rem */
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

これを試すページを作ってみましょう（Tailwindの任意値`text-[...]`で`clamp`も書けます）。

```tsx
// src/lessons/ModernCssLesson.tsx
export function ModernCssLesson() {
  return (
    <div className="p-8 space-y-12">
      <section>
        <h2 className="text-xl font-bold mb-2">clamp() 流体タイポ</h2>
        {/* 任意値でclampを指定。ブラウザ幅を変えると滑らかに変化 */}
        <p className="text-[clamp(1.5rem,5vw,3rem)] font-bold">
          幅を変えると滑らかに伸縮する見出し
        </p>
      </section>
      {/* 以降の節をここに足していきます */}
    </div>
  )
}
```

`App.tsx` で表示し、ブラウザ幅をぐりぐり変えて、文字が**段階的でなく連続的に**変わるのを観察してください。

### 11-3. Container Queries — 「画面」でなく「親の幅」で変える

メディアクエリ(`md:`等)は **画面（ビューポート）の幅** を見ます。でも本当は「このカードが置かれた**親要素**が狭いか広いか」で出し分けたいことが多い。それを実現するのが **コンテナクエリ** です。コンポーネント指向のレイアウトの決定打で、近年の主役級の機能です。

Tailwindでは `@container` を親に付け、子で `@sm: @md:` のような接頭辞を使います。

```tsx
<section>
  <h2 className="text-xl font-bold mb-2">Container Query</h2>
  {/* この親の幅を基準にする */}
  <div className="@container border rounded-lg p-4 resize-x overflow-auto max-w-full">
    {/* 親が広いときだけ横並びにする（画面でなく親基準！） */}
    <div className="flex flex-col @md:flex-row gap-4">
      <div className="bg-rose-200 p-4 rounded flex-1">A</div>
      <div className="bg-rose-200 p-4 rounded flex-1">B</div>
    </div>
  </div>
</section>
```

> ポイント: `md:flex-row`（画面基準）と `@md:flex-row`（**親コンテナ基準**）の違いを噛みしめてください。`@container`を付けた要素が「測る基準」になります。同じカードをサイドバーにもメイン領域にも置けて、それぞれの**置かれた幅**に応じて自動で形が変わる——これがコンテナクエリの威力です。

### 11-4. :has() — 「親を子の状態で選ぶ」関係セレクタ

長年CSSには「親セレクタ」がありませんでした。`:has()` がそれを解決します。「**ある子を持つ親**」を選べます。

```css
/* チェックされたチェックボックスを"含む"ラベルの背景を変える */
label:has(input:checked) {
  background: #dcfce7;
}

/* 画像を含むカードだけ余白を変える、なども可能 */
.card:has(img) { padding-top: 0; }
```

Tailwindでも `has-[...]` で書けます:

```tsx
<label className="flex gap-2 p-3 rounded border has-[:checked]:bg-green-100">
  <input type="checkbox" />
  チェックすると、この行(親)の背景が変わる
</label>
```

これも `ModernCssLesson` に足して、チェックを入れたら**親の行**の色が変わるのを確認してください。`:has()`は「フォームの状態に応じてUIを変える」場面で劇的に便利です。

### 11-5. :is() / :where() — セレクタをまとめる

長いセレクタの列挙を短くします。違いは **詳細度（specificity）**: `:is()`は中の最強の詳細度を持ち、`:where()`は詳細度0（上書きしやすい）。

```css
/* before */
header h1, header h2, header h3 { margin: 0; }
/* after */
header :is(h1, h2, h3) { margin: 0; }

/* リセットCSSは上書きされやすいよう :where() を使うと良い */
:where(ul, ol) { list-style: none; }
```

### 11-6. ネスト（Nesting）

Sass無しで、ネイティブCSSがネストに対応しました。

```css
.card {
  padding: 16px;
  & .title { font-weight: bold; }   /* .card .title */
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); } /* .card:hover */
}
```

### 11-7. 論理プロパティ（Logical Properties）— 国際化対応

`left/right` の代わりに `inline-start/inline-end`、`margin-left` の代わりに `margin-inline-start` を使うと、**文章の書字方向（左→右 / 右→左のアラビア語等）に自動で追従**します。Tailwindの `ms-4`(margin-inline-start) `me-4`(margin-inline-end) `ps-4` `pe-4` がこれに対応します。

```tsx
{/* 英語(LTR)では左余白、アラビア語(RTL)では右余白になる */}
<p className="ms-4">論理プロパティで余白</p>
```

### 11-8. その他: cascade layers / subgrid / 新しい色関数

- **`@layer`（カスケードレイヤー）**: CSSの優先順位を「レイヤー」で明示的に管理する仕組み。Tailwind自身も内部で`base / components / utilities`のレイヤーを使っています。「自分のCSSがTailwindに負ける/勝ちすぎる」問題を整理できます。
- **subgrid**: 入れ子のgridが親のgridの線に揃えられる機能。
- **`oklch()` などの新色関数**: Tailwind v4 のデフォルトカラーは、より鮮やかで知覚的に均一な `oklch` で定義されています（第6章の`@theme`例で見た`oklch(...)`がそれ）。

> ✅ **第11章のまとめ**: Tailwindのクラスは、ここで挙げた **ネイティブModern CSS** へと変換されている。`clamp()`(流体), コンテナクエリ(`@container`/`@md:`), `:has()`(親選択), 論理プロパティ(`ms/me`), カスタムプロパティ(`@theme`の正体) は、Tailwindユーザーでも直接知っておく価値が高い。

---

## 第12章 実践: 自作 API + fetch + Tailwind でカード一覧を作る

総仕上げです。ここまでの全部（Reactのデータ取得 + Tailwind + レスポンシブ + 状態）を使い、**バックエンドAPIを自作**して、そこから取得したデータをカード一覧で表示します。

> 要件どおり、**テンプレート/スキャフォルドは使いません**。`create-xxx`系も、Expressのジェネレータも使わず、**素のNodeでHTTPサーバを手書き**してJSON APIを作ります。フロントはハードコードの配列ではなく、その**APIから`fetch`**します。

### 12-1. バックエンドAPIを手書きする（依存ゼロ）

Node.js標準の`http`モジュールだけでAPIを書きます。追加インストールは一切不要です。プロジェクト直下に `server/` フォルダを作ります。

> 📁 **あなたが作るファイル**: `server/api.mjs`

```js
// server/api.mjs
// Node標準のhttpモジュールだけで書く、依存ゼロのJSON API。
// フレームワークもテンプレートも使っていません。
import { createServer } from 'node:http'

// 本来はDBから取るデータ。ここではサーバ側のメモリに持つ。
const products = [
  { id: 1, name: 'メカニカルキーボード', price: 14800, tag: '人気',   stock: 12 },
  { id: 2, name: 'ワイヤレスマウス',     price: 4980,  tag: 'NEW',    stock: 0  },
  { id: 3, name: '4K モニター 27inch',   price: 39800, tag: 'セール', stock: 5  },
  { id: 4, name: 'USB-C ハブ',          price: 3280,  tag: '',       stock: 30 },
  { id: 5, name: 'ノートPCスタンド',     price: 2580,  tag: '人気',   stock: 8  },
  { id: 6, name: 'Webカメラ 1080p',     price: 6480,  tag: 'NEW',    stock: 0  },
]

const server = createServer((req, res) => {
  // CORS: Viteの開発サーバ(別ポート)からアクセスできるように許可する
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  // プリフライト(OPTIONS)に応答
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // ルーティング: GET /api/products → 一覧を返す
  if (req.method === 'GET' && req.url === '/api/products') {
    res.writeHead(200)
    res.end(JSON.stringify(products))
    return
  }

  // それ以外は404
  res.writeHead(404)
  res.end(JSON.stringify({ message: 'Not Found' }))
})

const PORT = 8787
server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
```

起動します（**フロントの`npm run dev`とは別のターミナル**で）:

```bash
node server/api.mjs
```

別ターミナルで動作確認:

```bash
curl http://localhost:8787/api/products
```

商品のJSON配列が返ってくればAPIは完成です。これがあなたの自作バックエンドです。

> 補足: 「npmスクリプトにしたい」場合は `package.json` の `scripts` に `"api": "node server/api.mjs"` を足すと `npm run api` で起動できます（任意）。

### 12-2. フロントから fetch する（ローディング/エラーも扱う）

次に、Reactからこの API を叩いて表示します。実務で必須の「ローディング中」「エラー時」も最初から作り込みます。

> 📁 **あなたが作るファイル**: `src/lessons/ProductList.tsx`

```tsx
// src/lessons/ProductList.tsx
import { useEffect, useState } from 'react'

// APIのレスポンスに対応する型を定義しておく（TypeScriptの恩恵）
type Product = {
  id: number
  name: string
  price: number
  tag: string
  stock: number
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 自作APIからデータ取得
    fetch('http://localhost:8787/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Product[]) => setProducts(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // --- ローディング表示 ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        読み込み中…
      </div>
    )
  }

  // --- エラー表示 ---
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-6">
          <p className="font-bold">読み込みに失敗しました</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2 text-red-500">
            APIサーバ(node server/api.mjs)は起動していますか？
          </p>
        </div>
      </div>
    )
  }

  // --- 本体 ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        商品一覧
      </h1>

      {/* レスポンシブなカードグリッド: スマホ1列 / md2列 / lg3列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}

// カード1枚を独立コンポーネントに（第10章の「重複はコンポーネント化」）
function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock === 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg
                    transition border border-gray-100 dark:border-gray-700 p-5
                    flex flex-col gap-3">
      {/* 上段: タグと在庫バッジ */}
      <div className="flex items-center justify-between">
        {product.tag ? (
          <span className="text-xs font-bold px-2 py-1 rounded-full
                           bg-blue-100 text-blue-700">
            {product.tag}
          </span>
        ) : (
          <span /> /* タグ無しでもレイアウトを保つための空要素 */
        )}

        <span
          className={
            soldOut
              ? 'text-xs font-bold px-2 py-1 rounded-full bg-gray-200 text-gray-500'
              : 'text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700'
          }
        >
          {soldOut ? '在庫切れ' : `在庫 ${product.stock}`}
        </span>
      </div>

      {/* 商品名 */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {product.name}
      </h2>

      {/* 価格 */}
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        ¥{product.price.toLocaleString()}
      </p>

      {/* ボタン: 在庫切れなら無効化 */}
      <button
        disabled={soldOut}
        className="mt-auto px-4 py-2 rounded-lg font-medium transition
                   bg-blue-600 text-white hover:bg-blue-700
                   disabled:bg-gray-300 disabled:text-gray-500
                   disabled:cursor-not-allowed"
      >
        {soldOut ? '入荷待ち' : 'カートに追加'}
      </button>
    </div>
  )
}
```

`App.tsx` でこのコンポーネントを表示します（第1章の要領で、既存をコメントアウトして差し替え）。

```tsx
// src/App.tsx
import { ProductList } from './lessons/ProductList'

export default function App() {
  return <ProductList />
}
```

### 12-3. 動かす

ターミナルを2つ使います。

```bash
# ターミナル1: 自作API
node server/api.mjs

# ターミナル2: フロント
npm run dev
```

`http://localhost:5173` を開くと:

- 一瞬「読み込み中…」が出て、
- APIから取得した商品がカードで並び、
- 画面幅で列数が変わり（レスポンシブ）、
- カードにホバーすると影が濃くなり（状態）、
- 在庫0の商品はボタンが無効化され、バッジが灰色になり、
- OSをダークにすればダーク配色になる。

ここまでの全章の知識が1画面に集約されています。

### 12-4. 自分で改造してみる（理解度チェック）

手を動かして理解を確かめましょう。ヒントだけ置いておきます。

1. **API側**: `server/api.mjs` の `products` 配列に商品を1つ足す → リロードでカードが増える（フロントは無修正でよい。データ駆動の利点）。
2. **API側**: `GET /api/products?tag=NEW` のときだけ`tag === 'NEW'`の商品に絞る、を実装してみる（`new URL(req.url, 'http://x').searchParams`が使える）。
3. **フロント側**: 価格で並べ替えるボタンを足す（`useState`で並び順を持ち、`[...products].sort(...)`）。
4. **フロント側**: `ProductCard`を`src/components/`に移して、`ProductList`から使う形に整理する。

> ✅ **第12章のまとめ**: 素のNode `http`でフレームワーク無しのJSON APIを自作 → React + `fetch` + `useEffect`で取得（loading/error含む）→ Tailwindでレスポンシブ・状態・ダーク対応のカードUIに。これが実務の最小ループです。

---

## 第13章 まとめとチートシート

### 13-1. 手法の選び方（2026年の現実解）

- **新規Reactアプリ**: まず **Tailwind CSS**。一貫性・未使用CSS削除・削除安全性で総合力が高い。
- **小規模/学習/補助**: インラインや普通のCSSで十分なことも多い。
- **既存の大規模で命名規律がある**: CSS Modules は手堅い。
- **CSS-in-JS（styled-components等）**: 既存資産がある、または強い動的スタイルが要るなら。ただし新規でのゼロランタイム化やTailwindへの移行が増えている。
- **どの手法でも、土台のModern CSS（`clamp`/コンテナクエリ/`:has()`/カスタムプロパティ）は知っておく**と強い。

### 13-2. Tailwind クラス・チートシート

| やりたいこと | クラス |
|---|---|
| 内側余白 | `p-4`(全) `px-4`(左右) `py-2`(上下) `pt-/pr-/pb-/pl-` |
| 外側余白 | `m-4` `mx-auto`(横中央) `mt-2` … |
| 子要素の間隔 | `gap-4`（flex/grid内） `space-y-4`（縦並び） |
| 背景/文字色 | `bg-blue-600` `text-gray-700`（50〜950） |
| 文字 | `text-xl` `font-bold` `leading-relaxed` `text-center` |
| 装飾 | `rounded-lg` `shadow-md` `border border-gray-300` |
| 横並び中央 | `flex items-center justify-center` |
| 両端寄せ | `flex justify-between items-center` |
| カード並べ | `grid grid-cols-3 gap-4` |
| 状態 | `hover:` `focus:` `active:` `disabled:` （+ `transition`） |
| レスポンシブ | `sm: md: lg: xl:`（モバイルファースト＝広い方を上書き） |
| ダーク | `dark:bg-gray-900` |
| 親基準レスポンシブ | 親に`@container`、子に`@md:` |
| 一点物の値 | `mt-[117px]` `text-[#ff00aa]` |
| トークン追加 | `src/index.css`の`@theme { --color-brand: ...; }` |

### 13-3. 作ったファイル一覧（振り返り）

- `src/lessons/InlineStyleLesson.tsx` … インライン
- `src/lessons/GlobalCssLesson.tsx` + `.css` … グローバルCSSと衝突問題
- `src/lessons/ModuleLesson.tsx` + `.module.css` … CSS Modules
- `src/lessons/CssInJsLesson.tsx` … CSS-in-JSの考え方
- `src/lessons/TailwindHello.tsx` … 導入確認
- `src/lessons/TailwindBasics.tsx` … 基本ユーティリティ
- `src/lessons/TailwindStates.tsx` / `TailwindResponsive.tsx` / `TailwindDark.tsx` … 状態/レスポンシブ/ダーク
- `src/lessons/TailwindTheme.tsx` … カスタマイズ
- `src/components/Button.tsx` … 重複をコンポーネント化
- `src/lessons/ModernCssLesson.tsx` … Modern CSS
- `server/api.mjs` … 自作APIサーバ（依存ゼロ）
- `src/lessons/ProductList.tsx` … 総仕上げ（API + fetch + Tailwind）

### 13-4. 次の一歩

- **tailwind-merge / cva（class-variance-authority）**: variant設計を型安全かつ衝突安全に。
- **shadcn/ui**: TailwindベースのコピペできるUIコンポーネント集。実務で人気。
- **コンテナクエリ中心の設計**: ビューポートでなく親基準のレイアウトに慣れる。
- **アクセシビリティ**: `focus:ring`、適切なコントラスト比、セマンティックなHTML。Tailwindは見た目を整えるが、正しいHTML構造はあなたの責任。

---

おつかれさまでした。ここまで通して書けば、「Reactでスタイルをどう当てるか」を**手法の歴史と理由ごと**理解し、Tailwindで実務レベルのUIを、自作APIのデータに対して組める状態になっています。
