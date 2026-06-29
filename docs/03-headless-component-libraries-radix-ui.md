# ヘッドレスコンポーネント徹底入門 — 「ロジックとUIの分離」から Radix UI まで

> この1ファイルだけを **上から順に読みながら、自分の手でコードを書いていけば** 、
> 「ヘッドレスコンポーネントとは何か」「なぜ流行したのか」「render props / カスタムフックでどう自作するか」「Radix UI をどう使うか」、最後に「自作の Django REST API のデータを Radix のコンポーネントで表示する」までが一通り身につくように作っています。
>
> - 教材（解説）とコードは **分離していません** 。読み進める流れの中でコードが出てきます。
> - **写経 → 穴埋め → 自力** の順で、後半ほどあなたが書く量を増やします。
> - 各ステップに「**核 / 補足**」「**予測 → 動作確認**」「**想起チェック**」を必ず置いています。流し読みせず、隠して再現してください。
>
> 前提: このリポジトリは既に **Vite + React 19 + TypeScript + Tailwind CSS v4** がセットアップ済みで、`radix-ui` パッケージも `package.json` に入っています（`docs/01` `docs/02` 済みの状態）。まだの人は先に `docs/02-component-libraries-shadcn-ui.md` を終えると、Radix が shadcn/ui の土台だったことが腑に落ちます。
>
> 想定読者: React/TypeScript は中級。Tailwind の基礎は分かる。バックエンドは Python/Django を学習中。「ヘッドレスってよく聞くけど結局なに? Radix と shadcn は何が違うの?」という人。

---

## 目次

