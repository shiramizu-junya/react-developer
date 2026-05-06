import { useEffect, useRef } from 'react';

export function FocusInput() {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// マウント時に input へフォーカス
        console.log(inputRef)
		inputRef.current?.focus();
	}, []);

	return (
		<section>
			<h2>① useRef でフォーカス</h2>
			<input ref={inputRef} placeholder="自動でフォーカスされる" />
		</section>
	);
}
