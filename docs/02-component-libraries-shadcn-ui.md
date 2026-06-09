# React コンポーネントライブラリ徹底入門 — MUI / HeroUI / そして shadcn/ui

> この1ファイルだけを **上から順に読みながら、自分の手でコードを書いていけば** 、
> 「Reactのコンポーネントライブラリとは何か」「なぜ shadcn/ui がこれほど流行したのか」「どう使い、どうカスタマイズするのか」が一通り身につくように作っています。
>
> - 教材（解説）とコードは **分離していません** 。読み進める流れの中でコードが出てきます。
> - **簡単なものから順番に** 難しくしていきます。
> - 最後に、**バックエンドAPIを自作**して、そのデータを shadcn/ui のコンポーネントで表示する実践課題まで行きます（テンプレ・スキャフォルドは使わず、素のNodeでAPIを書きます）。
>
> 前提: このリポジトリは既に **Vite + React 19 + TypeScript + Tailwind CSS v4** がセットアップ済みです（`docs/01-react-styling-tailwind-moderncss.md` で導入済み。`package.json` に `tailwindcss` / `@tailwindcss/vite`、`vite.config.ts` に `tailwindcss()`、`src/index.css` に `@import 'tailwindcss';` がある状態）。まだの人は先にそちらを終えてください。shadcn/ui は **Tailwind が前提** だからです。
>
> 想定読者: Reactは触れる。Tailwindも基礎は分かる。「UIライブラリって結局どれを使えばいいの? shadcnってよく聞くけど何が違うの?」という人。

---

## 目次

