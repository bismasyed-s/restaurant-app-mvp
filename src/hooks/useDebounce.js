import { useEffect, useState } from 'react';

export default function useDebounce(value, delay) {
  // This state keeps the value after the user has stopped changing it.
  const [debouncedValue, setDebouncedValue] = useState(value);

  // This effect waits for the delay and cancels an old wait when the value changes.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
