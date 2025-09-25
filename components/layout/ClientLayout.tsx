"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/types";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Solo redirigir si no está cargando y no hay usuario en páginas protegidas
    if (
      !isLoading &&
      !currentUser &&
      pathname !== "/login" &&
      pathname !== "/register"
    ) {
      router.push("/login");
    }
  }, [currentUser, isLoading, pathname, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading && pathname !== "/login" && pathname !== "/register") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Permitir acceso a login/register sin usuario
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  // Si no hay usuario y no está en login/register, mostrar loading (será redirigido por el useEffect)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Sistema de Posts
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Hola, {currentUser.username}
              </span>
              <div className="flex space-x-2">
                <a
                  href="/posts"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Posts
                </a>
                <a
                  href="/users"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Usuarios
                </a>
                <a
                  href="/types"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Tipos
                </a>
                <a
                  href="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-primary-50 transition-colors"
                >
                  Mi Perfil
                </a>
                <button
                  onClick={() => {
                    localStorage.removeItem("currentUser");
                    setCurrentUser(null);
                    router.push("/login");
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
