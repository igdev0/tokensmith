export function truncatePubKey(str: string) {
  const firstPart = str.slice(0, 4);
  const secondPart = str.slice(-4);
  return `${firstPart}..${secondPart}`;
}


export function removeRef(data: object) {
  return JSON.parse(JSON.stringify(data));
}