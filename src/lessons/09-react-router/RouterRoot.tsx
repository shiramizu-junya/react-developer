import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { InlineStyleLesson } from '../InlineStyleLesson';
import { About } from './routes/About';
import { Home } from './routes/Home';
import { Layout } from './routes/Layout';
import { NotFound } from './routes/NotFound';
import { UserDetail, userLoader } from './routes/users/UserDetail';
import { TailwindHello } from '../TailwindHello';

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
				errorElement: <NotFound />, // ローダーでエラーが発生したときに表示するコンポーネント
			},
			{ path: '*', element: <NotFound /> },
		],
	},
	{
		path: '/lessons/inline',
		element: <InlineStyleLesson />,
	},
	{
		path: '/lessons/tw-hello',
		element: <TailwindHello />,
	}
]);

export function RouterRoot() {
	return <RouterProvider router={router} />;
}
