// FILE PATH: src/components/store/ClearStoreCart.tsx
"use client";
import { useEffect } from "react";
import { clearStoreCartForPaidSession } from "./cart";

/** Rendered only on the success page after Stripe confirms payment. Renders nothing. */
export default function ClearStoreCart({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    clearStoreCartForPaidSession(sessionId);
  }, [sessionId]);
  return null;
}