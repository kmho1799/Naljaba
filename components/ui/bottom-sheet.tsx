"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (open) {
      panel.removeAttribute("inert");
    } else {
      panel.setAttribute("inert", "");
    }
  }, [open]);

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl bg-white shadow-xl transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
      >
        {children}
      </div>
    </>
  );
}
