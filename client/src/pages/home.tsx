import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { CategoryList } from "@/components/CategoryList";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Product, Category } from "@shared/schema";

export default function Home() {
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-red-900 mb-8">
          Contas Blox Fruits Verificadas
        </h1>
        
        {categoriesLoading ? (
          <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <CategoryList categories={categories || []} />
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
            ))
          ) : (
            products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
