export function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * 3000) + 2000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
