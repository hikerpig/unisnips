type Many<T> = T | ReadonlyArray<T>

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: Array<Many<K>>,
): Pick<T, K> {
  return keys.reduce((out: any, k) => {
    out[k] = (obj as any)[k]
    return out
  }, {})
}