1. [概要 — この教材で学べること](#1-概要--この教材で学べること)
2. [前提知識・環境](#2-前提知識環境)
3. [環境構築](#3-環境構築)
4. 本編（ステップ式）
   - [Step 1 「ヘッドレス」の核心 — UIを持たない、ロジックだけの部品](#step-1-ヘッドレスの核心--uiを持たないロジックだけの部品核)
   - [Step 2 render props パターンでヘッドレス化する](#step-2-render-props-パターンでヘッドレス化する核)
   - [Step 3 カスタムフックパターン — 同じロジックで2つのUI](#step-3-カスタムフックパターン--同じロジックで2つのui核)
   - [Step 4 Radix UI primitives 入門 — Root / Trigger / Content](#step-4-radix-ui-primitives-入門--root--trigger--content核)
   - [Step 5 asChild・controlled/uncontrolled・data属性スタイリング](#step-5-aschildcontrolleduncontrolleddata属性スタイリング核補足)
   - [Step 6 ToggleGroup を自力で組む（記事のコード）](#step-6-togglegroup-を自力で組む記事のコード核)
   - [Step 7 実践 — Django REST API のデータを Radix で表示する](#step-7-実践--django-rest-api-のデータを-radix-で表示する核補足)
5. [つまずきポイント](#5-つまずきポイント)
6. [まとめ](#6-まとめ)
7. [宿題（アウトプット課題）](#7-宿題アウトプット課題)
8. [発展](#8-発展)

---

## 1. 概要 — この教材で学べること

3本の記事（[Headless UI Libraries (dev.to)](https://dev.to/verthon/headless-ui-libraries-the-key-to-flexible-and-accessible-user-interfaces-546p) / [The complete guide to building headless interface components (LogRocket)](https://blog.logrocket.com/the-complete-guide-to-building-headless-interface-components-in-react/) / [Radix UI](https://www.radix-ui.com/)）の要点をまとめると：

- **ヘッドレスコンポーネントとは「UIを持たないが、機能（状態・ロジック・アクセシビリティ）を持つ部品」** 。見た目を一切強制しないので、同じロジックを別々のUIで再利用できる。
- React でヘッドレス化する代表的な手段は **render props** と **カスタムフック**（記事はこの2つを実演。HOC も挙げられる）。
- **ヘッドレスUIライブラリ**（Radix UI / Headless UI / Reakit / Reach UI / React Aria）は、キーボード操作・フォーカス管理・スクリーンリーダー対応といった「正しく作るのが大変な部分」を肩代わりし、**スタイルは完全にあなたに委ねる** 。
- **Radix UI** は「**unstyled（スタイルなし）** かつ **accessible（アクセシブル）** な primitives（プリミティブ）」を提供する React ライブラリ。`Root / Trigger / Content` のような **コンパウンド（複合）コンポーネント** 、`asChild` prop、controlled/uncontrolled 両対応が核。

この教材では、上の概念を **手で再現** してから Radix を使い、最後に **Django の JSON API** と組み合わせます。

> 💡補足：記事は全部「フロントエンドだけ」の話です。バックエンド連携（Step 7・宿題 Lv3）は記事には無く、あなたの学習スタックに合わせて **私が追加** した部分です。明示します。

---

## 2. 前提知識・環境

| 区分 | 必要なもの | 確認コマンド |
|------|-----------|-------------|
| フロント | Node.js 20+ / npm | `node -v` |
| フロント | このリポジトリ（Vite + React 19 + TS + Tailwind v4） | `cat package.json` |
| フロント | `radix-ui`（インストール済みのはず） | `npm ls radix-ui` |
| バック（Step 7〜） | uv（Pythonの環境・依存管理） | `uv --version` |
| バック（Step 7〜） | Python 3.11+（uv が無ければ自動で入れてくれる） | `uv python list` |
| 知識 | React の `useState` / `useEffect` / `useRef` / カスタムフック | — |
| 知識 | TypeScript の基本（型注釈・ジェネリクス少々） | — |

**既知の知識との接続**：このリポジトリで既に学んだ `src/lessons/08-custom-hooks`（`useToggle` など）と、`src/lessons/11-shadcn`（shadcn/ui の `button.tsx` が内部で Radix の `Slot` を使っていたこと）が直接つながります。ヘッドレスは「あなたが既に書いてきたカスタムフックの延長線上」にあります。

---

## 3. 環境構築

### 3-1. フロント側（Radix の確認）

```bash
# 1. radix-ui が入っているか確認（入っていれば 1.6.x が出る）
npm ls radix-ui

# 2. 入っていなければインストール（このリポジトリは導入済み）
npm install radix-ui

# 3. 開発サーバを起動（http://localhost:5173）
npm run dev
```

> 💡補足：Radix には2つの入手形態があります（記事＝Radix公式より）。
> - **まとめ版**：`npm install radix-ui` → `import { Dialog, DropdownMenu } from "radix-ui"`（このリポジトリはこれ）
> - **個別版**：`npm install @radix-ui/react-dialog` → `import * as Dialog from "@radix-ui/react-dialog"`
> どちらも **tree-shakeable**（使ったものだけバンドルに入る）。本教材は **まとめ版** で統一します。

このリポジトリの運用どおり、学習用コンポーネントは `src/lessons/12-headless-radix/` に作り、`src/App.tsx` で表示を切り替えます（`main.tsx` は `<App />` を描画するだけ）。

> 📁 これから作るフォルダ：`src/lessons/12-headless-radix/`

### 3-2. バック側（Step 7 で使う Django。今すぐでなくてOK）

Step 7 に入る直前で実行すれば十分です。**このリポジトリをモノレポにして、ルート直下の `backend/` に立てます**（フロントは今のまま `src/`。テンプレートは使わず、JSON を返す REST API にします）。

最終的な構成イメージ：

```
react-developer/          ← リポジトリのルート（今のReactアプリ。動かさない）
├── src/                  ← フロント（Vite + React）
├── docs/
├── package.json
└── backend/              ← ★ここを作ってDjangoを入れる
    ├── .venv/            （.gitignore対象。uv が自動生成）
    ├── pyproject.toml    （依存の宣言。git にコミットする）
    ├── uv.lock           （依存の固定。git にコミットする）
    ├── manage.py
    ├── db.sqlite3        （.gitignore対象）
    └── config/{settings.py, urls.py, api.py}
```

Python の環境は **uv** で作ります（`python -m venv` / `pip` は使いません）。

```bash
# 0. リポジトリのルート（react-developer/）にいることを確認
pwd   # .../react-developer

# 1. ルート直下に backend/ を作って入る
mkdir backend && cd backend

# 2. uv プロジェクトを初期化（pyproject.toml を作る。--bare で main.py 等のサンプルを作らない）
uv init --bare

# 3. 依存を追加（.venv を自動作成し、pyproject.toml / uv.lock に記録される）
uv add "django>=5.0" django-ninja django-cors-headers

# 4. Djangoプロジェクトを作成（uv run で .venv 内のコマンドを実行 → backend/manage.py が生える）
uv run django-admin startproject config .
```

> 💡補足（uv の使い方）：uv は **仮想環境を手動で activate しなくてよい** のが利点です。コマンドは `uv run <cmd>`（例：`uv run python manage.py runserver`）で `.venv` 内のものが実行されます。`uv add` は `pip install` ＋ `pyproject.toml`/`uv.lock` への記録を一度に行います。`uv init --bare` が使えない古い uv の場合は `uv init` でOK（生成される `main.py` は消して構いません）。Python 自体が無ければ `uv python install 3.12` で入れられます。
>
> 💡補足（モノレポにする場合の注意）：Python の生成物を git に乗せないため、ルートの `.gitignore` に `.venv` / `__pycache__/` / `*.sqlite3` を追記しておきます（`pyproject.toml` と `uv.lock` は **コミットする**）。フロント(5173)とバック(8000)は **別ポート** なので、モノレポでも CORS 設定は必要です（変わりません）。
>
> 💡補足：バックエンドは **Django Ninja** を採用します（理由：型ヒントから自動でJSONを返し、ボイラープレートが少ないため、フロント学習の妨げになりにくい）。DRF（Django REST Framework）でも同じことはできます。Step 7 に DRF 版の差分も置きます。

---

## Step 1 「ヘッドレス」の核心 — UIを持たない、ロジックだけの部品（核）

**目的**：ヘッドレスの定義を *コードで* つかむ。記事の一文「a component that doesn't have a UI, but has the functionality（UIを持たないが機能を持つ部品）」を、最小の自作フックで体感する。
**これは核**：面接で「ヘッドレスとは?」と聞かれたら、この一行を自分の言葉で言えることがゴール。

### コード（写経）

> 📁 `src/lessons/12-headless-radix/useDisclosure.ts`

```ts
// 開閉状態（state）と操作（logic）だけを持つ、UIを一切持たないフック。
// これが「ヘッドレス」のいちばん小さい姿。
import { useState, useCallback } from 'react'

export function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // useCallbackで関数の参照を安定させる（再レンダー時に作り直さない）
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  // 「状態」と「操作」だけを返す。JSX（見た目）は一切返さない。
  return { isOpen, open, close, toggle }
}
```

> 📁 `src/lessons/12-headless-radix/DisclosureDemo.tsx`

```tsx
// 同じ useDisclosure を使い回して、見た目の違う2つのUIを作る。
// ロジックは1つ、UIは何通りでも → これがヘッドレスの旨み。
import { useDisclosure } from './useDisclosure'

export function DisclosureDemo() {
  const panel = useDisclosure()
  const drawer = useDisclosure()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* UI-A: アコーディオン風 */}
      <section>
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={panel.toggle}>
          {panel.isOpen ? '閉じる' : '開く'}（アコーディオン）
        </button>
        {panel.isOpen && <p className="mt-2 text-gray-700">アコーディオンの中身です。</p>}
      </section>

      {/* UI-B: 同じロジックでドロワー風（見た目だけ別物） */}
      <section>
        <button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={drawer.open}>
          ドロワーを開く
        </button>
        {drawer.isOpen && (
          <div className="mt-2 border rounded p-4">
            ドロワーの中身。
            <button className="ml-2 underline" onClick={drawer.close}>×閉じる</button>
          </div>
        )}
      </section>
    </div>
  )
}
```

### 解説（ブロックごと）

- `useDisclosure` は **JSXを返さない** 。返すのは `isOpen`（状態）と `open/close/toggle`（操作）だけ。これが記事の言う "has the functionality, but no UI"。
- `DisclosureDemo` 側が **見た目（UI）を自由に決める** 。アコーディオンでもドロワーでも、ロジックは同じフックを再利用できる。
- **既知との接続**：あなたが `08-custom-hooks` で書いた `useToggle` と発想は同じ。「カスタムフック＝最小のヘッドレスコンポーネント」と捉えてよい。

### 予測 → 動作確認

`src/App.tsx` で `<DisclosureDemo />` を表示してください。

```tsx
// src/App.tsx（該当行だけ）
import { DisclosureDemo } from './lessons/12-headless-radix/DisclosureDemo'
// ...
<DisclosureDemo />
```

> 🔮 **実行する前に出力を予想してみよう**：2つのボタンは **独立して** 開閉するはず。観点 →「`panel` と `drawer` は別々の `useDisclosure()` 呼び出しなので、状態は共有されない」。片方を開いてももう片方は閉じたまま、で合っているか?

```bash
npm run dev   # http://localhost:5173 を開く
```

期待される動作：

- 「開く（アコーディオン）」を押す → 下に段落が出る。もう一度押すと消える。
- 「ドロワーを開く」を押す → 枠が出る。「×閉じる」で消える。
- 2つは互いに影響しない。

### 想起チェック

<details><summary>Q. 「ヘッドレスコンポーネント」を一文で説明してみよう。`useDisclosure` は何を返し、何を返さないか?</summary>

ヘッドレスコンポーネントとは **UI（見た目）を持たず、状態・ロジック・アクセシビリティといった「機能」だけを提供する部品** 。`useDisclosure` は `isOpen`（状態）と `open/close/toggle`（操作）を返すが、**JSX（見た目）は返さない** 。だから同じロジックを別々のUIで再利用できる。

</details>

---

## Step 2 render props パターンでヘッドレス化する（核）

**目的**：記事の `Countdown` を題材に、**render props（子要素を関数として受け取る）** パターンを写経して理解する。
**これは核**：render props は「コンポーネント自身が見た目を持たず、計算結果を呼び出し側に渡して描画を委ねる」古典的かつ重要なヘッドレスの型。

> 元記事は JavaScript。ここでは **TypeScript に置き換え** ています（置き換え箇所：引数・戻り値・render props の型注釈を追加）。ロジックは記事のままです。

### コード（写経）

まず時間計算のユーティリティ（記事のコードをTS化）。

> 📁 `src/lessons/12-headless-radix/calculateTimeLeft.ts`

```ts
// 残り時間を {days, hours, minutes, seconds} で返す。
// 無効な日付なら null、過去日なら空オブジェクト {} を返す（記事の仕様どおり）。
export type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function calculateTimeLeft(date: Date): TimeLeft | {} | null {
  // 日付として無効なら null（記事では date-fns の isValid を使用。ここは標準APIで代替）
  if (Number.isNaN(date.getTime())) return null

  const difference = date.getTime() - new Date().getTime()
  let timeLeft: TimeLeft | {} = {}

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }
  return timeLeft
}
```

> 💡補足：記事は無効日付の判定に `date-fns` の `isValid` を使っています。依存を増やさないため、ここでは `Number.isNaN(date.getTime())` で代替しました（置き換え箇所）。

次がヘッドレス本体（記事の `Countdown` をTS化）。

> 📁 `src/lessons/12-headless-radix/Countdown.tsx`

```tsx
import { useState, useEffect, useRef, type ReactNode } from 'react'
import { calculateTimeLeft, type TimeLeft } from './calculateTimeLeft'

// renderに渡す値の型。これが「呼び出し側に渡す計算結果」。
type CountdownRenderProps = {
  isValidDate: boolean
  isValidFutureDate: boolean
  timeLeft: TimeLeft | {} | null
}

type CountdownProps = {
  date: Date
  // children が「関数」。JSXではなく、描画方法を受け取る = render props。
  children: (props: CountdownRenderProps) => ReactNode
}

export function Countdown({ date, children }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | {} | null>(() =>
    calculateTimeLeft(date),
  )
  const timer = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    // 1秒ごとに残り時間を再計算（記事と同じ）
    timer.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft(date))
    }, 1000)
    // クリーンアップでタイマー解除（useEffectの後始末）
    return () => {
      if (timer.current !== undefined) clearInterval(timer.current)
    }
  }, [date])

  let isValidDate = true
  let isValidFutureDate = true
  if (timeLeft === null) isValidDate = false
  if (timeLeft && (timeLeft as TimeLeft).seconds === undefined) isValidFutureDate = false

  // 自分でJSXを描かず、計算結果を children(関数) に渡して描画を委ねる。
  return <>{children({ isValidDate, isValidFutureDate, timeLeft })}</>
}
```

UI（呼び出し側）。記事の `FirstCountdownUI` をTS化したもの。

> 📁 `src/lessons/12-headless-radix/CountdownDemo.tsx`

```tsx
import { Countdown } from './Countdown'
import type { TimeLeft } from './calculateTimeLeft'

export function CountdownDemo() {
  const date = new Date('2030-01-01')

  return (
    <div className="p-6">
      <Countdown date={date}>
        {({ timeLeft, isValidDate, isValidFutureDate }) => {
          if (!isValidDate) return <div>有効な日付を渡してください</div>
          if (!isValidFutureDate) return <div>時間切れ。未来の日付を渡してください</div>
          const t = timeLeft as TimeLeft
          return (
            <div>
              <strong>{t.days}</strong> 日 <strong>{t.hours}</strong> 時間{' '}
              <strong>{t.minutes}</strong> 分 <strong>{t.seconds}</strong> 秒
            </div>
          )
        }}
      </Countdown>
    </div>
  )
}
```

### 解説（ブロックごと）

- `children` が **関数** であることが render props の本体。`Countdown` は計算（残り時間・バリデーション）だけ行い、**描画は呼び出し側の関数に丸投げ** する。
- だから同じ `Countdown` に別の関数を渡せば、別の見た目になる（記事の `FirstCountdownUI` / `SecondCountdownUI` の関係）。
- **既知との接続**：`useEffect` のクリーンアップ（`clearInterval`）は `02-useRef` / `08-custom-hooks` で見たパターンそのまま。`useRef` でタイマーIDを保持しているのも既習。

### 予測 → 動作確認

`src/App.tsx` を `<CountdownDemo />` に切り替えて起動。

> 🔮 **予想してみよう**：観点 →「①日付は未来（2030年）なので `isValidDate=true` `isValidFutureDate=true`。②1秒ごとに `seconds` が1つずつ減るはず」。本当に毎秒更新される? 更新の正体は何のAPIか?

```bash
npm run dev
```

期待される出力（例）：`1745 日 8 時間 12 分 43 秒` のような表示が **毎秒** カウントダウンする。

### 想起チェック

<details><summary>Q. render props パターンの「props」とは具体的に何で、`Countdown` は自分で何を描画している?</summary>

`children` に渡す **関数** が render props。`Countdown` は `{ isValidDate, isValidFutureDate, timeLeft }` という計算結果をその関数に渡すだけで、**自分では具体的な見た目を描画しない**（`<>{children(...)}</>` を返すのみ）。見た目は呼び出し側が決める。

</details>

---

## Step 3 カスタムフックパターン — 同じロジックで2つのUI（核）

**目的**：記事が「render props より cleaner」と紹介する **カスタムフック版** に書き換え、**同じロジックを2つの別UIで使い回す** ことを確かめる。
**これは核**：現代の React では、ヘッドレス化は **カスタムフック** で行うのが主流。render props と「何が同じで何が楽になったか」を言えるように。

### コード（中盤：骨組み＋TODO 穴埋め）

記事の `useCountdown` を、あなたが TODO を埋めて完成させます。**Step 2 のロジックをフックに移すだけ** です。

> 📁 `src/lessons/12-headless-radix/useCountdown.ts`

```ts
import { useState, useEffect, useRef } from 'react'
import { calculateTimeLeft, type TimeLeft } from './calculateTimeLeft'

export function useCountdown(date: Date) {
  // TODO 1: timeLeft の state を作る（初期値は calculateTimeLeft(date)）
  // TODO 2: timer 用の useRef を用意する

  useEffect(() => {
    // TODO 3: 1秒ごとに setTimeLeft(calculateTimeLeft(date)) する setInterval を timer.current に入れる
    // TODO 4: クリーンアップで clearInterval する
  }, [date])

  // TODO 5: isValidDate / isValidFutureDate を timeLeft から判定する（Step 2 と同じ条件）

  // TODO 6: { isValidDate, isValidFutureDate, timeLeft } を return する
}
```

<details><summary>解答例（TODOを埋めたもの）</summary>

```ts
import { useState, useEffect, useRef } from 'react'
import { calculateTimeLeft, type TimeLeft } from './calculateTimeLeft'

export function useCountdown(date: Date) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | {} | null>(() =>
    calculateTimeLeft(date),
  )
  const timer = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    timer.current = setInterval(() => {
      setTimeLeft(calculateTimeLeft(date))
    }, 1000)
    return () => {
      if (timer.current !== undefined) clearInterval(timer.current)
    }
  }, [date])

  let isValidDate = true
  let isValidFutureDate = true
  if (timeLeft === null) isValidDate = false
  if (timeLeft && (timeLeft as TimeLeft).seconds === undefined) isValidFutureDate = false

  return { isValidDate, isValidFutureDate, timeLeft }
}
```

</details>

呼び出し側。記事の `FirstCountdownUI` / `SecondCountdownUI`（同じデータ、別の見た目）をTS化。

> 📁 `src/lessons/12-headless-radix/UseCountdownDemo.tsx`

```tsx
import { useCountdown } from './useCountdown'
import type { TimeLeft } from './calculateTimeLeft'

// UI-1: 「日/時/分/秒」とラベル付き
function FirstCountdownUI({ date }: { date: Date }) {
  const { timeLeft, isValidDate, isValidFutureDate } = useCountdown(date)
  if (!isValidDate) return <div>有効な日付を渡してください</div>
  if (!isValidFutureDate) return <div>時間切れ</div>
  const t = timeLeft as TimeLeft
  return (
    <div>
      <strong>{t.days}</strong> 日 <strong>{t.hours}</strong> 時間{' '}
      <strong>{t.minutes}</strong> 分 <strong>{t.seconds}</strong> 秒
    </div>
  )
}

// UI-2: コロン区切りの時計表示（同じ useCountdown を使う）
function SecondCountdownUI({ date }: { date: Date }) {
  const { timeLeft, isValidDate, isValidFutureDate } = useCountdown(date)
  if (!isValidDate) return <div>有効な日付を渡してください</div>
  if (!isValidFutureDate) return <div>時間切れ</div>
  const t = timeLeft as TimeLeft
  return (
    <strong>
      {t.days} : {t.hours} : {t.minutes} : {t.seconds}
    </strong>
  )
}

export function UseCountdownDemo() {
  const date = new Date('2030-01-01')
  return (
    <div className="flex flex-col gap-4 p-6">
      <FirstCountdownUI date={date} />
      <SecondCountdownUI date={date} />
    </div>
  )
}
```

### 解説（ブロックごと）

- ロジック（state + interval + バリデーション）は `useCountdown` に完全に閉じ込められ、**UIコンポーネントは `useCountdown(date)` を呼んで結果を描画するだけ** 。
- render props の「`children`に関数を渡す入れ子」が消え、**ただのフック呼び出し** になった。これが記事の言う "cleaner"。
- **既知との接続**：`08-custom-hooks` でやった「ロジックをフックに抽出して複数コンポーネントで共有」と完全に同じ設計。ヘッドレス＝この発想を「UI部品」に適用したもの。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「`FirstCountdownUI` と `SecondCountdownUI` は **別々に** `useCountdown` を呼んでいる。2つの `seconds` はピッタリ同期する? それとも独立した interval なのでわずかにズレうる?」

```bash
npm run dev   # App.tsx を <UseCountdownDemo /> に切り替えて
```

期待される出力：ラベル付き表示とコロン区切り表示が両方カウントダウン。同じ秒数を指す（同じ `date` から計算するため）。

### 想起チェック

<details><summary>Q. render props 版とカスタムフック版、UIを差し替える方法はそれぞれどう違う?</summary>

- **render props 版**：同じ `<Countdown>` に **別の `children`関数** を渡してUIを変える（JSXの入れ子）。
- **カスタムフック版**：UIコンポーネントごとに `useCountdown(date)` を **呼び出して** 結果を描画する。入れ子が無く読みやすい。

どちらも「ロジックは1か所、UIは何通りでも」を実現する。記事はフック版を推奨。

</details>

---

## Step 4 Radix UI primitives 入門 — Root / Trigger / Content（核）

**目的**：自作ヘッドレスの限界（フォーカス管理・キーボード操作・スクリーンリーダー対応）を、**Radix UI primitives** に肩代わりさせる。最頻出の `Dialog` で、**コンパウンドコンポーネント（`Root/Trigger/Content`…）** の型を覚える。
**これは核**：Radix の使い方の9割はこの「部品を入れ子に組む」型。面接でも実務でも一番出る。

> 💡補足：なぜ自作では足りないのか。記事（dev.to）いわく、ヘッドレスUIライブラリは「キーボードナビゲーション・フォーカス管理・スクリーンリーダー・各ブラウザの差異」を **テスト済みで** 肩代わりする。モーダルを開いたら中にフォーカスを閉じ込め、Escで閉じ、`aria-*` を正しく付ける——これを自前で完璧にやるのは現実的でない（`docs/02` 第1章の「素朴なモーダル」の苦労を思い出してください）。

### コード（写経）

> 📁 `src/lessons/12-headless-radix/RadixDialogDemo.tsx`

```tsx
// まとめ版パッケージから Dialog を取り出す（このリポジトリの形式）
import { Dialog } from 'radix-ui'

export function RadixDialogDemo() {
  return (
    // Root: 開閉状態を管理する「親」。状態は内部で持ってくれる（uncontrolled）。
    <Dialog.Root>
      {/* Trigger: これを押すと開く。asChild無しだと <button> が生える */}
      <Dialog.Trigger className="px-3 py-1 bg-blue-600 text-white rounded">
        ダイアログを開く
      </Dialog.Trigger>

      {/* Portal: 中身を <body> 直下に描画する（z-index地獄を避ける定石） */}
      <Dialog.Portal>
        {/* Overlay: 背景の暗幕 */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        {/* Content: モーダル本体。フォーカストラップ/Escで閉じる等は自動 */}
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-80">
          {/* Title/Description: スクリーンリーダー向け。付けないと警告が出る */}
          <Dialog.Title className="text-lg font-bold">確認</Dialog.Title>
          <Dialog.Description className="mt-2 text-gray-600">
            本当に削除しますか？
          </Dialog.Description>

          <div className="mt-4 flex justify-end gap-2">
            {/* Close: 押すと閉じる。状態操作を自分で書かなくてよい */}
            <Dialog.Close className="px-3 py-1">キャンセル</Dialog.Close>
            <Dialog.Close className="px-3 py-1 bg-red-600 text-white rounded">
              削除
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### 解説（ブロックごと）

- `Dialog.Root` … `Dialog.Close` のように **同じ `Dialog` 名前空間の部品を入れ子に組む** のがコンパウンドコンポーネント。`Root` が状態を持ち、子（`Trigger/Content/Close`）がそれを共有する（内部は Context）。
- **スタイルが一切付いていない**（unstyled）。`className` は全部あなたが付けている＝記事の「complete control over the look and feel」。
- `Portal` / `Overlay` / フォーカストラップ / Escで閉じる / `aria-*` 付与は **Radix が自動** 。`docs/02` 第1章で手作りして苦しんだ部分が、丸ごと消えている。
- **既知との接続**：`docs/02` で読んだ shadcn/ui の `dialog.tsx` は、まさにこの Radix Dialog に Tailwind の `className` を付けただけのもの。「shadcn = Radix（ヘッドレス）+ Tailwind（見た目）+ 自分のリポジトリにコピー」だと腑に落ちる。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「①開いた状態で **Escキー** を押すと閉じる? ②開いた状態で **Tab** を押すと、フォーカスはモーダルの外（背景のボタン）に出ていく? それともモーダル内をぐるぐる回る?」。自作モーダルとの違いを予想してから触る。

```bash
npm run dev   # App.tsx を <RadixDialogDemo /> に
```

期待される動作：

- ボタンで開閉できる。
- **Esc で閉じる**。
- **Tab を押してもフォーカスがモーダル内に閉じ込められる**（フォーカストラップ）。
- 開くと背景がスクロールできない／読み上げ対象が中身に限定される。

### 想起チェック

<details><summary>Q. Radix の Dialog で「状態（開いている/閉じている）」を持っているのはどの部品? あなたが書いていない（=Radixが自動でやる）ことを3つ挙げよ。</summary>

状態を持つのは `Dialog.Root`（uncontrolled なら内部 state）。あなたが書いていないのに動くもの：**①Escで閉じる ②フォーカストラップ（Tabがモーダル内を回る）③`aria-*` 属性とフォーカス復帰（閉じたらトリガーに戻る）**。他に Portal による body 直下描画、背景スクロール固定なども。

</details>

---

## Step 5 asChild・controlled/uncontrolled・data属性スタイリング（核＋補足）

**目的**：Radix を「使える」から「使いこなす」へ。記事（Radix公式）が挙げる3つの要点 **`asChild`** / **uncontrolled⇄controlled** / **データ属性でのスタイリング** を押さえる。
**これは核**：`asChild` と controlled/uncontrolled は Radix 全コンポーネント共通の概念。1つ覚えれば全部に効く。

### コード（中盤：一部 TODO）

> 📁 `src/lessons/12-headless-radix/RadixDialogControlled.tsx`

```tsx
import { useState } from 'react'
import { Dialog } from 'radix-ui'

// 自作のリンク風ボタン（Radixが生成する<button>を使いたくない例）
function FancyButton({ children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button {...props} className="underline text-blue-700">
      {children}
    </button>
  )
}

export function RadixDialogControlled() {
  // controlled: 開閉状態を「あなたの state」で握る
  const [open, setOpen] = useState(false)

  return (
    <div className="p-6">
      {/* open / onOpenChange を渡すと controlled になる */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        {/* asChild: Triggerが <button> を作らず、子(FancyButton)に挙動を“合体”させる */}
        <Dialog.Trigger asChild>
          <FancyButton>controlled で開く</FancyButton>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded p-6 w-80">
            <Dialog.Title className="font-bold">controlled ダイアログ</Dialog.Title>
            <Dialog.Description className="mt-2 text-gray-600">
              open は外の state が持っています。
            </Dialog.Description>

            {/* TODO: 「外から閉じる」ボタンを作る。Dialog.Close を使わず、setOpen(false) で閉じてみよう */}

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* state を直接いじって開ける（controlledの利点：外部ロジックから制御できる） */}
      <button className="mt-4 px-3 py-1 border rounded" onClick={() => setOpen(true)}>
        外側の別ボタンから開く
      </button>
    </div>
  )
}
```

<details><summary>解答例（TODO部分）</summary>

```tsx
<button className="mt-4 px-3 py-1 border rounded" onClick={() => setOpen(false)}>
  外から閉じる
</button>
```

`open` を自分の state で握っている（controlled）ので、`setOpen(false)` で閉じられる。`Dialog.Close` を使わなくても制御できるのが controlled の利点。

</details>

### 解説（ブロックごと）

- **`asChild`（核）**：これを付けると、Radix は **自前の要素を作らず、渡した子要素に props（onClick や aria）を“合体”させる** 。記事の言う "gives users full control over the rendered element"。`<a>`・自作ボタン・`<Link>` などを Trigger にしたいときの定番。内部実装は `Slot` というユーティリティ（`docs/02` で見た shadcn の `Slot` と同じもの）。
- **uncontrolled ⇄ controlled（核）**：
  - *uncontrolled*（Step 4）= 何も渡さない。Radix が内部 state で開閉を管理。手軽。
  - *controlled*（今回）= `open` と `onOpenChange` を渡す。**開閉状態をあなたの state が握る** 。「保存に成功したら閉じる」など外部ロジックから制御したいとき必須。
  - **既知との接続**：React の `<input value onChange>`（controlled input）と完全に同じ考え方。
- **データ属性スタイリング（補足）**：💡Radix は状態を `data-state="open"` のような **data属性** でDOMに出す。CSS/Tailwind から `data-[state=open]:opacity-100` のように状態でスタイルを切り替えられる（記事の「open component architecture」）。

### 予測 → 動作確認

> 🔮 **予想してみよう**：観点 →「`asChild` を **外した** ら画面はどうなる? ボタンが**二重**（FancyButton の中にもう一つ button）になって、リンク風スタイルが崩れるのでは?」。予想したら、実際に `asChild` を消して確かめる。

```bash
npm run dev   # App.tsx を <RadixDialogControlled /> に
```

期待される動作：3つの開き方（Triggerのリンク風ボタン／外側の別ボタン／）すべてで同じダイアログが開く。「外から閉じる」「外側の別ボタンから開く」が state 経由で効く。`asChild` を外すと `<button>`が入れ子になり見た目が崩れる。

### 想起チェック

<details><summary>Q. controlled にするには Dialog.Root に何を渡す? asChild は何のためにある?</summary>

- controlled：`open`（現在の開閉状態）と `onOpenChange`（変化時に呼ばれるコールバック）を `Dialog.Root` に渡す。React の controlled input（`value`/`onChange`）と同じ。
- `asChild`：Radix が自前要素を生成せず、**渡した子要素に挙動（イベント・aria）を移譲** する。`<a>` や自作コンポーネントを Trigger 等にしたいときに使う。内部は `Slot`。

</details>

---

## Step 6 ToggleGroup を自力で組む（記事のコード）（核）

**目的**：記事（dev.to）に載っていた **ToggleGroup** を、ここまでの型（コンパウンド + className + aria）で **自力で** 組む。Dialog 以外の primitive でも同じ作法が通用することを確認する。
**これは核**：「Radix は primitive ごとに `Root/Item` 等の名前は違っても、組み方の型は同じ」と腹落ちさせる。

### コード（終盤：要件のみ。自力で書く）

記事の元コード（参考。JS）：

```javascript
// 記事のオリジナル（JavaScript・抜粋）
import * as ToggleGroup from '@radix-ui/react-toggle-group';

const ToggleGroupDemo = () => (
  <ToggleGroup.Root className="ToggleGroup" type="single" defaultValue="center" aria-label="Text alignment">
    <ToggleGroup.Item className="ToggleGroupItem" value="left" aria-label="Left aligned">
      <TextAlignLeftIcon />
    </ToggleGroup.Item>
  </ToggleGroup.Root>
);
```

**あなたへの要件**（このリポジトリの形式＝まとめ版 `radix-ui` + Tailwind + TS で書く）：

- `radix-ui` から `ToggleGroup` を import する。
- 「左寄せ / 中央寄せ / 右寄せ」の **3つの `ToggleGroup.Item`** を持つ単一選択（`type="single"`）のグループを作る。
- 初期値（`defaultValue`）は `"center"`。グループに `aria-label="Text alignment"` を付ける。
- 各 Item に `value` と `aria-label` を付ける。アイコンは `lucide-react`（インストール済み）の `AlignLeft` / `AlignCenter` / `AlignRight` を使う。
- 選択中の Item が見た目で分かるように、**`data-state` を使った Tailwind スタイル**（例：`data-[state=on]:bg-blue-600 data-[state=on]:text-white`）を当てる。
- 選択中の値を画面に表示する（`onValueChange` + `useState` で controlled に）。

> 📁 `src/lessons/12-headless-radix/RadixToggleGroupDemo.tsx`（自力で作成）

> 🔮 まず **予想**：観点 →「`type="single"` なので **同時に1つしか** on にならないはず。キーボードの **矢印キー** で Item 間を移動できるはず（Radixが自動で付けるroving tabindex）」。書く前に「どう動くべきか」を言語化してから実装する。

<details><summary>解答例</summary>

```tsx
import { useState } from 'react'
import { ToggleGroup } from 'radix-ui'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export function RadixToggleGroupDemo() {
  // controlled: 選択値を自分の state で持つ
  const [value, setValue] = useState('center')

  const itemClass =
    'p-2 border border-gray-300 data-[state=on]:bg-blue-600 data-[state=on]:text-white'

  return (
    <div className="p-6 flex flex-col gap-3">
      <ToggleGroup.Root
        type="single"
        value={value}
        onValueChange={(v) => {
          // 単一選択では空文字になり得る（同じItemを再クリックで解除）ため、空なら無視
          if (v) setValue(v)
        }}
        aria-label="Text alignment"
        className="inline-flex w-fit rounded overflow-hidden"
      >
        <ToggleGroup.Item value="left" aria-label="Left aligned" className={itemClass}>
          <AlignLeft size={18} />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="center" aria-label="Center aligned" className={itemClass}>
          <AlignCenter size={18} />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="right" aria-label="Right aligned" className={itemClass}>
          <AlignRight size={18} />
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      <p>選択中: <strong>{value}</strong></p>
    </div>
  )
}
```

</details>

### 解説（ブロックごと）

- `ToggleGroup.Root` が「どれが選択中か」を持ち、`ToggleGroup.Item` がその一員。Dialog の `Root/Trigger/Content` と **まったく同じコンパウンドの型** 。
- `data-[state=on]:...` は Step 5 の「データ属性スタイリング」の実戦投入。Radix が選択中の Item に `data-state="on"` を付けてくれるので、Tailwind で見た目を切り替えられる。
- 矢印キーでの移動（roving tabindex）も Radix が自動。自作だと面倒な部分。

### 想起チェック

<details><summary>Q. Dialog と ToggleGroup、APIの「名前」は違うのに共通している設計は何?</summary>

どちらも **コンパウンドコンポーネント**：状態を持つ `Root` の下に、状態を共有する子部品（`Trigger/Content/Close` や `Item`）を入れ子に置く。unstyled なので `className` は自分で付け、状態は `data-*` 属性で受け取ってスタイリングする——という作法が全 primitive で共通。

</details>

---

## Step 7 実践 — Django REST API のデータを Radix で表示する（核＋補足）

**目的**：ヘッドレスの締めくくりとして、**Django の JSON API から商品一覧を取得 → Radix の Dialog で詳細表示** を作る。フロントとバックを分離した実務の最小形。
**これは核**：「API（データ）」と「ヘッドレスUI（見た目）」を結線できること。**補足**：Django 側の細部は薄く扱う。

> ⚠️ ここからは記事に **無い** 内容（あなたのスタックに合わせた追加）です。記事はフロントのみ。

### 7-1. バックエンド（Django Ninja で JSON API）

`3-2` で作った `backend/` で作業します。`config/api.py` を新規作成：

> 📁 `backend/config/api.py`

```python
# Django Ninja で「商品一覧を返すだけ」の最小JSON API。
# テンプレートは使わず、JSONを返すREST APIとして実装する。
from ninja import NinjaAPI, Schema

api = NinjaAPI()

# レスポンスの型（スキーマ）。フロントのTSの型と1対1で対応させる意識を持つ。
class ProductOut(Schema):
    id: int
    name: str
    price: int
    description: str

# DBは使わず、学習用にメモリ上の固定データ（後でDjango ORMに差し替え可能）
PRODUCTS = [
    {"id": 1, "name": "キーボード", "price": 12000, "description": "静音メカニカル軸"},
    {"id": 2, "name": "マウス", "price": 6000, "description": "軽量ワイヤレス"},
    {"id": 3, "name": "モニター", "price": 38000, "description": "27インチ 4K"},
]

@api.get("/products", response=list[ProductOut])
def list_products(request):
    return PRODUCTS
```

`config/urls.py` に API を結線し、CORS を許可：

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

> 💡補足（DRF版の差分）：DRF を使う場合は `@api_view(["GET"])` を付けた関数ビューで `Response(PRODUCTS)` を返し、`INSTALLED_APPS` に `rest_framework` を足すだけで同じ JSON が返せます。CORS の設定は共通。

起動：

```bash
# backend/ で（uv run で .venv 内の python を実行。activate不要）
uv run python manage.py migrate     # 初回のDB初期化（adminのため。商品はメモリなので不要だが警告回避）
uv run python manage.py runserver   # http://127.0.0.1:8000
```

> 🔮 **予想してみよう**：観点 →「`/api/products` を叩くと、PRODUCTS が **JSON配列** で返るはず。`Content-Type` は `application/json` か?」

```bash
curl http://127.0.0.1:8000/api/products
```

期待される出力：

```json
[{"id": 1, "name": "キーボード", "price": 12000, "description": "静音メカニカル軸"},
 {"id": 2, "name": "マウス", "price": 6000, "description": "軽量ワイヤレス"},
 {"id": 3, "name": "モニター", "price": 38000, "description": "27インチ 4K"}]
```

### 7-2. フロント（取得は useFetch 的に、表示は Radix Dialog で）

要件だけ示します。**自力で** 書いてください（ここまでの全要素の総合）。

- `Product` 型（`id/name/price/description`）を定義。
- `http://127.0.0.1:8000/api/products` を `fetch` して一覧表示（`useEffect` + `useState`。`docs/08` の `useFetch` 相当でよい）。
- 各商品に「詳細」ボタン。押すと **Radix の `Dialog`** でその商品の詳細を表示。
- ダイアログは **controlled**（選択中の商品 state で開閉を制御）。

> 📁 `src/lessons/12-headless-radix/ProductListDemo.tsx`（自力で作成）

> 🔮 **予想**：観点 →「①初回は一覧が空→fetch後に3件描画。②『詳細』を押すと、その商品だけがダイアログに出る（選択中商品の state が効く）」。

<details><summary>解答例</summary>

```tsx
import { useEffect, useState } from 'react'
import { Dialog } from 'radix-ui'

type Product = {
  id: number
  name: string
  price: number
  description: string
}

export function ProductListDemo() {
  const [products, setProducts] = useState<Product[]>([])
  // 選択中の商品（null なら閉じている）。これで Dialog を controlled にする。
  const [selected, setSelected] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Product[]>
      })
      .then(setProducts)
      .catch((e) => setError(String(e)))
  }, [])

  if (error) return <div className="p-6 text-red-600">取得失敗: {error}</div>

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-3">商品一覧</h2>
      <ul className="flex flex-col gap-2">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-3 border rounded p-2">
            <span className="flex-1">{p.name} — ¥{p.price.toLocaleString()}</span>
            <button
              className="px-2 py-1 bg-blue-600 text-white rounded"
              onClick={() => setSelected(p)}
            >
              詳細
            </button>
          </li>
        ))}
      </ul>

      {/* selected があれば開く（controlled）。閉じたら null に戻す */}
      <Dialog.Root open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded p-6 w-80">
            <Dialog.Title className="text-lg font-bold">{selected?.name}</Dialog.Title>
            <Dialog.Description className="mt-2 text-gray-600">
              {selected?.description}
            </Dialog.Description>
            <p className="mt-2">価格: ¥{selected?.price.toLocaleString()}</p>
            <Dialog.Close className="mt-4 px-3 py-1 border rounded">閉じる</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
```

</details>

### 解説（ブロックごと）

- **データ（Django）と見た目（Radix）が完全に分離** している。API は JSON を返すだけ、React は受け取って描画するだけ。これが SPA + REST の基本形。
- ダイアログを `open={selected !== null}` で制御するのが Step 5 の controlled の応用。「どの商品を選んだか」という **アプリの状態** と Dialog の開閉を1つの state に束ねている。
- **既知との接続**：`fetch` + `useEffect` + `useState` は `docs/08` の `useFetch` と同型。Radix は `docs/02` の shadcn の土台。学んできたものが全部つながる。

### 想起チェック

<details><summary>Q. このダイアログを controlled にしている理由は? uncontrolled では何が困る?</summary>

「**どの商品を選んだか**」をダイアログの中身に反映する必要があるため。`selected` という state が「開閉」と「表示する商品」を同時に決める。uncontrolled（Radix内部state）だと、開閉は管理できても「クリックした商品」をダイアログに渡す手段がなく、外部の state と連動できない。

</details>

---

## 5. つまずきポイント

| 症状 | 原因 | 対処 |
|------|------|------|
| `Module not found: radix-ui` | パッケージ未インストール | `npm install radix-ui`。import は `import { Dialog } from 'radix-ui'`（まとめ版）|
| コンソールに `DialogContent requires a DialogTitle` 警告 | `Dialog.Title` を省略した | `Dialog.Title` を必ず置く。視覚的に隠したいなら `VisuallyHidden` を使う |
| `asChild` を付けたら `React.Children.only` エラー | 子要素が0個 or 2個以上 | `asChild` の子は **単一要素** にする |
| controlled なのに開閉しない | `onOpenChange` を渡し忘れ | `open` と `onOpenChange` は **セット** で渡す（片方だけは不可）|
| `data-[state=open]:...` が効かない | Tailwind の任意属性記法ミス / 状態名違い | `data-state` の実値（`open`/`closed`/`on`/`off`）を devtools で確認 |
| Django API に `fetch` すると CORS エラー | CORS 未許可 | `django-cors-headers` を入れ、`CorsMiddleware` を MIDDLEWARE 先頭付近に、`CORS_ALLOWED_ORIGINS` に `http://localhost:5173` |
| `curl` は通るのにブラウザだけ失敗 | プロトコル/ポート違い or CORS | フロントの URL と `CORS_ALLOWED_ORIGINS` を一致させる（`localhost` と `127.0.0.1` も別物扱い）|
| カウントダウンが更新されない | `setInterval` のクリーンアップ漏れ / 依存配列 | `useEffect` の return で `clearInterval`、依存は `[date]` |

---

## 6. まとめ

- **ヘッドレスコンポーネント** = UIを持たず機能だけを持つ部品。「ロジック1つ・UI何通りでも」を実現する。
- React でのヘッドレス化：**render props**（`children`に関数）と **カスタムフック**（推奨・cleaner）。HOC も古典的手段。
- **ヘッドレスUIライブラリ**（Radix / Headless UI / Reakit / Reach UI / React Aria）は、キーボード操作・フォーカス管理・スクリーンリーダー・ブラウザ差異を肩代わりし、**スタイルは完全にあなたに委ねる** 。
- **Radix UI** の核：**unstyled かつ accessible な primitives** / `Root・Trigger・Content` の **コンパウンド** / **`asChild`**（要素の差し替え）/ **uncontrolled⇄controlled** / **`data-*` 属性スタイリング** / tree-shakeable。
- **shadcn/ui との関係**：shadcn = Radix（ヘッドレス）+ Tailwind（見た目）+ コードを自分のリポジトリにコピー。
- **実務**：データ（Django REST API の JSON）と 見た目（Radix）を分離して結線する。

---

## 7. 宿題（アウトプット課題）

本編で作った `src/lessons/12-headless-radix/` と `backend/` の **続き** として解いてください。

### Lv1 基礎確認（トピック別・各1問）

#### Lv1-A：自作ヘッドレス（カスタムフック）

**課題**
- `useDisclosure`（Step 1）に **`isOpen` の数値版** ではなく、「これまで開いた回数」を数える `openCount` を追加する。
- `open` が呼ばれるたびに `openCount` を +1 する。
- `DisclosureDemo` のどこかに「開いた回数: N」を表示する。

**ヒント**：state をもう1つ増やすだけ。`open` の中で `setOpenCount((c) => c + 1)`。`toggle` で開くときもカウントするか否かは自分で仕様を決め、コメントに書く。

**判定基準**：ボタンを3回開くと「開いた回数: 3」になる。閉じてもカウントは減らない。

<details><summary>解答例</summary>

```ts
import { useState, useCallback } from 'react'

export function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [openCount, setOpenCount] = useState(0)

  const open = useCallback(() => {
    setIsOpen(true)
    setOpenCount((c) => c + 1) // 開くたびに加算
  }, [])
  const close = useCallback(() => setIsOpen(false), [])
  // toggle: 閉→開のときだけカウント
  const toggle = useCallback(
    () =>
      setIsOpen((prev) => {
        if (!prev) setOpenCount((c) => c + 1)
        return !prev
      }),
    [],
  )

  return { isOpen, open, close, toggle, openCount }
}
```

</details>

#### Lv1-B：Radix primitive

**課題**
- `RadixDialogDemo`（Step 4）に **`Dialog.Trigger` を `asChild`** にして、自作の `FancyButton`（Step 5）をトリガーにする。
- `Dialog.Title` を `VisuallyHidden`（`radix-ui` の `VisuallyHidden`）で **視覚的に隠す** が、スクリーンリーダーには読ませる。

**ヒント**：`import { Dialog, VisuallyHidden } from 'radix-ui'`。`<VisuallyHidden.Root><Dialog.Title>…</Dialog.Title></VisuallyHidden.Root>` のように包む。`asChild` の子は単一要素。

**判定基準**：見た目上タイトルは消えるが、コンソールの「Title が必要」警告は出ない。`asChild` でトリガーがリンク風の見た目になる。

<details><summary>解答例</summary>

```tsx
import { Dialog, VisuallyHidden } from 'radix-ui'

function FancyButton({ children, ...props }: React.ComponentProps<'button'>) {
  return <button {...props} className="underline text-blue-700">{children}</button>
}

export function RadixDialogA11y() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <FancyButton>開く</FancyButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded p-6 w-80">
          <VisuallyHidden.Root>
            <Dialog.Title>確認ダイアログ</Dialog.Title>
          </VisuallyHidden.Root>
          <Dialog.Description className="text-gray-600">本当に削除しますか？</Dialog.Description>
          <Dialog.Close className="mt-4 px-3 py-1 border rounded">閉じる</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

</details>

### Lv2 応用（トピック別・各1問）

#### Lv2-A：render props ↔ カスタムフックの相互変換

**課題**
- Step 1 の `useDisclosure` を、**render props 版の `Disclosure` コンポーネント** に書き換える。
- `<Disclosure>{({ isOpen, toggle }) => (...)}</Disclosure>` の形で使えるようにする。
- 同じUIを `useDisclosure`（フック版）でも書き、**両方が同じ動作** になることを確認する。

**ヒント**：`children: (props: {...}) => ReactNode` を受け取り、`useDisclosure()` の結果をそのまま `children(...)` に渡すだけ。Step 2 の `Countdown` の構造を真似る。

**判定基準**：render props 版とフック版、どちらのデモも開閉ボタンが同じように動く。

<details><summary>解答例</summary>

```tsx
import type { ReactNode } from 'react'
import { useDisclosure } from './useDisclosure'

type DisclosureRender = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function Disclosure({ children }: { children: (p: DisclosureRender) => ReactNode }) {
  const state = useDisclosure()
  return <>{children(state)}</>
}

// 使用例
export function DisclosureRenderPropsDemo() {
  return (
    <Disclosure>
      {({ isOpen, toggle }) => (
        <div className="p-6">
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={toggle}>
            {isOpen ? '閉じる' : '開く'}
          </button>
          {isOpen && <p className="mt-2">render props 版の中身</p>}
        </div>
      )}
    </Disclosure>
  )
}
```

</details>

#### Lv2-B：別の Radix primitive を自力で導入

**課題**
- `radix-ui` の **`DropdownMenu`** を使い、商品一覧（Step 7）の各行に「操作 ▾」メニューを付ける。
- メニュー項目は「詳細を見る」「価格をコピー」の2つ。「詳細を見る」で Step 7 の Dialog を開く。
- unstyled なので Tailwind で見た目を付け、`data-[highlighted]:bg-gray-100` でホバー/キーボード選択中の項目を強調する。

**ヒント**：`DropdownMenu.Root / Trigger / Portal / Content / Item`。Dialog と同じコンパウンドの型。「価格をコピー」は `navigator.clipboard.writeText(...)`。「詳細を見る」は `onSelect` で `setSelected(p)`。

**判定基準**：ボタンでメニューが開き、矢印キーで項目移動でき、Escで閉じる。「詳細を見る」で該当商品のダイアログが開く。

<details><summary>解答例</summary>

```tsx
import { DropdownMenu } from 'radix-ui'

// 商品行の中（products.map 内）で使う想定
function ProductRowMenu({
  product,
  onDetail,
}: {
  product: { name: string; price: number }
  onDetail: () => void
}) {
  const itemClass = 'px-3 py-1 outline-none cursor-pointer data-[highlighted]:bg-gray-100'
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="px-2 py-1 border rounded">操作 ▾</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-white border rounded shadow py-1 min-w-32">
          <DropdownMenu.Item className={itemClass} onSelect={onDetail}>
            詳細を見る
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={itemClass}
            onSelect={() => navigator.clipboard.writeText(String(product.price))}
          >
            価格をコピー
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

`ProductListDemo` の各行で `<ProductRowMenu product={p} onDetail={() => setSelected(p)} />` を使う。

</details>

### Lv3 発展（全体統合・1問）

**課題（記事に無い実務拡張：バリデーション / エラー処理 / ページネーション）**

Step 7 を拡張し、**フロント・バック両方** を実務寄りにする：

- **バック（Django Ninja）**：
  - `/api/products` に **ページネーション** を追加。クエリ `?page=1&size=2` を受け取り、`{ items: [...], page, size, total }` を返す。
  - 不正な `page`（0以下や数値でない）には **400** とエラーJSON `{ "detail": "..." }` を返す（バリデーション）。
- **フロント（Radix + fetch）**：
  - 一覧の下に「前へ / 次へ」ボタン（Radix の primitive でなくてよいが、`ToggleGroup` でページ番号を選ぶ実装でも可）。
  - 取得中は「読み込み中…」、失敗時は **エラー内容を Radix Dialog** で表示（エラー処理）。
  - `total` と `size` から最終ページを計算し、最終ページで「次へ」を `disabled` にする。

**ヒント**
- Ninja は関数引数に `page: int = 1, size: int = 2` と書くだけでクエリを受け取れる。バリデーションは `if page < 1: return api.create_response(request, {"detail": "page must be >= 1"}, status=400)`。
- フロントは `page` を state に持ち、`useEffect` の依存配列に `page` を入れて再 fetch。
- 「最終ページか」は `page * size >= total`。

**判定基準（検証可能な形）**

```bash
# 1ページ目（size=2）→ items が2件、total=3、page=1
curl "http://127.0.0.1:8000/api/products?page=1&size=2"
# 期待: {"items":[{...},{...}],"page":1,"size":2,"total":3}

# 不正なpage → 400 とエラーJSON
curl -i "http://127.0.0.1:8000/api/products?page=0&size=2"
# 期待: HTTP/1.1 400 ... 本文 {"detail":"page must be >= 1"}
```

- ブラウザ：2ページ目に進むと残り1件が表示され、「次へ」が disabled になる。API を止めた状態で開くと、エラー内容がダイアログに出る。

<details><summary>解答例</summary>

**バック：`backend/config/api.py`**

```python
from ninja import NinjaAPI, Schema

api = NinjaAPI()

class ProductOut(Schema):
    id: int
    name: str
    price: int
    description: str

class PageOut(Schema):
    items: list[ProductOut]
    page: int
    size: int
    total: int

PRODUCTS = [
    {"id": 1, "name": "キーボード", "price": 12000, "description": "静音メカニカル軸"},
    {"id": 2, "name": "マウス", "price": 6000, "description": "軽量ワイヤレス"},
    {"id": 3, "name": "モニター", "price": 38000, "description": "27インチ 4K"},
]

@api.get("/products")
def list_products(request, page: int = 1, size: int = 2):
    # バリデーション：不正な値は 400 + エラーJSON
    if page < 1 or size < 1:
        return api.create_response(request, {"detail": "page must be >= 1"}, status=400)

    start = (page - 1) * size
    items = PRODUCTS[start : start + size]
    return PageOut(items=items, page=page, size=size, total=len(PRODUCTS))
```

**フロント：`src/lessons/12-headless-radix/ProductPagedDemo.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Dialog } from 'radix-ui'

type Product = { id: number; name: string; price: number; description: string }
type Page = { items: Product[]; page: number; size: number; total: number }

export function ProductPagedDemo() {
  const size = 2
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Page | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`http://127.0.0.1:8000/api/products?page=${page}&size=${size}`)
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.detail ?? `HTTP ${res.status}`)
        return body as Page
      })
      .then(setData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [page])

  const isLast = data ? page * size >= data.total : true

  return (
    <div className="p-6">
      {loading && <p>読み込み中…</p>}

      <ul className="flex flex-col gap-2">
        {data?.items.map((p) => (
          <li key={p.id} className="border rounded p-2">
            {p.name} — ¥{p.price.toLocaleString()}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          前へ
        </button>
        <button
          className="px-3 py-1 border rounded disabled:opacity-40"
          disabled={isLast}
          onClick={() => setPage((p) => p + 1)}
        >
          次へ
        </button>
      </div>

      {/* エラーを Radix Dialog で表示（controlled） */}
      <Dialog.Root open={error !== null} onOpenChange={(o) => !o && setError(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded p-6 w-80">
            <Dialog.Title className="font-bold text-red-600">エラー</Dialog.Title>
            <Dialog.Description className="mt-2 text-gray-700">{error}</Dialog.Description>
            <Dialog.Close className="mt-4 px-3 py-1 border rounded">閉じる</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
```

</details>

---

## 8. 発展

- **React Aria（Adobe）/ React Aria Components**：フックベースで、Radix より低レベル＆網羅的。i18n・複雑なフォーカス制御まで踏み込む。「Radix で物足りなくなったら」。
- **Headless UI（Tailwind Labs）**：Tailwind 公式。Radix との設計差（コンポーネント数・API）を比べると理解が深まる。
- **Radix の他の primitive**：`Popover` `Tooltip` `Select` `Tabs` `Accordion` `Toast`。どれも `Root/Trigger/Content` 系の同じ型。1つ作れる＝全部作れる。
- **shadcn/ui を読み直す**：`docs/02` の `src/components/ui/*.tsx` が、まさに「Radix + cva + tailwind-merge」で組まれていることを、今のあなたなら全部読める。
- **アクセシビリティの検証**：キーボードだけで全操作 / `axe DevTools` / スクリーンリーダー（macOS VoiceOver）で実際に読み上げを確認する。
- **バック側の発展**：Django Ninja の `Schema` でリクエストボディのバリデーション、`paginate` デコレータ、認証（JWT）。フロントとの型共有（OpenAPI から TS 型生成）。
