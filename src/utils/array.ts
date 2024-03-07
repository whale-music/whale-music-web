export function toArray<T>(arr: T | T[]): T[] {
  const val = new Array<T>();
  return val.concat(arr);
}
