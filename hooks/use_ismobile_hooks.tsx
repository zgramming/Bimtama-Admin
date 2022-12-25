import { useEffect, useState } from "react";

const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);
	const mobileBreakpoint = 768;
	const setWidthHandler = () => {
		window.addEventListener('resize', () => {
			setIsMobile(window.innerWidth <= mobileBreakpoint)
		})
	}
	useEffect(() => {
		window.addEventListener('resize', setWidthHandler)
		return () => {
			window.removeEventListener('resize', setWidthHandler)
		}
	}, [])

	return isMobile;

}

export default useIsMobile;