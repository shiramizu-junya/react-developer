// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// clsx で条件付き連結 → twMerge で競合解決、を1関数にしたもの
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
