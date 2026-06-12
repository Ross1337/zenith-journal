"use client";
import { useEffect } from "react";

/** Forces arctic theme on marketing pages regardless of user preference. */
export function ArcticThemeForcer() {
  useEffect(() => {
    const body = document.body;
    const prev = ["theme-cosmos", "theme-ember", "theme-arctic"].find((c) =>
      body.classList.contains(c)
    );
    body.classList.remove("theme-cosmos", "theme-ember", "theme-arctic");
    body.classList.add("theme-arctic");
    return () => {
      body.classList.remove("theme-arctic");
      if (prev) body.classList.add(prev);
    };
  }, []);
  return null;
}
