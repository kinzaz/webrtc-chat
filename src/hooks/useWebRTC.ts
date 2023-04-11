import { useRef, useEffect, useCallback } from 'react';
import useStateWithCallback from './useStateWithCallback';
import socket from '../socket';
import ACTIONS from '../socket/actions';
import freeice from 'freeice';

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
		async function handleNewPeer({ peerId, createOffer }) {
			if (peerId in peerConnections.current) {
				return console.warn(`Already connected to peer ${peerId}`);
			}
			peerConnections.current[peerId] = new RTCPeerConnection({
				iceServers: freeice(),
			});
			peerConnections.current[peerId].onicecandidate = e => {
				if (e.candidate) {
					socket.emit(ACTIONS.RELAY_ICE, {
						peerId,
						iceCandidate: e.candidate,
					});
				}
			};

			let tracksNumber = 0;
			peerConnections.current[peerId].ontrack = ({
				streams: [remoteStream],
			}) => {
				tracksNumber++;
				if (tracksNumber == 2) {
					// video & audio
					addNewClient(peerId, () => {
						peerMediaElements.current[peerId].srcObject = remoteStream;
					});
				}
			};

			localMediaStream.current.getTracks().forEach(track => {
				peerConnections.current[peerId].addTrack(
					track,
					localMediaStream.current
				);
			});

			if (createOffer) {
				const offer = await peerConnections.current[peerId].createOffer();
				await peerConnections.current[peerId].setLocalDescription(offer);
				socket.emit(ACTIONS.RELAY_SDP, {
					peerId,
					sessionDescription: offer,
				});
			}
		}
		socket.on(ACTIONS.ADD_PEER, handleNewPeer);
	}, []);

	useEffect(() => {
		socket.on(ACTIONS.REMOVE_PEER, ({ peerId }) => {
			if (peerConnections.current[peerId]) {
				peerConnections.current[peerId].close();
			}
			delete peerConnections.current[peerId];
			delete peerMediaElements.current[peerId];

			setClients(list => list.filter(c => c !== peerId));
		});
	}, []);

	useEffect(() => {
		async function setRemoteMedia({
			peerId,
			sessionDescription: remoteDescription,
		}) {
			await peerConnections.current[peerId].setRemoteDescription(
				new RTCSessionDescription(sessionDescription)
			);
			if (remoteDescription.type === 'offer') {
				const answer = await peerConnections.current[peerId].createAnswer();
				await peerConnections.current[peerId].setLocalDescription(answer);
				socket.emit(ACTIONS.RELAY_SDP, {
					peerId,
					sessionDescription: answer,
				});
			}
		}
		socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
	}, []);

	useEffect(() => {
		socket.on(ACTIONS.ICE_CANDIDATE, ({ peerId, iceCandidate }) => {
			peerConnections.current[peerId].addIceCandidate(
				new RTCIceCandidate(iceCandidate)
			);
		});
	}, []);

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
