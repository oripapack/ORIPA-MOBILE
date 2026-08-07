declare module '*.jpg' {
  const source: number | string | { uri: string };
  export default source;
}

declare module '*.jpeg' {
  const source: number | string | { uri: string };
  export default source;
}

declare module '*.png' {
  const source: number | string | { uri: string };
  export default source;
}
