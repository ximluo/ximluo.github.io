export function isGifSource(source: string) {
  return /\.gif(?:$|[?#])/i.test(source)
}
