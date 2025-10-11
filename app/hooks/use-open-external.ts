import { useCallback } from "react";

/**
 * Hook to open external links through the ChatGPT client
 * This ensures links open properly in the native environment
 * @returns A function to open external URLs
 */
export function useOpenExternal() {
  const openExternal = useCallback((href: string) => {
    if (typeof window !== "undefined" && window?.openai?.openExternal) {
      window.openai.openExternal({ href });
    } else if (typeof window !== "undefined") {
      // Fallback to window.open if not in ChatGPT context
      window.open(href, "_blank", "noopener,noreferrer");
    }
  }, []);

  return openExternal;
}

