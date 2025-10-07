import type { AppProps } from "next/app";
import React, { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const pref = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (pref === "dark") document.documentElement.classList.add("dark");
  }, []);

  return <Component {...pageProps} mounted={mounted} />;
}


