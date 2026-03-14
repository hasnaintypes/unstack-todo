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
  const attemptsRef = useRef(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;

    const id = setInterval(() => {
      const left = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (left <= 0) {
        setRemainingSeconds(0);
        setLockedUntil(null);
      } else {
        setRemainingSeconds(left);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const canAttempt = remainingSeconds === 0;

  const recordFailure = useCallback(() => {
    attemptsRef.current += 1;
    const duration = getLockoutDuration(attemptsRef.current);
    if (duration > 0) {
      const target = Date.now() + duration * 1000;
      setLockedUntil(target);
      setRemainingSeconds(duration);
    }
  }, []);

  const reset = useCallback(() => {
    attemptsRef.current = 0;
    setLockedUntil(null);
    setRemainingSeconds(0);
  }, []);

  return { canAttempt, remainingSeconds, recordFailure, reset };
}
