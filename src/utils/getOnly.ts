export function getOnly<T>(iter: Iterable<T>): T {
  const array = [...iter]
  if (array.length !== 1) {
    throw new Error("expected array to have length 1");
  }
  return array[0];
}
