import { useLoaderData, type LoaderFunctionArgs } from 'react-router-dom';

type User = { id: string; name: string; email: string };

// Loader: ルートにマッチしたとき React Router が呼んでくれる関数
export const userLoader = async ({ params }: LoaderFunctionArgs): Promise<User> => {
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
