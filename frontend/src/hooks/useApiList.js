import { useCallback, useEffect, useState } from "react";

export function useApiList(fetcher) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((result) => {
        if (cancelled) return;
        setData(Array.isArray(result) ? result : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Unable to load records.");
        setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetcher();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Unable to load records.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  return { data, loading, error, reload };
}
