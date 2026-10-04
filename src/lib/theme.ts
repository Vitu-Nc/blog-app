export type ThemeChoice = "system" | "default" | "dark" | "sepia" | "custom";

export const themeStorageKey = "personal-blog-theme";

export function deriveCustomThemeColors(background: string) {
  if (!/^#[\da-f]{6}$/i.test(background)) {
    throw new Error("Custom theme background must be a six-digit hex color.");
  }

  function channels(hex: string) {
    return [1, 3, 5].map((offset) =>
      Number.parseInt(hex.slice(offset, offset + 2), 16),
    );
  }

  function luminance(hex: string) {
    const [red, green, blue] = channels(hex).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }

  function contrast(first: string, second: string) {
    const firstLuminance = luminance(first);
    const secondLuminance = luminance(second);

    return (
      (Math.max(firstLuminance, secondLuminance) + 0.05) /
      (Math.min(firstLuminance, secondLuminance) + 0.05)
    );
  }

  function mix(first: string, second: string, amount: number) {
    const firstChannels = channels(first);
    const secondChannels = channels(second);
    const mixedChannels = firstChannels.map((channel, index) =>
      Math.round(channel + (secondChannels[index] - channel) * amount),
    );

    return `#${mixedChannels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }

  const black = "#000000";
  const white = "#ffffff";
  const foreground =
    contrast(black, background) >= contrast(white, background) ? black : white;

  let muted = foreground;
  let low = 0;
  let high = 1;

  for (let iteration = 0; iteration < 24; iteration += 1) {
    const amount = (low + high) / 2;
    const candidate = mix(foreground, background, amount);

    if (contrast(candidate, background) >= 4.5) {
      muted = candidate;
      low = amount;
    } else {
      high = amount;
    }
  }

  while (contrast(muted, background) < 4.5 && low > 0) {
    low = Math.max(0, low - 0.001);
    muted = mix(foreground, background, low);
  }

  return {
    background: background.toLowerCase(),
    foreground,
    muted,
    subtle: muted,
    border: mix(background, foreground, 0.16),
    accent: foreground,
    selection: mix(background, foreground, 0.2),
  };
}

export const themeBootstrapScript = `(() => {
  const root = document.documentElement;
  const clearCustomColors = () => {
    for (const name of ["--bg", "--fg", "--muted", "--subtle", "--border", "--accent", "--selection"]) {
      root.style.removeProperty(name);
    }
  };

  try {
    const saved = localStorage.getItem("${themeStorageKey}");

    if (saved === "default" || saved === "dark" || saved === "sepia") {
      clearCustomColors();
      root.dataset.theme = saved;
    } else if (saved && saved.startsWith("custom:")) {
      const background = saved.slice("custom:".length);
      const deriveCustomThemeColors = ${deriveCustomThemeColors.toString()};

      if (/^#[\\da-f]{6}$/i.test(background)) {
        const colors = deriveCustomThemeColors(background);
        root.dataset.theme = "custom";
        root.style.setProperty("--bg", colors.background);
        root.style.setProperty("--fg", colors.foreground);
        root.style.setProperty("--muted", colors.muted);
        root.style.setProperty("--subtle", colors.subtle);
        root.style.setProperty("--border", colors.border);
        root.style.setProperty("--accent", colors.accent);
        root.style.setProperty("--selection", colors.selection);
      }
    } else {
      clearCustomColors();
      root.removeAttribute("data-theme");
    }
  } catch (error) {
    console.warn("Unable to restore the saved theme; using the system color scheme.", error);
    clearCustomColors();
    root.removeAttribute("data-theme");
  }
})();`;
