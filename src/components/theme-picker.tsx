"use client";

import { useState, useSyncExternalStore } from "react";
import {
  deriveCustomThemeColors,
  themeStorageKey,
  type ThemeChoice,
} from "@/lib/theme";

const presets = [
  { choice: "system", label: "System" },
  { choice: "default", label: "Default" },
  { choice: "dark", label: "Dark" },
  { choice: "sepia", label: "Sepia" },
] as const;

const themeChangeEvent = "blog-theme-change";
const defaultCustomBackground = "#e8dfcc";

function subscribeToTheme(callback: () => void) {
  window.addEventListener(themeChangeEvent, callback);
  return () => window.removeEventListener(themeChangeEvent, callback);
}

function getThemeSnapshot() {
  const root = document.documentElement;

  if (root.getAttribute("data-theme") === "custom") {
    return `custom:${root.style.getPropertyValue("--bg") || defaultCustomBackground}`;
  }

  return root.getAttribute("data-theme") ?? "system";
}

function getServerThemeSnapshot() {
  return "system";
}

function isThemeChoice(value: string): value is ThemeChoice {
  return ["system", "default", "dark", "sepia", "custom"].includes(value);
}

export function ThemePicker() {
  const themeSnapshot = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const choice: ThemeChoice = themeSnapshot.startsWith("custom:")
    ? "custom"
    : isThemeChoice(themeSnapshot)
      ? themeSnapshot
      : "system";
  const customBackground = themeSnapshot.startsWith("custom:")
    ? themeSnapshot.slice("custom:".length)
    : defaultCustomBackground;
  const [storageError, setStorageError] = useState(false);

  function setTheme(nextChoice: ThemeChoice, background?: string) {
    const root = document.documentElement;

    for (const name of [
      "--bg",
      "--fg",
      "--muted",
      "--subtle",
      "--border",
      "--accent",
      "--selection",
    ]) {
      root.style.removeProperty(name);
    }

    if (nextChoice === "system") {
      root.removeAttribute("data-theme");
      try {
        localStorage.removeItem(themeStorageKey);
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
      window.dispatchEvent(new Event(themeChangeEvent));
      return;
    }

    root.setAttribute("data-theme", nextChoice);

    if (nextChoice === "custom" && background) {
      const colors = deriveCustomThemeColors(background);

      for (const [name, value] of Object.entries({
        "--bg": colors.background,
        "--fg": colors.foreground,
        "--muted": colors.muted,
        "--subtle": colors.subtle,
        "--border": colors.border,
        "--accent": colors.accent,
        "--selection": colors.selection,
      })) {
        root.style.setProperty(name, value);
      }
    }

    try {
      localStorage.setItem(
        themeStorageKey,
        nextChoice === "custom" && background
          ? `custom:${background}`
          : nextChoice,
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  function updateCustomBackground(background: string) {
    setTheme("custom", background);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <fieldset className="flex flex-wrap items-center gap-1">
        <legend className="sr-only">Color theme</legend>
        {presets.map((preset) => (
          <button
            key={preset.choice}
            type="button"
            aria-pressed={choice === preset.choice}
            onClick={() => setTheme(preset.choice)}
            className="text-muted hover:bg-border/50 aria-pressed:bg-fg aria-pressed:text-bg rounded-md px-2 py-1"
          >
            {preset.label}
          </button>
        ))}
      </fieldset>
      <label className="text-muted flex items-center gap-2 rounded-md px-2 py-1">
        <span>Custom</span>
        <input
          type="color"
          aria-label="Custom background color"
          value={customBackground}
          onChange={(event) => updateCustomBackground(event.target.value)}
          onFocus={() => {
            if (choice !== "custom") {
              updateCustomBackground(customBackground);
            }
          }}
          className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </label>
      {storageError && (
        <p role="status" className="text-muted w-full text-xs">
          Theme storage is unavailable; this choice will last until you leave
          the page.
        </p>
      )}
    </div>
  );
}
