import { useEffect, useMemo, useState } from "react";

export function useCountdown(initialSeconds = 0) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  const isRunning = useMemo(() => secondsLeft > 0, [secondsLeft]);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  return { secondsLeft, isRunning };
}
