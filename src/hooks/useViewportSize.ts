import { useState, useEffect } from 'react';

export const useViewportSize = <T extends HTMLElement>(ref: React.RefObject<T | null>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      setDimensions({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    });

    // Set initial size
    setDimensions({
      width: element.clientWidth,
      height: element.clientHeight,
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return dimensions;
}; 