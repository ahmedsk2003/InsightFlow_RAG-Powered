export function fakeEmbedding(dim = 384) {
  return Array.from({ length: dim }, () => Math.random());
}
