import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { CheckoutButton } from "./CheckoutButton";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discountBadge = product.discountPercentage ? (
    <Badge variant="secondary" className="absolute top-2 right-2 bg-red-500 text-white">
      {product.discountPercentage}% OFF
    </Badge>
  ) : null;

  const features = [];
  if (product.hasGodhuman) features.push('GHM');
  if (product.hasSoulGuitar) features.push('SOUL GUITAR');
  if (product.hasCdk) features.push('CDK');
  if (product.race) features.push(`V4 ${product.race}`);
  if (product.level) features.push(`LVL ${product.level}`);

  return (
    <Card className="overflow-hidden bg-black border-gray-800">
      <CardContent className="p-0">
        <div className="aspect-square relative">
          {discountBadge}
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-4 text-white">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">
            {features.length > 0 ? `〔${features.join(' + ')}〕` : ''} {product.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {product.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex flex-col">
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              R$ {(product.originalPrice / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
          <span className="font-bold text-xl text-red-600">
            R$ {(product.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          {product.discountPercentage && (
            <span className="text-sm text-gray-400">
              À vista no PIX
            </span>
          )}
        </div>
        <CheckoutButton product={product} />
      </CardFooter>
    </Card>
  );
}