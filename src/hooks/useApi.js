import { useCallback, useEffect, useRef, useState } from 'react';

export default function useApi(fetchData, options = {}) {
  // This state stores the latest response so screens can render server data.
  const [data, setData] = useState(options.initialData ?? null);
  // This state shows when a request is still in progress.
  const [loading, setLoading] = useState(options.immediate !== false);
  // This state keeps a readable server or network error for the screen.
  const [error, setError] = useState(null);
  // This ref prevents a finished request from updating a screen after it closes.
  const isMounted = useRef(true);

  // This callback repeats the screen's request and updates its loading and error states.
  const refetch = useCallback(async () => {
    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await fetchData();
      if (isMounted.current) setData(result);
      return result;
    } catch (requestError) {
      if (isMounted.current) setError(requestError.message || 'The request failed. Please try again.');
      throw requestError;
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [fetchData]);

  // This effect loads the data when this hook is first used or its request changes.
  useEffect(() => {
    isMounted.current = true;
    if (options.immediate !== false) refetch().catch(() => {});
    return () => { isMounted.current = false; };
  }, [options.immediate, refetch]);

  return { data, loading, error, refetch };
}
