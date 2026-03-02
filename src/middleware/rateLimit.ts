import type { Request, Response, NextFunction } from "express";

type Entry = { count: number; resetAt: number };

export function rateLimit(opts: { windowMs: number; max: number }) {
  const store = new Map<string, Entry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();

    const current = store.get(key);
    if (!current || now > current.resetAt) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > opts.max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ error: "Too many requests. Try again later." });
    }

    return next();
  };
}