import { useEffect, useState } from "react";

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle(value, delay) {
  const [throttledValue, setThrottledValue] = useState(value);
  const [lastRun, setLastRun] = useState(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun >= delay) {
        setThrottledValue(value);
        setLastRun(Date.now());
      }
    }, delay - (Date.now() - lastRun));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, lastRun]);

  return throttledValue;
}
