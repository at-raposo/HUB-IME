'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to handle the browser/hardware back button to close modals.
 * 
 * @param isOpen - Whether the modal/overlay is currently open
 * @param onClose - Function to call when closing the modal
 */
export function useHistoryBack(isOpen: boolean, onClose: () => void) {
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        // Keyboard support: Close on Escape key
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCloseRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);
}
