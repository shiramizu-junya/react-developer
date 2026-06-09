// src/lessons/11-shadcn/CvaButton.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

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
	}
);

// VariantProps で「variant と size のpropの型」を自動生成できる（型安全！）
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...rest }: Props) {
	// buttonVariants({variant, size}) が、その種類に対応したクラス文字列を返す
	return <button className={cn(buttonVariants({ variant, size }), className)} {...rest} />;
}

export function CvaButton() {
	return (
		<div className="p-8 flex flex-wrap gap-3 items-center">
			<Button>既定 (primary/md)</Button>
			<Button variant="secondary">secondary</Button>
			<Button variant="destructive" size="lg">
				destructive / lg
			</Button>
			<Button size="sm">primary / sm</Button>
		</div>
	);
}
