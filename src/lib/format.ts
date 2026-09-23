// 19000 -> "19,000원"
export function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}
