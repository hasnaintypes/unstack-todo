import { useState, useEffect, useCallback, useRef } from "react";

const LOCKOUT_SCHEDULE: Record<number, number> = {
  3: 15,
  6: 30,
  9: 60,
};

function getLockoutDuration(attempts: number): number {
  const thresholds = Object.keys(LOCKOUT_SCHEDULE)
    .map(Number)
    .sort((a, b) => b - a);
  for (const threshold of thresholds) {
    if (attempts >= threshold) return LOCKOUT_SCHEDULE[threshold];
  }
  return 0;
}

export function useAuthThrottle() {
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!lockedUntil) {
      setRemainingSeconds(0);
      return;
    }

    const tick = () => {
      const left = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (left <= 0) {
        setRemainingSeconds(0);
        setLockedUntil(null);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setRemainingSeconds(left);
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lockedUntil]);

  const canAttempt = remainingSeconds === 0;

  const recordFailure = useCallback(() => {
    setAttempts((prev) => {
      const next = prev + 1;
      const duration = getLockoutDuration(next);
      if (duration > 0) {
        setLockedUntil(Date.now() + duration * 1000);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAttempts(0);
    setLockedUntil(null);
    setRemainingSeconds(0);
  }, []);

  return { canAttempt, remainingSeconds, recordFailure, reset };
}
