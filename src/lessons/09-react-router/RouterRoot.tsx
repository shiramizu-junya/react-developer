import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { About } from './routes/About';
import { Home } from './routes/Home';
import { Layout } from './routes/Layout';
import { NotFound } from './routes/NotFound';
import { Search } from './routes/Search';
import { UserDetail } from './routes/users/UserDetail';

export const RouterRoot = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="about" element={<About />} />
					<Route path="users/:id" element={<UserDetail />} />
					<Route path="search" element={<Search />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
