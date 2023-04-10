import socket from '../../socket';
import { useState, useEffect, useRef } from 'react';
import ACTIONS from '../../socket/actions';
import { v4 } from 'uuid';
import { useNavigate } from 'react-router';

export const Main = (): JSX.Element => {
	const [rooms, setRooms] = useState([]);
	const navigate = useNavigate();
	const rootNode = useRef();

	useEffect(() => {
		socket.on(ACTIONS.SHARE_ROOMS, ({ rooms = [] }) => {
			if (rootNode.current) {
				setRooms(rooms);
			}
		});
	}, []);

	return (
		<div ref={rootNode}>
			<h1>Available rooms</h1>
			<ul>
				{rooms.map(roomId => {
					return (
						<li key={roomId}>
							{roomId}
							<button
								onClick={() => {
									navigate(`/room/:${roomId}}`);
								}}
							>
								JOIN ROOM
							</button>
						</li>
					);
				})}
				<button
					onClick={() => {
						navigate(`/room/:${v4()}`);
					}}
				>
					Create new room
				</button>
			</ul>
		</div>
	);
};
