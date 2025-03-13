import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { AuthUser, isAdmin, isOwner } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MainLayout } from "./MainLayout";
import { DISCORD_URL } from "@/lib/constants";
import { HelpCircle } from "lucide-react";

const navigation = [
  { name: "Produtos", href: "/admin/products" },
  { name: "Categorias", href: "/admin/categories" },
  { name: "Pedidos", href: "/admin/orders" }
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"]
  });

  if (!isAdmin(user)) {
    return <div>Acesso negado</div>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "outline"}
                  className={cn(
                    location === item.href && "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            {isOwner(user) && (
              <Link href="/admin/settings">
                <Button
                  variant={location === "/admin/settings" ? "default" : "outline"}
                  className={cn(
                    location === "/admin/settings" && "bg-red-600 hover:bg-red-700"
                  )}
                >
                  Configurações
                </Button>
              </Link>
            )}
          </div>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <HelpCircle className="w-5 h-5" />
            Suporte
          </a>
        </div>
        {children}
      </div>
    </MainLayout>
  );
}