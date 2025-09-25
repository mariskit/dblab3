"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las nuevas contraseñas no coinciden");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Contraseña cambiada exitosamente");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se eliminarán todos tus posts y comentarios."
      )
    ) {
      return;
    }

    if (
      !prompt(
        'Escribe "ELIMINAR" para confirmar la eliminación de tu cuenta:'
      ) === "ELIMINAR"
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        localStorage.removeItem("currentUser");
        router.push("/login");
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar la cuenta");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error al eliminar la cuenta");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Gestiona tu cuenta y configuración</p>
      </div>

      {/* Información del usuario */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Información de la cuenta
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Usuario:</span>
            <span className="text-gray-900">{currentUser.username}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">ID:</span>
            <span className="text-gray-900">{currentUser.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Miembro desde:</span>
            <span className="text-gray-900">
              {new Date(currentUser.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Cambiar contraseña */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Cambiar Contraseña
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Contraseña Actual *"
            name="currentPassword"
            type="password"
            required
            placeholder="Ingresa tu contraseña actual"
            value={formData.currentPassword}
            onChange={handleChange}
          />

          <Input
            label="Nueva Contraseña *"
            name="newPassword"
            type="password"
            required
            placeholder="Ingresa tu nueva contraseña"
            value={formData.newPassword}
            onChange={handleChange}
          />

          <Input
            label="Confirmar Nueva Contraseña *"
            name="confirmPassword"
            type="password"
            required
            placeholder="Confirma tu nueva contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Cambiando contraseña..." : "Cambiar Contraseña"}
          </Button>
        </form>
      </Card>

      {/* Eliminar cuenta */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h2 className="text-xl font-semibold text-red-900 mb-2">
          Zona Peligrosa
        </h2>
        <p className="text-red-700 mb-4">
          Eliminar tu cuenta es una acción permanente. Se eliminarán todos tus
          posts, comentarios y datos asociados.
        </p>

        <Button
          variant="danger"
          onClick={handleDeleteAccount}
          className="w-full"
        >
          Eliminar Mi Cuenta
        </Button>
      </Card>
    </div>
  );
}
