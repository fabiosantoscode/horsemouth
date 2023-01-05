export function getDefined<T>(arg: T | null | undefined, message?: string): T {
  if (arg == null) {
    throw new Error(message ?? "unexpected " + arg);
  }
  return arg;
}
