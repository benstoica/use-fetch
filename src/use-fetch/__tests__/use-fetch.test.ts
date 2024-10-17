import type { Mock } from "vitest";
import type { UseFetchOptions, UseFetchReturn } from "../use-fetch";
import { act, renderHook, waitFor } from "@testing-library/react";

import { beforeEach, describe, expect, test, vi } from "vitest";
import useFetch from "../use-fetch";

const mocks = {
  get fetch(): Mock {
    return globalThis.fetch as Mock;
  },
  set fetch(value) {
    globalThis.fetch = value;
  },
};

mocks.fetch = vi.fn();

describe("useFetch", () => {
  const url = "https://example.com/api/data";
  const data = { message: "Hello world!" };
  type Data = typeof data;

  beforeEach(() => {
    mocks.fetch.mockReset();
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(data),
    });
  });

  test("should fetch on mount by default", async () => {
    renderHook(() => useFetch<Data>(url));

    expect(mocks.fetch).toHaveBeenCalled();
  });

  test("should set loading when fetching data", async () => {
    const { result } = renderHook(() => useFetch<Data>(url));

    expect(result.current.loading).toBe(true);
    expect(mocks.fetch).toHaveBeenCalled();
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test("should set data after fetching", async () => {
    const { result } = renderHook(() => useFetch<Data>(url));

    expect(result.current.loading).toBe(true);
    expect(mocks.fetch).toHaveBeenCalled();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual(data);
  });

  test("doesn't fetch on mount if immediate is false", async () => {
    const { result } = renderHook(() =>
      useFetch<Data>(url, undefined, { immediate: false })
    );

    expect(result.current.loading).toBe(false);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  test("does not re-run if new options are passed in directly", () => {
    const initialProps = {
      url,
      requestOptions: {},
      options: { immediate: true },
    };

    const { rerender } = renderHook<
      UseFetchReturn<Data>,
      { url: string; requestOptions: RequestInit; options: UseFetchOptions }
    >(
      ({ url, requestOptions, options }) =>
        useFetch<Data>(url, requestOptions, options),
      { initialProps }
    );

    expect(mocks.fetch).toHaveBeenCalled();
    rerender({
      url: "https://example.com/api/data/new-url",
      requestOptions: {},
      options: { immediate: true },
    });
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });

  test("should set error is url passed is empty", () => {
    const { result } = renderHook(() => useFetch<Data>(""));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Empty URL");
    expect(result.current.data).toBe(null);
  });

  describe("error handling", () => {
    test("handling network errors", async () => {
      mocks.fetch.mockRejectedValue(new Error("Network Error"));

      const { result } = renderHook(() => useFetch<Data>(url));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Network Error");
      expect(result.current.data).toBe(null);
    });

    test("handles JSON parsing errors", async () => {
      mocks.fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error("JSON Error")),
      });

      const { result } = renderHook(() => useFetch<Data>(url));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("JSON Error");
      expect(result.current.data).toBe(null);
    });

    // test("handles http errors", async () => {
    //   mocks.fetch.mockResolvedValue({
    //     ok: false,
    //     statusText: "Not Found",
    //     status: 404,
    //     json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
    //   });

    //   const { result } = renderHook(() => useFetch<Data>(url));

    //   await waitFor(() => expect(result.current.loading).toBe(false));

    //   expect(result.current.error).toBe("Not Found");
    //   expect(result.current.data).toBe(null);
    // });
  });

  describe("update functions", () => {
    test("refetches when url is updated", async () => {
      const { result } = renderHook(() => useFetch<Data>(url));

      await waitFor(() => !result.current.loading);
      expect(result.current.data).toEqual(data);

      mocks.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: "New data" }),
      });

      act(() => result.current.updateUrl("https://example.com/api/other-data"));
      await waitFor(() => !result.current.loading);
      expect(mocks.fetch).toHaveBeenCalled();
      expect(result.current.data).toEqual({ message: "New data" });
    });

    test("refetches when request options are updated", async () => {
      const { result } = renderHook(() => useFetch<Data>(url));

      await waitFor(() => !result.current.loading);
      expect(result.current.data).toEqual(data);

      mocks.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: "New data" }),
      });

      act(() =>
        result.current.updateRequestOptions({
          headers: {
            Authorization: "Bearer test-token",
          },
        })
      );
      await waitFor(() => !result.current.loading);
      expect(mocks.fetch).toHaveBeenCalled();
      expect(result.current.data).toEqual({ message: "New data" });
    });

    test("refetches when options are updated", async () => {
      const { result } = renderHook(() =>
        useFetch<Data>(url, {}, { immediate: false })
      );

      expect(result.current.loading).toBe(false);
      expect(mocks.fetch).not.toHaveBeenCalled();

      act(() => result.current.updateOptions({ immediate: true }));

      await waitFor(() => !result.current.loading);
      expect(mocks.fetch).toHaveBeenCalled();
      expect(result.current.data).toEqual(data);
    });

    test("should refetch when load function is called", async () => {
      const { result } = renderHook(() => useFetch<Data>(url));
      await waitFor(() => !result.current.loading);
      expect(result.current.data).toEqual(data);

      mocks.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: "New data" }),
      });

      await act(() => result.current.load());
      await waitFor(() => !result.current.loading);
      expect(mocks.fetch).toHaveBeenCalled();
      expect(result.current.data).toEqual({ message: "New data" });
    });
  });

  describe("multiple requests", () => {
    test("should clear existing data if load function is called", async () => {
      const { result } = renderHook(() => useFetch<Data>(url));
      await waitFor(() => !result.current.loading);
      expect(result.current.data).toEqual(data);

      mocks.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi
          .fn()
          .mockReturnValue(
            new Promise((resolve) =>
              setImmediate(() => resolve({ message: "New data again" }))
            )
          ),
      });

      await act(async () => {
        result.current.load();
        setImmediate(() => {
          expect(result.current.data).toBe(null);
        });
      });

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mocks.fetch).toHaveBeenCalled();
      expect(result.current.data).toEqual({ message: "New data again" });
    });

    test("should clear existing error if load function is called", async () => {
      mocks.fetch.mockRejectedValueOnce(new Error("Network Error"));
      const { result } = renderHook(() => useFetch<Data>(url));
      await waitFor(() => !result.current.loading);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe("Network Error");

      mocks.fetch.mockResolvedValueOnce({
        ok: true,
        json: vi
          .fn()
          .mockReturnValue(
            new Promise((resolve) =>
              setImmediate(() => resolve({ message: "New data!" }))
            )
          ),
      });

      await act(async () => {
        result.current.load();
        setImmediate(() => {
          expect(result.current.error).toBe(null);
        });
      });

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mocks.fetch).toHaveBeenCalled();
      expect(result.current.data).toEqual({ message: "New data!" });
    });
  });
});
