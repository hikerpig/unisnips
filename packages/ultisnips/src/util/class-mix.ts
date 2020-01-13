/* eslint-disable  */
function ownKeys(obj: any) {
  let getOwnKeys
  if (typeof Reflect === 'object' && typeof Reflect.ownKeys === 'function') {
    getOwnKeys = Reflect.ownKeys
  } else if (typeof Object.getOwnPropertySymbols === 'function') {
    getOwnKeys = function Reflect_ownKeys(o: any) {
      return Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o) as any[])
    }
  } else {
    getOwnKeys = Object.getOwnPropertyNames
  }

  return getOwnKeys(obj)
}

function copyProperties(target: any, source: any, isProto = false) {
  for (const key of ownKeys(source)) {
    if (isProto && key in target) continue
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      const desc = Object.getOwnPropertyDescriptor(source, key)
      if (desc) {
        Object.defineProperty(target, key, desc)
      }
    }
  }
}

type Ctor<T, S> = { new(...args: any[]): T } & S;

export function mix<T, TS, U, US, W, WS>(c1: Ctor<T, TS>, c2?: Ctor<U, US>, c3?: Ctor<W, WS>): Ctor<T & U & W, TS & US & WS>
export function mix(...mixins: any[]) {
  const constructors: any[] = []
  class Mix {
    constructor(...args: any[]) {
      constructors.forEach(constr => {
        constr.apply(this, args)
      })
    }
  }

  for (const mixin of mixins) {
    copyProperties(Mix, mixin)
  }
  return Mix
}
/* eslint-enable  */
