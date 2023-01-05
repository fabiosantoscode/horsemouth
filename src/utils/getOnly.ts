export function getOnly<T>(array: T[]): T {
  if (array.length !== 1) {
    throw new Error("expected array to have length 1");
  }
  return array[0];
}
