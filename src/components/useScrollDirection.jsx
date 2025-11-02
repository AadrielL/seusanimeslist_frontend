// src/components/useScrollDirection.js (ou .jsx)
import { useState, useEffect } from 'react';

const useScrollDirection = () => {
    const [scrollDir, setScrollDir] = useState("up");
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const updateScrollDir = () => {
            const { scrollY } = window;
            const direction = scrollY > lastScrollY ? "down" : "up";

            // Atualiza a direção se:
            // 1. A direção mudou E a rolagem foi significativa (> 5px)
            // OU
            // 2. A posição atual é o topo da página (scrollY === 0)
            if ((direction !== scrollDir && Math.abs(lastScrollY - scrollY) > 5) || scrollY === 0) {
                setScrollDir(direction);
            }
            setLastScrollY(scrollY > 0 ? scrollY : 0);
        };

        const onScroll = () => window.requestAnimationFrame(updateScrollDir);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [lastScrollY, scrollDir]);

    return scrollDir;
};

// 🛑 ADICIONE ESTA LINHA:
export default useScrollDirection;