import { Routes, Route } from 'react-router-dom';
import { Main } from './pages/Main';
import { Room } from './pages/Room';
import { NotFound } from './pages/NotFound';

function App() {
	return (
		<Routes>
			<Route path="/" element={<Main />} />
			<Route path="/room:id" element={<Room />} />
			<Route element={<NotFound />} />
		</Routes>
	);
}

export default App;
