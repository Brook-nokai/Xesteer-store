import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Category } from "@shared/schema";

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [location, setLocation] = useLocation();
  const currentCategory = location.split("/")[2];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 p-4">
        <Button
          variant={!currentCategory ? "default" : "outline"}
          className="bg-[#4e0000]"
          onClick={() => setLocation("/")}
        >
          Todos
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={currentCategory === category.slug ? "default" : "outline"}
            className={currentCategory === category.slug ? "bg-[#4e0000]" : ""}
            onClick={() => setLocation(`/category/${category.slug}`)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
