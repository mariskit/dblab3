"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Verificar si ya está autenticado
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      router.push("/posts");
    }
    setAuthChecked(true);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar usuario en localStorage
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        // Forzar recarga de la página para asegurar que los datos se carguen correctamente
        window.location.href = "/posts";
      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>

        <Card className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-black px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Input
              label="Usuario"
              name="username"
              type="text"
              required
              placeholder="Ingresa tu usuario"
              value={formData.username}
              onChange={handleChange}
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              required
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleChange}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            <div className="text-center">
              <a
                href="/register"
                className="text-black hover:text-primary-500 text-sm font-medium"
              >
                ¿No tienes cuenta? Regístrate
              </a>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
