import { useState, useRef, useCallback, useEffect } from 'react';

export default function useStateWithCallback(initialState) {
	const [state, setState] = useState(initialState);
	const cbRef = useRef(null);

	const updateState = useCallback((newState: any, cb: any) => {
		cbRef.current = cb;
		setState((prev: any) =>
			typeof newState === 'function' ? newState(prev) : newState
		);
	}, []);

	useEffect(() => {
		if (cbRef.current) {
			cbRef.current = state;
			cbRef.current = null;
		}
	}, [state]);

	return [state, updateState];
}
