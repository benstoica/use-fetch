import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export type UseFetchOptions = {
  immediate: boolean;
};

export type UseFetchReturn<T> = {
  loading: boolean;
  error: string | null;
  data: T | null;
  url: string;
  load: () => Promise<void>;
  updateUrl: Dispatch<SetStateAction<string>>;
  updateOptions: Dispatch<SetStateAction<UseFetchOptions>>;
  updateRequestOptions: Dispatch<SetStateAction<RequestInit | undefined>>;
};

export default function useFetch<T>(
  initialUrl: string,
  initialRequestOptions?: RequestInit,
  initialOptions?: UseFetchOptions
): UseFetchReturn<T> {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [options, setOptions] = useState(initialOptions || { immediate: true });
  const [requestOptions, setRequestOptions] = useState(initialRequestOptions);
  const [url, setUrl] = useState(initialUrl);
  const abortController = useRef(new AbortController());

  const load = useCallback(async () => {
    abortController.current.abort();
    abortController.current = new AbortController();
    setData(null);

    if (!url) {
      setError("Empty URL");
      return;
    } else {
      setError(null);
    }

    setLoading(true);
    try {
      const requestInit = requestOptions || {};
      requestInit.signal = abortController.current.signal;
      const currentAbortController = abortController.current;
      const response = await fetch(url, requestInit);
      const json = await response.json();
      if (currentAbortController.signal.aborted) {
        return;
      }
      setData(json);
    } catch (e) {
      const error = e as Error;
      if (error.name === "AbortError") {
        setData(null);
        setError(null);
      } else {
        setError(error.message);
      }
    }
    setLoading(false);
  }, [url, requestOptions]);

  useEffect(() => {
    if (options.immediate) {
      load();
    }

    return () => {
      abortController.current.abort();
    };
  }, [load, options]);

  return {
    url,
    loading,
    error,
    data,
    load,
    updateUrl: setUrl,
    updateOptions: setOptions,
    updateRequestOptions: setRequestOptions,
  };
}
