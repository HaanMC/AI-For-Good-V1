export const envString = (name: string, fallback: string): string => {
  return (process.env[name] ?? fallback).toString();
};

export const envInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) ? value : fallback;
};
