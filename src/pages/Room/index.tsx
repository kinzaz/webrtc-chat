import { useParams } from 'react-router';
import useWebRTC, { LOCAL_VIDEO } from '../../hooks/useWebRTC';

export const Room = (): JSX.Element => {
	const { id: roomId } = useParams();
	const { clients, provideMediaRef } = useWebRTC(roomId);
	return (
		<div>
			{clients.map(clientId => {
				return (
					<div key={clientId}>
						<video
							ref={instance => {
								provideMediaRef(clientId, instance);
							}}
							autoPlay
							playsInline
							muted={clientId === LOCAL_VIDEO}
						/>
					</div>
				);
			})}
		</div>
	);
};
