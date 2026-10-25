export type ThemeMode = 'auto' | 'light' | 'dark';

export const themeStorageKey = 'theme';

export function themeMode(value: string | null): ThemeMode {
  return value === 'light' || value === 'dark' ? value : 'auto';
}

export function isDarkTheme(mode: ThemeMode, systemDark: boolean): boolean {
  return mode === 'dark' || (mode === 'auto' && systemDark);
}

// Runs before first paint. Keep in sync with isDarkTheme, and keep its sha256 in public/_headers.
export const themeBootScript = `(()=>{try{var r=document.documentElement,t=localStorage.getItem(${JSON.stringify(themeStorageKey)}),m=t==="light"||t==="dark"?t:"auto";r.dataset.theme=m;r.classList.toggle("dark",m==="dark"||(m==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches));}catch{}})();`;
