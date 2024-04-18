export const capitalize = (str: string) =>
  str
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

export const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