- [第0章 全体像 — そもそも「コンポーネントライブラリ」とは何か](#第0章-全体像--そもそもコンポーネントライブラリとは何か)
- [第1章 まず手作りで「アクセシブルなコンポーネント」の大変さを知る](#第1章-まず手作りでアクセシブルなコンポーネントの大変さを知る)
- [第2章 従来型ライブラリの代表 MUI（Material UI）の考え方](#第2章-従来型ライブラリの代表-muimaterial-ui-の考え方)
- [第3章 Tailwindネイティブな従来型 HeroUI（旧 NextUI）](#第3章-tailwindネイティブな従来型-heroui旧-nextui)
- [第4章 shadcn/ui の核心 — 「ライブラリではない」とはどういう意味か](#第4章-shadcnui-の核心--ライブラリではないとはどういう意味か)
- [第5章 shadcn/ui を支える4つの道具を、手で再現して理解する](#第5章-shadcnui-を支える4つの道具を手で再現して理解する)
- [第6章 shadcn/ui をこのプロジェクトに導入する](#第6章-shadcnui-をこのプロジェクトに導入する)
- [第7章 最初のコンポーネントを add して中身を読む](#第7章-最初のコンポーネントを-add-して中身を読む)
- [第8章 コンポーネントを「所有」してカスタマイズする](#第8章-コンポーネントを所有してカスタマイズする)
- [第9章 テーマとダークモード（CSS変数の仕組み）](#第9章-テーマとダークモードcss変数の仕組み)
- [第10章 実用コンポーネントを組み合わせる（Dialog / Input / Form）](#第10章-実用コンポーネントを組み合わせるdialog--input--form)
- [第11章 実践: 自作API + shadcn/ui で商品管理画面を作る](#第11章-実践-自作api--shadcnui-で商品管理画面を作る)
- [第12章 まとめ・選定基準・チートシート](#第12章-まとめ選定基準チートシート)

---

## 第0章 全体像 — そもそも「コンポーネントライブラリ」とは何か

ボタン、入力欄、モーダル（ダイアログ）、ドロップダウン、トースト通知……。どんなWebアプリにも必ず出てくるこれらの部品を、**毎回ゼロから作るのは時間の無駄**です。しかも「正しく」作るのは、見た目以上に難しい（次章で痛感します）。

そこで「よく使う部品を、見た目もアクセシビリティも整えた状態であらかじめ用意しておくよ」というのが **コンポーネントライブラリ** です。

### 0-1. 大きく2つの流派がある

ここが本ドキュメントで一番大事な地図です。コンポーネントライブラリは、提供のされ方で大きく2つに分かれます。

| 流派 | 入手方法 | コードの所有者 | 代表 |
|------|---------|--------------|------|
| **A: 従来型（npmパッケージ型）** | `npm install` して `import` | ライブラリ作者（あなたは使うだけ） | MUI, Chakra UI, Ant Design, HeroUI |
| **B: コピー型（ソース配布型）** | CLIでソースを **自分のリポジトリにコピー** | **あなた**（コードが手元に来る） | **shadcn/ui** |

**A（従来型）** は、`node_modules` の中にコンポーネントの実体があり、あなたはそれを `import` して使います。便利ですが、中身は「ブラックボックス」。細かくカスタマイズしたいとき、`!important` で無理やり上書きしたり、ラッパーコンポーネントで包んだり、という戦いが発生しがちです。

**B（コピー型 = shadcn/ui）** は発想が逆です。コンポーネントの **ソースコードそのものを、あなたのプロジェクトの中にコピー** します。`node_modules` ではなく、`src/components/ui/button.tsx` のような **あなたのファイル** として置かれます。だから中身は全部読めるし、好きなだけ書き換えられる。これが shadcn/ui の革命でした。

公式が掲げる象徴的な一文があります:

> **「This is not a component library. It is how you build your component library.」**
> （これはコンポーネントライブラリではない。あなたが自分のコンポーネントライブラリを作るための方法だ。）

### 0-2. この教材の進め方

「いきなりshadcnを使う」と、ありがたみが分かりません。だから順番にいきます。

1. **第1章**: アクセシブルな部品を手作りしてみて、「自前は無理だ」と実感する。
2. **第2〜3章**: 従来型（MUI / HeroUI）の考え方を知る（概念中心。インストールはしません）。
3. **第4〜5章**: shadcnの思想と、それを支える道具（Radix / cva / clsx / tailwind-merge）を理解する。
4. **第6章以降**: 実際にこのプロジェクトに導入して、手を動かす。

それでは、まず「コンポーネントを正しく作るのは大変だ」を体験するところから。

---

## 第1章 まず手作りで「アクセシブルなコンポーネント」の大変さを知る

「ボタンなんて `<button>` でいいじゃん」——その通りです。`<button>` は偉い。最初から、Enterキーやスペースキーで押せて、Tabでフォーカスでき、スクリーンリーダーが「ボタン」と読んでくれます。これを **アクセシビリティ（a11y）** と言います。

問題は、HTMLに **存在しない部品** を作るときです。たとえば「モーダルダイアログ」。HTMLの素のタグだけでこれを「正しく」作ろうとすると、地獄を見ます。

### 1-1. 素朴なモーダルを作ってみる

学習用に1ファイル作ります。第1ドキュメントと同じく、表示は `src/App.tsx` で切り替える運用です（`main.tsx` は `<App />` を描画するだけ）。

> 📁 **あなたが作るファイル**: `src/lessons/11-shadcn/NaiveModal.tsx`

```tsx
// src/lessons/11-shadcn/NaiveModal.tsx
import { useState } from 'react'

export function NaiveModal() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-8">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setOpen(true)}
      >
        モーダルを開く
      </button>

      {open && (
        // 背景の黒いオーバーレイ
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* 中身。クリックが背景に伝播して閉じないよう stopPropagation */}
          <div
            className="bg-white rounded-lg p-6 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">確認</h2>
            <p className="mt-2 text-gray-600">本当に削除しますか？</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1" onClick={() => setOpen(false)}>
                キャンセル
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded">
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

`src/App.tsx` でこれを表示してください（第1ドキュメントの要領。既存の描画をコメントアウトして `<NaiveModal />` に差し替え）。動きます。一見、完成して見えます。

### 1-2. でも、これは「壊れている」

このモーダル、見た目は動きますが、アクセシビリティ的には欠陥だらけです。試してみてください:

- **Escキーで閉じない**（普通モーダルはEscで閉じられるべき）。
- **開いてもフォーカスがモーダルに移らない**。Tabキーを押すと、モーダルの後ろにある要素にフォーカスが飛んでいってしまう（**フォーカストラップ**が無い）。
- **スクリーンリーダーが「ダイアログが開いた」と認識しない**（`role="dialog"` や `aria-modal` が無い）。
- 閉じたあと、**フォーカスが元のボタンに戻らない**。
- 背景のスクロールが止まらない。

これらを「全部」正しく実装するのは、本当に大変です。WAI-ARIAの仕様を読み込み、キーボード操作、フォーカス管理、`aria-*` 属性を漏れなく書く必要があります。ドロップダウン、コンボボックス、タブ、ツールチップ……部品ごとに、こういう「見えない正しさ」の実装が必要です。

### 1-3. だからライブラリを使う

ここで結論。**「見た目」より「正しい振る舞い（アクセシビリティ・キーボード操作）」の方が、自前実装は圧倒的に難しい。** コンポーネントライブラリの本当の価値は、見た目よりむしろ **この見えない部分を肩代わりしてくれる** ことにあります。

- 従来型（MUI等）は、見た目も振る舞いも込みで提供。
- shadcn/ui は、**振る舞いの部分を Radix UI という専門ライブラリに任せ**、見た目だけ Tailwind で自分が持つ、という分担をします（第4章で詳述）。

「自前は無理」が腹落ちしたところで、まず従来型ライブラリがどういうものかを見ましょう。

> ✅ **第1章のまとめ**: コンポーネントの難所は見た目でなく「アクセシビリティ・キーボード操作・フォーカス管理」。だからライブラリを使う。素朴な自作モーダルは、たいてい壊れている。

---

## 第2章 従来型ライブラリの代表 MUI（Material UI）の考え方

> ⚠️ この章はMUIを **インストールしません**。「従来型はこういう世界観」という理解が目的です。

**MUI（Material UI）** は、Reactで最も広く使われてきたコンポーネントライブラリの一つ。GoogleのデザインガイドラインであるMaterial Designを実装しています。Spotify, Netflix, Amazonなど大企業の採用例も多い、成熟したライブラリです。

### 2-1. 使い方のイメージ

MUIは「**npm install して import するだけ**」の典型です。

```tsx
// ※イメージ。このプロジェクトでは動かしません
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

function App() {
  return (
    <div>
      <Button variant="contained">送信</Button>
      <TextField label="名前" variant="outlined" />
    </div>
  )
}
```

`variant="contained"` のように **propsで見た目を指定** します。CSSを書かなくても、それなりに整ったMaterial Designの見た目が出ます。これが従来型の手軽さです。

### 2-2. テーマとスタイリング

MUIは内部で **CSS-in-JS（Emotion）** を使っています（第1ドキュメント第4章で触れたあれです）。テーマは `ThemeProvider` で一元管理し、`sx` というpropで個別の微調整をします。

```tsx
// ※イメージ
<Button sx={{ mt: 2, backgroundColor: 'tomato' }}>ボタン</Button>
```

### 2-3. MUIのエコシステム（押さえておくと良い）

MUIは単一ライブラリでなく、いくつかの製品群です。

- **Material UI**: Material Designの実装（一番有名なやつ）。
- **Joy UI**: MUI独自デザインのコンポーネント。
- **Base UI**: **スタイルの無い**（unstyled）、アクセシビリティだけ持つ素の部品。← この発想は後述のRadixと同じ系統。
- **MUI X**: データグリッド・日付ピッカーなど高機能（一部有料）。

### 2-4. 従来型の長所と短所

**長所:**
- インストールが一発。学習すれば爆速で組める。
- 複雑な部品（データグリッド等）まで「全部入り」。
- 成熟していて情報も多い。

**短所:**
- **カスタマイズが効きにくい場面がある**。「Material Designの匂い」を消したい、細部を独自に変えたい、というときに `sx` やテーマ override、ときには `!important` との戦いになる。
- どのサイトも「MUIっぽい見た目」になりがち（没個性）。
- バンドルサイズが大きめ（Material UIで90kb前後と言われる）。
- ブラックボックス: 中の実装は基本いじれない。

> エンジニアとして知っておくべき対立軸: **「手軽さ・全部入り（MUI）」 vs 「所有・自由（shadcn）」**。どちらが正しいではなく、プロジェクトの性格で選びます（第12章で整理）。

> ✅ **第2章のまとめ**: MUIは「npm installしてpropsで使う」従来型の代表。手軽で全部入りだが、深いカスタマイズと没個性が弱点。CSS-in-JS（Emotion）ベース。

---

## 第3章 Tailwindネイティブな従来型 HeroUI（旧 NextUI）

> ⚠️ この章もインストールしません。位置づけの理解が目的です。

**HeroUI**（2024年に NextUI から改名）は、「**従来型（npm install型）だけど、見た目はTailwind CSSで作られている**」というライブラリです。MUIとshadcnの中間のような立ち位置で理解すると分かりやすい。

### 3-1. 特徴

- **Tailwind CSS v4** ベースでスタイリングされている（MUIのCSS-in-JSとは違う）。
- アクセシビリティの土台に **React Aria**（Adobe製の堅牢なa11yライブラリ）を採用。
- 提供形態は **従来型**（`npm install @heroui/react` して `import`）。コードは手元には来ない。

```tsx
// ※イメージ
import { Button } from '@heroui/react'

function App() {
  return <Button color="primary">ボタン</Button>
}
```

公式は自身を「**MUI / Chakra UI / shadcn/ui に代わるモダンな選択肢**」と位置づけています。

### 3-2. 3者の関係を1枚に

ここまでで主要3者が出そろいました。座標を持っておきましょう。

| | スタイリング | a11yの土台 | 提供形態 | コード所有 |
|---|---|---|---|---|
| **MUI** | CSS-in-JS (Emotion) | 自前 | npm install | ❌ |
| **HeroUI** | Tailwind CSS | React Aria | npm install | ❌ |
| **shadcn/ui** | Tailwind CSS | **Radix UI** | **CLIでコピー** | ✅ **あなた** |

「TailwindベースでもHeroUIは従来型（コードは手元に来ない）」「shadcnだけがコピー型」——この違いが、次章からの主役 shadcn/ui の核心です。

> ✅ **第3章のまとめ**: HeroUIは「Tailwind製だが従来型（install型）」。shadcnとの決定的な差は『コードを所有するかどうか』。

---

## 第4章 shadcn/ui の核心 — 「ライブラリではない」とはどういう意味か

いよいよ本丸です。第0章の一文を再掲します。

> **「This is not a component library. It is how you build your component library.」**

### 4-1. 何が起きるのか（具体的な体験）

shadcn/ui で、たとえばボタンを使いたいとき、あなたはこう打ちます:

```bash
npx shadcn@latest add button
```

すると `node_modules` には何も増えません。代わりに、あなたのリポジトリに **`src/components/ui/button.tsx` というファイルが生成されます**。中を開くと、ボタンの実装コードがそのまま書いてある。あなたはそれを `import` して使います:

```tsx
import { Button } from '@/components/ui/button'
```

`@mui/material` のような外部パッケージからではなく、**自分のファイルから** import している点に注目。これが「コードを所有する」の意味です。

### 4-2. shadcn/ui が掲げる5つの原則

公式は設計思想を5つ挙げています。エンジニアとして理解しておくべき部分です。

1. **Open Code（開かれたコード）**: コンポーネントの実装が全部見える・直せる。「このボタンのhover時の挙動、ちょっと変えたい」が、ファイルを直接編集するだけで叶う。ラッパーも override も不要。
2. **Composition（構成可能性）**: すべてのコンポーネントが共通の予測可能なインターフェースを持つ。組み合わせやすい。
3. **Distribution（配布）**: CLIとスキーマで、コンポーネントを配布・取得できる仕組み。
4. **Beautiful Defaults（美しい初期値）**: そのままで洗練された見た目。
5. **AI-Ready（AIフレンドリー）**: コードが手元にあり構造が明快なので、AI（LLM）が読んで改変しやすい。

特に重要なのが **1の Open Code**。従来型ライブラリの最大の痛み——「ライブラリのコンポーネントをラップして無理やり上書き」「スタイルを override する闘い」「異なるライブラリのコンポーネントを混在させる苦労」——を、「最初からコードが手元にある」ことで根本から消し去ります。

### 4-3. では「中身」は誰が作っているのか

ここで疑問。「コードを全部自分が持つなら、アクセシビリティ（第1章で大変だったあれ）は誰がやってくれるの?」

答え: shadcn/ui が生成するコードは、内部で **Radix UI** という「振る舞い専門・スタイル無し」ライブラリを使っています。つまり:

- **振る舞い・アクセシビリティ** → Radix UI（堅牢な実装に任せる）
- **見た目** → Tailwind のクラス（あなたが所有・自由に変更）

shadcn/ui は、この2つを「ちょうどいい初期状態」で **合体させたソースコードを生成してくれるツール**、という理解が正確です。だから「ライブラリではなく、ライブラリを作る方法」なのです。

### 4-4. 長所と短所（正直に）

**長所:**
- 完全なカスタマイズ自由度（コードが手元にある）。
- 没個性にならない。ブランドに合わせ込める。
- Radixのおかげでアクセシビリティは担保。
- 使ったコンポーネントだけがコードに入る。
- AIと相性が良い。

**短所:**
- コンポーネントを1つずつ `add` する手間（install一発のMUIより摩擦がある）。
- コピーしたコードは **自分のコードになる** ＝ 保守責任も自分。ライブラリ側のバグ修正が自動で降ってこない（自分で再取得・マージが必要）。
- **Tailwindの習熟が前提**。
- コードベースが大きくなる。
- 油断すると「どのプロジェクトもデフォルトのshadcn見た目」になりがち（→ テーマで差別化する）。

> ✅ **第4章のまとめ**: shadcn/ui = 「Radix（振る舞い）+ Tailwind（見た目）を、所有できるソースコードとして生成するツール」。npm installではなくCLIでコピー。最大の価値は Open Code（完全な所有と自由）。代償は保守責任とTailwind前提。

---

## 第5章 shadcn/ui を支える4つの道具を、手で再現して理解する

shadcn/uiを「魔法」にしないために、生成されるコードに必ず出てくる4つの道具を、**先に手で体験**しておきます。これを知っていると、生成された `button.tsx` を読んだとき「あ、知ってる」となります。

導入する道具:

1. **clsx** — クラス名を条件付きで連結する
2. **tailwind-merge** — 競合するTailwindクラスを賢く解決する
3. **class-variance-authority (cva)** — variant（種類）ごとのクラスを型安全に管理する
4. **Radix UI** — 振る舞いだけ提供する部品（第7章で実物を見ます）

### 5-1. インストール

これらは shadcn を入れると自動で入りますが、仕組み理解のため先に手で入れて遊びます。

```bash
npm install clsx tailwind-merge class-variance-authority
```

### 5-2. clsx — 条件付きクラス連結

第1ドキュメントでも軽く触れました。`clsx` は「truthyな値だけ繋ぐ」関数です。

```tsx
import clsx from 'clsx'

clsx('px-4 py-2', true && 'bg-blue-600', false && 'hidden')
// => "px-4 py-2 bg-blue-600"   ← false の 'hidden' は無視される
```

`active ? 'a' : ''` のような三項演算子の連打より、ずっと読みやすくなります。

### 5-3. tailwind-merge — クラスの「あと勝ち」を正しくする（重要）

Tailwindで、こういう状況を考えます。共通スタイルに `px-4` を持つボタンに、呼び出し側が「ここだけ `px-8` にしたい」とクラスを足す。

```tsx
// 単純連結だと…
clsx('px-4 py-2', 'px-8')
// => "px-4 py-2 px-8"
```

文字列としては `px-4` と `px-8` が **両方残ります**。CSSの世界では「後から定義された方」ではなく「CSSファイル上で後に書かれた方/詳細度」で決まるため、`px-8` が必ず勝つとは限らず、**意図せず `px-4` が効いてしまう**事故が起きます。

`tailwind-merge` はこれを解決します。「同じカテゴリのクラスは、**後に書いた方だけ残す**」という、人間が期待する挙動にしてくれます。

```tsx
import { twMerge } from 'tailwind-merge'

twMerge('px-4 py-2 px-8')
// => "py-2 px-8"   ← px-4 が消え、px-8 だけ残る！
```

### 5-4. `cn` ヘルパー — clsx + tailwind-merge の合体

shadcn/uiでは、この2つを合体させた `cn` という小さなユーティリティが必ず登場します。これを **自分で書いてみましょう**（実際にshadcnが生成するものと中身は同じです）。

> 📁 **あなたが作るファイル**: `src/lib/utils.ts`

```ts
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// clsx で条件付き連結 → twMerge で競合解決、を1関数にしたもの
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

これがあると、コンポーネントでこう書けます:

```tsx
// 共通クラス + 条件付きクラス + 呼び出し側が渡したクラス、を安全に合体
<button className={cn('px-4 py-2 rounded', isPrimary && 'bg-blue-600', className)} />
```

`cn` は shadcn/ui の全コンポーネントで使われる **最重要ヘルパー**です。先に自作したことで、生成コードを読む準備ができました。

### 5-5. cva — variant を型安全に管理する

ボタンには「primary / secondary / destructive（危険）」のような **種類（variant）** と、「sm / md / lg」のような **サイズ** があります。これを if文だらけにせず、宣言的・型安全に書くのが **class-variance-authority (cva)** です。

体験してみましょう。

> 📁 **あなたが作るファイル**: `src/lessons/11-shadcn/CvaButton.tsx`

```tsx
// src/lessons/11-shadcn/CvaButton.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// buttonVariants: 「基本クラス」+「variantごとのクラス」を定義する関数を作る
const buttonVariants = cva(
  // 1. すべてに共通の基本クラス
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    // 2. variant（種類）の定義
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    // 3. 何も指定しなかったときの既定値
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

// VariantProps で「variant と size のpropの型」を自動生成できる（型安全！）
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

function Button({ className, variant, size, ...rest }: Props) {
  // buttonVariants({variant, size}) が、その種類に対応したクラス文字列を返す
  return <button className={cn(buttonVariants({ variant, size }), className)} {...rest} />
}

export function CvaButton() {
  return (
    <div className="p-8 flex flex-wrap gap-3 items-center">
      <Button>既定 (primary/md)</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="destructive" size="lg">destructive / lg</Button>
      <Button size="sm">primary / sm</Button>
    </div>
  )
}
```

> 📌 **重要な前提**: ここで `@/lib/utils` という import を使っています。`@/` は「`src/` を指す」エイリアスで、**まだこのプロジェクトには設定されていません**。第6章でshadcn初期化時に設定します。それまでは一時的に相対パス（例 `../../lib/utils`）で書いてください。第6章以降は `@/` が使えます。

`src/App.tsx` で `<CvaButton />` を表示して確認してください。`variant` や `size` をエディタで打つと、TypeScriptが候補を出してくれる（`'primary' | 'secondary' | 'destructive'` 以外を弾く）はずです。これが「型安全なvariant管理」です。

**shadcn/uiが生成する `button.tsx` は、まさにこの `cva` + `cn` の組み合わせで書かれています。** つまりあなたは今、shadcnのボタンを手作りしたのとほぼ同じことをやりました。

> ✅ **第5章のまとめ**: shadcnの生成コードは `cn`(clsx+tailwind-merge) と `cva`(variant管理) でできている。`cn`は競合クラスを安全に合体、`cva`はvariant/sizeを型安全に定義。残るピース「振る舞い(Radix)」は第7章で実物を見る。

---

## 第6章 shadcn/ui をこのプロジェクトに導入する

前章までで土台は理解できました。実際に初期化します。このプロジェクトは既に Vite + Tailwind v4 済みなので、残りは「**パスエイリアス `@/` の設定**」と「**shadcn init**」だけです。

### 6-1. パスエイリアス `@/` を設定する

shadcnは `@/components/ui/button` のような `@/` 始まりのimportを使います。`@/` = `src/` という対応を、TypeScriptとViteの両方に教えます。

**(a) TypeScript側**: このプロジェクトの `tsconfig.json` を開き、`compilerOptions` に `baseUrl` と `paths` を足します。

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // ...既存の設定はそのまま...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

`tsconfig.app.json` の `compilerOptions` にも同じ2行を足しておきます（エディタの型解決を確実にするため）:

```jsonc
// tsconfig.app.json
{
  "compilerOptions": {
    // ...既存の設定はそのまま...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**(b) Vite側**: Viteにも `@` の解決を教えます。Node標準の `path` を使うので、型定義 `@types/node` を入れます（このプロジェクトには既に入っているはずですが、念のため）。

```bash
npm install -D @types/node
```

`vite.config.ts` を次のように更新します（既存のプラグインは残す）:

```ts
// vite.config.ts
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @ を src に向ける
    },
  },
})
```

これで、第5章で書いた `import { cn } from '@/lib/utils'` が解決できるようになります。

### 6-2. shadcn を初期化する

プロジェクトルートで実行します:

```bash
npx shadcn@latest init
```

対話形式でいくつか聞かれます。代表的な質問と、この教材での推奨回答:

- **どのスタイルにするか（base color など）**: 好みでOK。迷ったら `Neutral` などの無難な色。
- **CSS variables を使うか**: **Yes**（テーマをCSS変数で管理する。第9章で活きます）。

初期化が終わると、次のことが自動で起こります:

- `components.json` がプロジェクトルートに作られる（次項で解説）。
- `src/index.css` に、テーマ用の **大量のCSS変数**（`--background` `--foreground` `--primary` など）と `@theme` 定義が追記される。
- `src/lib/utils.ts`（第5章で自作した `cn`）が、無ければ生成される（既にあれば内容はほぼ同じ）。
- 必要な依存（`clsx`, `tailwind-merge`, `class-variance-authority`, Radix関連など）が入る。

> 💡 もし `init` が「Tailwindが見つからない」等で止まる場合、`src/index.css` の先頭に `@import 'tailwindcss';` があるか、`vite.config.ts` に `tailwindcss()` があるかを確認してください（このプロジェクトは両方ある前提です）。

### 6-3. components.json を読む

生成された `components.json` を開いてみましょう。これは **shadcn CLIへの設定ファイル**で、だいたいこんな内容です:

```jsonc
{
  "style": "new-york",          // デザインのスタイル（default / new-york）
  "tailwind": {
    "css": "src/index.css",     // TailwindのエントリーCSS
    "baseColor": "neutral",     // 基準カラー
    "cssVariables": true         // CSS変数でテーマ管理する
  },
  "aliases": {
    "components": "@/components", // コンポーネントの置き場所
    "utils": "@/lib/utils"        // cn の場所
  }
}
```

`add` コマンドは、このファイルを見て「どこに・どういう設定で」コードを生成するかを決めます。だから一度設定すれば、以降の `add` は迷わずあなたの規約どおりに置かれます。

> 補足: `style` の `default` と `new-york` は見た目の系統の違い（`new-york` は少しコンパクトでアイコンが Radix Icons 寄り、`default` は lucide-react）。後から大きく困ることは少ないので、好みで。

> ✅ **第6章のまとめ**: 導入は「`@/` エイリアス設定（tsconfig + vite.config）」→「`npx shadcn init`」の2段階。initは components.json を作り、index.css にテーマ用CSS変数を注入し、依存を入れる。CSS variables は Yes 推奨。

---

## 第7章 最初のコンポーネントを add して中身を読む

いよいよコンポーネントを取得します。`add` して、生成されたコードを **必ず読む** のがこの章の目的です（shadcnの神髄は「コードが読める・持てる」ことだから）。

### 7-1. button を add する

```bash
npx shadcn@latest add button
```

`src/components/ui/button.tsx` が生成されます。開いてみてください。だいたい次のような構造です（バージョンで細部は変わります）:

```tsx
// src/components/ui/button.tsx （生成されたもの。読むのが目的）
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 ... transition-colors ...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline: 'border bg-background hover:bg-accent ...',
        secondary: 'bg-secondary text-secondary-foreground ...',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-10 px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}

export { Button, buttonVariants }
```

### 7-2. 第5章とのつながりを確認する

見覚えがありますよね。**第5章で自作した `CvaButton` とほぼ同じ構造**です:

- `cva` で variant / size を定義 → ✅ 第5章でやった
- `cn` でクラスを合体 → ✅ 第5章で自作した
- `bg-primary` `text-primary-foreground` のような **見慣れない色クラス** → これが第6章で `index.css` に注入された **テーマ用CSS変数**（第9章で解説）

唯一の新顔が `Slot`（`@radix-ui/react-slot`）と `asChild` です。これがRadixです。

### 7-3. `asChild` と Radix Slot（合成の鍵）

`asChild` は「**このButtonの見た目を、別の要素に着せ替える**」ための仕組みです。たとえば「リンク（`<a>`）だけど、見た目はボタンにしたい」というよくある要求:

```tsx
import { Button } from '@/components/ui/button'

// asChild を付けると、Buttonは自分で<button>を描かず、
// 中の<a>に「ボタンのクラス」を着せる。→ 見た目はボタン、実体はリンク
<Button asChild>
  <a href="/about">Aboutへ</a>
</Button>
```

これが第4章の原則「**Composition（構成可能性）**」の正体です。Radixの `Slot` が「子要素にpropsとクラスを合成する」役割を担っています。

### 7-4. 使ってみる

> 📁 **あなたが作るファイル**: `src/lessons/11-shadcn/ButtonDemo.tsx`

```tsx
// src/lessons/11-shadcn/ButtonDemo.tsx
import { Button } from '@/components/ui/button'

export function ButtonDemo() {
  return (
    <div className="p-8 flex flex-wrap gap-3 items-center">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button asChild>
        <a href="#">リンクなのにボタン (asChild)</a>
      </Button>
    </div>
  )
}
```

`src/App.tsx` で `<ButtonDemo />` を表示して確認。洗練されたボタンが並べばOKです。

> ✅ **第7章のまとめ**: `add button` で `src/components/ui/button.tsx` が生成される。中身は第5章で自作した cva+cn とほぼ同じ＝もう読める。新顔は Radix の `Slot`/`asChild`（見た目の着せ替え＝Composition）。色クラス `bg-primary` 等はテーマCSS変数。

---

## 第8章 コンポーネントを「所有」してカスタマイズする

shadcnの真価はここ。生成された `button.tsx` は **あなたのファイル** なので、好きに書き換えられます。従来型では `!important` 合戦になる作業が、ただのコード編集になります。

### 8-1. 既存variantを直接変える

`src/components/ui/button.tsx` を開き、`default` variantのクラスを書き換えてみます。たとえば角を完全な丸（pill型）にしたいなら、基本クラスの `rounded-md` を `rounded-full` に変えるだけ:

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full ...', // rounded-md → rounded-full
  { /* ... */ },
)
```

保存すれば、アプリ中の **全部のButtonが一斉に丸く** なります。ライブラリのソースを直接持っているからこそ、です。

### 8-2. 新しいvariantを足す

「成功(success)」用の緑ボタンが欲しくなったとします。`variants.variant` にキーを1つ足すだけ:

```tsx
variants: {
  variant: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    // ...既存...
    success: 'bg-green-600 text-white hover:bg-green-700', // ★追加
  },
  // ...
},
```

これで `<Button variant="success">保存</Button>` が使えます。しかも `cva` + `VariantProps` のおかげで、**TypeScriptの補完にも `success` が自動で現れます**。型を別途いじる必要はありません。これが「型安全なvariant管理」の威力です。

> 📁 **あなたが作るファイル（確認用）**: `src/lessons/11-shadcn/CustomButtonDemo.tsx`

```tsx
// src/lessons/11-shadcn/CustomButtonDemo.tsx
import { Button } from '@/components/ui/button'

export function CustomButtonDemo() {
  return (
    <div className="p-8 flex gap-3">
      <Button variant="success">保存（独自variant）</Button>
      <Button>丸くなった既定ボタン</Button>
    </div>
  )
}
```

`src/App.tsx` で表示し、緑ボタンと丸ボタンが出れば、あなたは「ライブラリのコードを所有して改変した」ことになります。

### 8-3. 「保守責任も自分」を忘れない

良いことばかり書きましたが、第4章の短所も思い出してください。コードを所有する＝**アップデートが自動で来ない**。shadcn側でボタンの実装が改善されても、あなたの `button.tsx` は変わりません。新しい実装を取り込みたければ、再度 `add`（上書き）して、自分の変更とマージする必要があります。「自由」と「責任」はセットです。

> ✅ **第8章のまとめ**: 生成コードは自分のファイル＝直接編集でカスタマイズ。variant追加は `cva` にキーを足すだけ（型補完も自動追従）。代償は「アップデートを自分でマージする保守責任」。

---

## 第9章 テーマとダークモード（CSS変数の仕組み）

第7章で見た `bg-primary` `text-primary-foreground` という謎の色クラス。その正体を解き明かし、テーマを自分の色に変え、ダークモードを実装します。

### 9-1. CSS変数によるテーマの仕組み

`npx shadcn init` のとき「CSS variables: Yes」にしたので、`src/index.css` には次のような定義が入っています（抜粋・イメージ）:

```css
/* src/index.css （initが注入したもの） */
@import 'tailwindcss';

:root {
  --background: oklch(1 0 0);            /* ライト時の背景 */
  --foreground: oklch(0.145 0 0);        /* ライト時の文字 */
  --primary: oklch(0.205 0 0);           /* 主要色 */
  --primary-foreground: oklch(0.985 0 0);/* 主要色の上に乗る文字色 */
  /* ...他にも secondary, accent, destructive, border など多数... */
}

.dark {
  --background: oklch(0.145 0 0);        /* ダーク時は反転 */
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  /* ... */
}

@theme inline {
  /* CSS変数を Tailwind の色トークンに接続する */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... */
}
```

ここで起きていること（第1ドキュメント第9章・第11章とつながります）:

1. `:root` に「ライトモードの色」を CSS変数で定義。
2. `.dark` クラスが付いた要素の下では、同じ変数が「ダークの色」に **上書き** される。
3. `@theme inline` で、それらの変数を Tailwind の色名（`background`, `primary` …）に接続。
4. 結果、`bg-primary` と書くと `background-color: var(--primary)` になる。**だからライト/ダークの切り替えは「変数の値を差し替えるだけ」で全コンポーネントに波及する**。

つまり `bg-primary` は「固定色」ではなく「**現在のテーマの主要色**」を指す、賢い色クラスなのです。

### 9-2. ブランドカラーに変える

主要色を自社の色にしたければ、`:root`（と `.dark`）の `--primary` を書き換えるだけ。全Buttonの色が一斉に変わります。

```css
:root {
  --primary: oklch(0.55 0.22 264);          /* 例: 紫っぽい青に変更 */
  --primary-foreground: oklch(0.985 0 0);
}
```

色1つ直すだけで、ボタン・リンク・フォーカスリングなど「primaryを使う全部」が変わる——これがデザイントークン集中管理の利点です（第1ドキュメント第9章の `@theme` の発展形）。

### 9-3. ダークモードを実装する

仕組みは「`<html>` か `<body>` に `dark` クラスを付け外しするだけ」。OS追従でなく、ボタンで切り替える方式を作ります。第1ドキュメントの知識でトグルを書けます。

> 📁 **あなたが作るファイル**: `src/lessons/11-shadcn/ThemeToggle.tsx`

```tsx
// src/lessons/11-shadcn/ThemeToggle.tsx
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  // dark が変わるたび、<html> の class を付け外しする
  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-4">
      <h1 className="text-2xl font-bold">テーマ切り替えデモ</h1>
      <p className="text-muted-foreground">
        ボタンを押すと、背景(bg-background)と文字(text-foreground)が反転します。
      </p>
      <div className="flex gap-3">
        <Button onClick={() => setDark((d) => !d)}>
          {dark ? '☀️ ライトにする' : '🌙 ダークにする'}
        </Button>
        <Button variant="secondary">サンプル</Button>
        <Button variant="destructive">削除</Button>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground p-4">
        bg-card / text-card-foreground を使ったカード。テーマに追従します。
      </div>
    </div>
  )
}
```

`src/App.tsx` で `<ThemeToggle />` を表示し、ボタンで切り替えてください。`bg-background` `text-foreground` `bg-card` `border` などの **テーマ連動クラス** を使っているので、`dark` クラスの付け外しだけで全体が反転します。各要素に `dark:` を書く必要すらありません（第1ドキュメントのOS追従ダークより一段スマート）。

> 実務では、リロードしても設定が残るよう `localStorage` に保存し、`next-themes`（Next.jsの場合）等を使いますが、仕組みは「`dark` クラスのトグル」で同じです。

> ✅ **第9章のまとめ**: `bg-primary`等は固定色でなく「テーマ変数」を指す。`:root`/`.dark` で変数を定義し `@theme inline` でTailwind色に接続。ブランド化は変数を書き換えるだけ。ダークは `<html>` に `dark` クラスを付け外しするだけで全体波及。

---

## 第10章 実用コンポーネントを組み合わせる（Dialog / Input / Form）

第1章で苦しんだモーダルを、今度はshadcn（=Radix）で正しく作り直します。アクセシビリティの問題が全部解決されていることを体感しましょう。

### 10-1. 必要なコンポーネントを add する

```bash
npx shadcn@latest add dialog input label
```

`src/components/ui/` に `dialog.tsx` `input.tsx` `label.tsx` が増えます。

### 10-2. 正しいモーダル（第1章のリベンジ）

> 📁 **あなたが作るファイル**: `src/lessons/11-shadcn/DialogDemo.tsx`

```tsx
// src/lessons/11-shadcn/DialogDemo.tsx
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function DialogDemo() {
  return (
    <div className="p-8">
      <Dialog>
        {/* asChild で「このButtonがトリガー」になる */}
        <DialogTrigger asChild>
          <Button variant="destructive">削除する</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>本当に削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive">削除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

`src/App.tsx` で表示して、第1章の自作モーダルと比べてください。今度は **全部ちゃんと動きます**:

- **Escキーで閉じる** ✅
- **開くとフォーカスがダイアログ内に移り、Tabがダイアログ内をループ（フォーカストラップ）** ✅
- 閉じると **フォーカスが元のトリガーボタンに戻る** ✅
- スクリーンリーダーが `role="dialog"` として認識し、タイトルを読む ✅
- 背景クリックで閉じる ✅

第1章であれだけ苦労した「見えない正しさ」を、Radixが全部やってくれている。しかもコードは手元にあるので、見た目（`dialog.tsx`）は自由に直せる。これが shadcn の旨味です。

### 10-3. 入力フォームの部品

`input` と `label` も使ってみましょう。

> 📁 **あなたが作るファイル**: `src/lessons/11-shadcn/FormFieldDemo.tsx`

```tsx
// src/lessons/11-shadcn/FormFieldDemo.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function FormFieldDemo() {
  return (
    <div className="p-8 max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">名前</Label>
        <Input id="name" placeholder="山田太郎" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">メール</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <Button className="w-full">送信</Button>
    </div>
  )
}
```

`Label` の `htmlFor` と `Input` の `id` が紐づき、ラベルクリックで入力欄にフォーカスが入る（これもa11yの基本）。`Input` はテーマ変数を使っているので、ダークモードにも自動対応します。

> 補足: 本格的なバリデーション付きフォームは、shadcnの `Form` コンポーネントが `react-hook-form` + `zod` をラップして提供します（`npx shadcn add form`）。本教材では深入りしませんが、「フォームもライブラリでカバーされ、コードは手元に来る」という原則は同じです。

> ✅ **第10章のまとめ**: `add dialog input label` で実用部品を取得。Radixのおかげで第1章のモーダル問題（Esc/フォーカストラップ/フォーカス復帰/role）が全部解決。見た目は手元のファイルで自由。`Label`+`Input`はa11yの基本配線込み。

---

## 第11章 実践: 自作API + shadcn/ui で商品管理画面を作る

総仕上げです。**テンプレートを使わず素のNodeでAPIを自作**し、そのデータを shadcn/ui のコンポーネント（Card / Table / Badge / Button / Dialog）で表示する管理画面を作ります。第1ドキュメント第12章のAPIを拡張して使います。

### 11-1. バックエンドAPIを手書きする（依存ゼロ・フレームワークなし）

Node標準の `http` だけで書きます。第1ドキュメントで `server/api.mjs` を作った人はそれを拡張、未作成の人は新規作成してください。

> 📁 **あなたが作るファイル**: `server/api.mjs`

```js
// server/api.mjs
// Node標準httpのみ。フレームワークもテンプレートも使わない自作JSON API。
import { createServer } from 'node:http'

const products = [
  { id: 1, name: 'メカニカルキーボード', price: 14800, category: '入力機器', stock: 12 },
  { id: 2, name: 'ワイヤレスマウス',     price: 4980,  category: '入力機器', stock: 0  },
  { id: 3, name: '4K モニター 27inch',   price: 39800, category: 'ディスプレイ', stock: 5 },
  { id: 4, name: 'USB-C ハブ',          price: 3280,  category: '周辺機器', stock: 30 },
  { id: 5, name: 'ノートPCスタンド',     price: 2580,  category: '周辺機器', stock: 8  },
  { id: 6, name: 'Webカメラ 1080p',     price: 6480,  category: '周辺機器', stock: 0  },
]

const server = createServer((req, res) => {
  // CORS: Vite開発サーバ(別ポート)から叩けるよう許可
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/api/products') {
    res.writeHead(200)
    res.end(JSON.stringify(products))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ message: 'Not Found' }))
})

server.listen(8787, () => {
  console.log('API server running on http://localhost:8787')
})
```

起動（フロントとは別ターミナルで）:

```bash
node server/api.mjs
```

別ターミナルで確認:

```bash
curl http://localhost:8787/api/products
```

### 11-2. 必要なコンポーネントを add する

```bash
npx shadcn@latest add card table badge
```

（`button` `dialog` は前章までで取得済み。未取得なら一緒に `add` してください。）

### 11-3. 管理画面を組む

API → `fetch` → shadcnコンポーネントで表示。ローディング/エラーも作り込みます。

> 📁 **あなたが作るファイル**: `src/lessons/11-shadcn/ProductAdmin.tsx`

```tsx
// src/lessons/11-shadcn/ProductAdmin.tsx
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Product = {
  id: number
  name: string
  price: number
  category: string
  stock: number
}

export function ProductAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:8787/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: Product[]) => setProducts(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        読み込み中…
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">読み込み失敗</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            APIサーバ（node server/api.mjs）は起動していますか？
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">商品管理</h1>
          <p className="text-muted-foreground">在庫合計: {totalStock} 点</p>
        </div>
        <Button>＋ 新規追加</Button>
      </div>

      {/* サマリーカード */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <SummaryCard title="商品数" value={`${products.length} 件`} />
        <SummaryCard
          title="在庫切れ"
          value={`${products.filter((p) => p.stock === 0).length} 件`}
        />
        <SummaryCard
          title="総額(在庫×価格)"
          value={`¥${products
            .reduce((s, p) => s + p.price * p.stock, 0)
            .toLocaleString()}`}
        />
      </div>

      {/* テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>商品一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead className="text-right">価格</TableHead>
                <TableHead className="text-center">在庫</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{p.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.stock === 0 ? (
                      <Badge variant="destructive">在庫切れ</Badge>
                    ) : (
                      <Badge>{p.stock}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* 行ごとに正しいダイアログ（Radix）で削除確認 */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          削除
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>「{p.name}」を削除？</DialogTitle>
                          <DialogDescription>
                            この操作は取り消せません。
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              setProducts((prev) =>
                                prev.filter((x) => x.id !== p.id),
                              )
                            }
                          >
                            削除する
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 小さなサマリーカード（重複はコンポーネント化＝第1ドキュメント第10章の原則）
function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

### 11-4. 動かす

```bash
# ターミナル1: 自作API
node server/api.mjs

# ターミナル2: フロント
npm run dev
```

`src/App.tsx` で `<ProductAdmin />` を表示し、`http://localhost:5173` を開きます。すると:

- 「読み込み中…」のあと、APIのデータでサマリーカードとテーブルが表示され、
- カテゴリや在庫が `Badge` で色分けされ、
- 「削除」を押すと **正しい確認ダイアログ**（Esc・フォーカストラップ対応）が出て、
- 確認後に行が消え（クライアント側state更新）、
- 第9章の `ThemeToggle` を組み込めばダークモードにも追従する。

第1章で「自作は無理」と挫折したモーダルが、いまや管理画面の一部として何の苦もなく動いています。これが「Radixに振る舞いを任せ、見た目は所有する」shadcnの開発体験です。

### 11-5. 自分で改造してみる（理解度チェック）

1. **API側**: `products` に商品を追加 → フロント無修正でテーブルに増える（データ駆動）。
2. **API側**: `GET /api/products?category=周辺機器` で絞り込みを実装（`new URL(req.url, 'http://x').searchParams`）。
3. **フロント**: 第8章で作った `variant="success"` を「新規追加」ボタンに適用。
4. **フロント**: `add sonner`（トースト）を入れ、削除時に「削除しました」を表示。
5. **フロント**: 列ヘッダクリックで価格ソート（`useState` + `sort`）。

> ✅ **第11章のまとめ**: 素のNode httpで自作APIを作り、`fetch`で取得、shadcnの Card/Table/Badge/Dialog/Button で管理画面を構築。第1章の壊れたモーダルが、Radix製ダイアログとして完璧に動く。コードは全部手元＝いくらでも改造可能。

---

## 第12章 まとめ・選定基準・チートシート

### 12-1. 結局どれを使えばいい?（選定フローチャート）

絶対の正解はありません。性格で選びます。

- **デザインに強いこだわりがある / ブランドを作り込みたい / Tailwindを使っている** → **shadcn/ui**。所有とカスタマイズの自由が効く。今もっとも勢いがある選択肢。
- **とにかく速く・複雑な部品（データグリッド等）も全部欲しい / デザインはMaterialでよい** → **MUI**。全部入りの安心感。
- **Tailwindで従来型の手軽さ（install一発）が欲しい** → **HeroUI**。
- **学習・小規模・依存を増やしたくない** → 素のHTML + Tailwind（第1ドキュメント）でも十分なことは多い。

エンジニアとして外せない判断軸:

| 軸 | 従来型(MUI/HeroUI) | shadcn/ui |
|---|---|---|
| 導入の速さ | ◎ install一発 | ○ 1つずつadd |
| カスタマイズ自由度 | △〜○ override闘争 | ◎ 直接編集 |
| アップデート | ◎ 自動で降る | △ 自分でマージ |
| 没個性リスク | 高い | 低い(テーマ次第) |
| バンドル | 固定で大きめ | 使った分だけ |
| 前提知識 | 少 | Tailwind必須 |

### 12-2. shadcn/ui ワークフロー・チートシート

```bash
# 初期化（最初の一度だけ。@/エイリアスを先に設定しておく）
npx shadcn@latest init

# コンポーネント追加（src/components/ui/ に生成される）
npx shadcn@latest add button
npx shadcn@latest add dialog input label card table badge
npx shadcn@latest add form        # react-hook-form + zod ラッパー
npx shadcn@latest add sonner      # トースト

# 使う（自分のファイルからimport）
import { Button } from '@/components/ui/button'
```

| 概念 | 要点 |
|---|---|
| 提供形態 | npm installでなくCLIで**コードをコピー**（所有する） |
| 振る舞い | **Radix UI** が担当（a11y/キーボード/フォーカス） |
| 見た目 | **Tailwind** クラス（手元のファイルで自由に編集） |
| `cn()` | `clsx`+`tailwind-merge`。クラスを安全に合体（`src/lib/utils.ts`） |
| `cva` | variant/sizeを型安全に定義 |
| `asChild` | 子要素に見た目を着せる（Composition） |
| テーマ | `:root`/`.dark`のCSS変数 + `@theme inline`。`bg-primary`等は変数を指す |
| ダーク | `<html>`に`dark`クラスをトグルするだけで全体波及 |
| components.json | CLIの設定（生成先・エイリアス・スタイル） |
| 注意 | アップデートは自動で来ない＝**保守責任は自分** |

### 12-3. 作ったファイル一覧（振り返り）

- `src/lessons/11-shadcn/NaiveModal.tsx` … 壊れた自作モーダル（第1章）
- `src/lessons/11-shadcn/CvaButton.tsx` … cva+cnを手作り（第5章）
- `src/lib/utils.ts` … `cn` ヘルパー
- `src/components/ui/*.tsx` … addで生成（button, dialog, input, label, card, table, badge…）
- `src/lessons/11-shadcn/ButtonDemo.tsx` / `CustomButtonDemo.tsx` … ボタンとカスタマイズ
- `src/lessons/11-shadcn/ThemeToggle.tsx` … テーマ/ダーク（第9章）
- `src/lessons/11-shadcn/DialogDemo.tsx` / `FormFieldDemo.tsx` … 実用部品（第10章）
- `server/api.mjs` … 自作APIサーバ（依存ゼロ）
- `src/lessons/11-shadcn/ProductAdmin.tsx` … 総仕上げ管理画面（第11章）

### 12-4. 次の一歩

- **Blocks**: ログイン画面やダッシュボードなど「ページ単位」のテンプレ。複数コンポーネントの組み合わせ例として読むだけでも勉強になる。
- **`add form` + zod**: 実務のフォームはこれ。バリデーションとエラー表示が型安全に。
- **テーマエディタ / Theming**: 公式のテーマ生成で、ブランドカラーのCSS変数一式を作る。
- **アクセシビリティ**: Radixが土台を担うが、適切な見出し構造・コントラスト比・ラベルはあなたの責任。
- **v0（Vercel）**: shadcnコードをAIでプロンプト改変。Open Code/AI-Readyの実例。

---

おつかれさまでした。ここまで通して手を動かせば、「コンポーネントライブラリの2つの流派」を理解し、**なぜ shadcn/ui が『所有するコンポーネント』という発想で支持されているか**を、`cva`/`cn`/Radix の仕組みごと腹落ちさせ、自作APIのデータに対して実用的な管理画面を組める状態になっています。
