export function getCliOptionsByDefault<T>(argv: any, defaultOptions: Partial<T>) {
  const options = { ...defaultOptions }
  Object.keys(defaultOptions).forEach((k: any) => {
    if (k in options) {
      if (argv[k] !== undefined) {
        ;(options as any)[k] = argv[k] as any
      }
    }
  })
  return options
}
