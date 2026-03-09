import { useState, useEffect } from 'react';

/**
 * Debounce a value, returning the last stable value after `delay` ms of inactivity.
 * @param {*} value
 * @param {number} delay  Milliseconds to wait (default 300).
 * @returns {*}
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
