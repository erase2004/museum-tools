export function toDBName(n: number | string) {
  return `museum-${n}`;
}

export function toRoundName(n: number | string) {
  return `round${n}`;
}

export function typedObjectKeys<T extends object>(obj: T) {
  return Object.keys(obj) as [keyof typeof obj];
}
