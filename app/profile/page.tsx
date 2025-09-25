"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-64"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="rounded-full h-12 w-12 border-b-2 border-primary-600"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">Gestiona tu cuenta y configuración</p>
      </motion.div>

      {/* Información del usuario */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información de la cuenta
          </h2>
          <div className="space-y-3">
            {[
              { label: "Usuario:", value: currentUser.username },
              { label: "ID:", value: currentUser.id },
              {
                label: "Miembro desde:",
                value: new Date(currentUser.created_at).toLocaleDateString(),
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center py-2 border-b border-gray-100"
              >
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-900">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Cambiar contraseña */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cambiar Contraseña
          </h2>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {["currentPassword", "newPassword", "confirmPassword"].map(
              (field, index) => (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Input
                    label={
                      field === "currentPassword"
                        ? "Contraseña Actual *"
                        : field === "newPassword"
                        ? "Nueva Contraseña *"
                        : "Confirmar Nueva Contraseña *"
                    }
                    name={field}
                    type="password"
                    required
                    placeholder={
                      field === "currentPassword"
                        ? "Ingresa tu contraseña actual"
                        : field === "newPassword"
                        ? "Ingresa tu nueva contraseña"
                        : "Confirma tu nueva contraseña"
                    }
                    value={formData[field as keyof typeof formData]}
                    onChange={handleChange}
                  />
                </motion.div>
              )
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Cambiando contraseña..." : "Cambiar Contraseña"}
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>

      {/* Eliminar cuenta */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        whileHover={{ y: -2 }}
      >
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Zona Peligrosa
          </h2>
          <p className="text-red-700 mb-4">
            Eliminar tu cuenta es una acción permanente. Se eliminarán todos tus
            posts, comentarios y datos asociados.
          </p>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="w-full"
            >
              Eliminar Mi Cuenta
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
