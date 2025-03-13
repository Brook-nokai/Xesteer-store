import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AuthUser, discordLogin, googleLogin, logout } from "@/lib/auth";
import { SITE_NAME, DISCORD_URL } from "@/lib/constants";
import { SiDiscord } from "react-icons/si";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    retry: false
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        Contas de Blox Fruits verificadas (100% testadas), sem problemas de verificação.
      </div>

      <header className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold text-red-600">{SITE_NAME}</a>
          </Link>

          <div className="flex items-center gap-4">
            <a 
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-gray-300"
            >
              <SiDiscord className="w-6 h-6" />
              Discord
            </a>

            {user ? (
              <>
                {user.role !== "user" && (
                  <Link href="/admin/products">
                    <Button variant="outline">Admin</Button>
                  </Link>
                )}
                <Button onClick={logout} variant="destructive">Sair</Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button onClick={discordLogin} className="bg-[#5865F2] hover:bg-[#4752C4]">
                  <SiDiscord className="mr-2" /> Discord
                </Button>
                <Button onClick={googleLogin} variant="outline">
                  Google
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-180px)]">{children}</main>

      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}