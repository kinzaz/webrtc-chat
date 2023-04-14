import { useParams } from 'react-router';
import { LOCAL_VIDEO, useWebRTC } from '../../hooks/useWebRTC';

function layout(clientsNumber = 1) {
	const pairs: any = Array.from({ length: clientsNumber }).reduce(
		(acc: any, next: any, index: any, arr: any) => {
			if (index % 2 === 0) {
				acc.push(arr.slice(index, index + 2));
			}

			return acc;
		},
		[]
	);

	const rowsNumber = pairs.length;
	const height = `${100 / rowsNumber}%`;

	return pairs
		.map((row: any, index: any, arr: any) => {
			if (index === arr.length - 1 && row.length === 1) {
				return [
					{
						width: '100%',
						height,
					},
				];
			}

			return row.map(() => ({
				width: '50%',
				height,
			}));
		})
		.flat();
}

export default function Room() {
	const { id: roomID } = useParams<any>();
	const { clients, provideMediaRef } = useWebRTC(roomID);
	const videoLayout = layout(clients.length);

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexWrap: 'wrap',
				height: '100vh',
			}}
		>
			{clients.map((clientID: any, index: any) => {
				return (
					<div key={clientID} style={videoLayout[index]} id={clientID}>
						<video
							width="100%"
							height="100%"
							ref={instance => {
								provideMediaRef(clientID, instance);
							}}
							autoPlay
							playsInline
							muted={clientID === LOCAL_VIDEO}
						/>
					</div>
				);
			})}
		</div>
	);
}
