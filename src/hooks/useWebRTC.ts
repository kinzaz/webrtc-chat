import { useRef, useEffect, useCallback } from 'react';
import useStateWithCallback from './useStateWithCallback';
import socket from '../socket';
import ACTIONS from '../socket/actions';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';

export default function useWebRTC(roomId: string | undefined) {
	const [clients, setClients] = useStateWithCallback([]);

	const addNewClient = useCallback(
		(newClient: any, cb: any) => {
			if (!clients.includes(newClient)) {
				setClients((list: any) => [...list, newClient], cb);
			}
		},
		[clients, setClients]
	);

	const peerConnections = useRef({});
	const localMediaStream = useRef(null);
	const peerMediaElements = useRef({
		[LOCAL_VIDEO]: null,
	});

	useEffect(() => {
		async function startCapture() {
			localMediaStream.current = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: {
					width: 1280,
					height: 720,
				},
			});
			addNewClient(LOCAL_VIDEO, () => {
				let localVideoEl: any = peerMediaElements.current[LOCAL_VIDEO];

				if (localVideoEl) {
					localVideoEl.volume = 0;
					localVideoEl.srcObject = localMediaStream.current;
				}
			});
		}
		startCapture()
			.then(() => socket.emit(ACTIONS.JOIN, { room: roomId }))
			.catch(e => console.error('Error getting userMedia', e));

		return () => {
			localMediaStream.current.getTracks().forEach(track => track.stop());
			socket.emit(ACTIONS.LEAVE);
		};
	}, [roomId]);

	const provideMediaRef = useCallback((id, node) => {
		peerMediaElements.current[id] = node;
	}, []);

	return { clients, provideMediaRef };
}
