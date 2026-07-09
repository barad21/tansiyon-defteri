import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface ElementSize {
  width: number;
  height: number;
}

export function useElementSize<T extends HTMLElement>(
  ref: RefObject<T | null>,
): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize({
        width: Math.round(width),
        height: Math.round(height),
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref]);

  return size;
}
