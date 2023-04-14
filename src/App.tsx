import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { NotFound } from './pages/NotFound';
import Main from './pages/Main';
import Room from './pages/Room';

function App() {
	return (
		<BrowserRouter>
			<Switch>
				<Route exact path="/room/:id" component={Room} />
				<Route exact path="/" component={Main} />
				<Route component={NotFound} />
			</Switch>
		</BrowserRouter>
	);
}

export default App;
