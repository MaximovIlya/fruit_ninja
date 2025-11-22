import { type RefObject, useEffect } from 'react';

export const usePinchToClick = <T extends HTMLElement>(
  elementRef: RefObject<T>,
  onClick: () => void,
  isActive: boolean = true
) => {
  useEffect(() => {
    const handlePinch = (event: Event) => {
      if (!isActive || !elementRef.current) {
        return;
      }

      const { x, y } = (event as CustomEvent).detail;
      const elementRect = elementRef.current.getBoundingClientRect();

      if (
        x >= elementRect.left &&
        x <= elementRect.right &&
        y >= elementRect.top &&
        y <= elementRect.bottom
      ) {
        onClick();
      }
    };

    window.addEventListener('pinch', handlePinch);

    return () => {
      window.removeEventListener('pinch', handlePinch);
    };
  }, [elementRef, onClick, isActive]);
}; 