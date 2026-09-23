import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Props = {
  product: { id: number; name: string; price: number; stock: number; imageUrl: string };
};

export default function ProductCard({ product }: Props) {
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {soldOut && (
          <span className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">품절</span>
        )}
      </div>
      <p className="mt-2 truncate text-sm text-gray-800">{product.name}</p>
      <p className="font-semibold">{formatPrice(product.price)}</p>
    </Link>
  );
}
