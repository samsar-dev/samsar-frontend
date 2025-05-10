// hooks/usePrompt.ts
import { useCallback } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Blocks navigation and prompts user with a custom message if condition is true.
 * @param when - Whether to block navigation.
 * @param message - Confirmation message shown to the user.
 */
export function usePrompt(when: boolean, message: string) {
  useBlocker(
    useCallback(
      (_args: {
        currentLocation: any;
        nextLocation: any;
        historyAction: any;
      }) => {
        if (!when) return true;

        const confirmLeave = window.confirm(message);
        return confirmLeave;
      },
      [when, message],
    ),
  );
}
