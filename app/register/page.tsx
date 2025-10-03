"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login?message=Usuario creado correctamente");
      } else {
        setError(data.error || "Error al crear usuario");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center">
          <motion.h2
            className="mt-6 text-3xl font-extrabold text-gray-900"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Crear Cuenta
          </motion.h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete a nuestra comunidad
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="p-6 shadow-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <Input
                  label="Usuario"
                  name="username"
                  type="text"
                  required
                  placeholder="Elige un nombre de usuario"
                  value={formData.username}
                  onChange={handleChange}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Contraseña"
                  name="password"
                  type="password"
                  required
                  placeholder="Crea una contraseña segura"
                  value={formData.password}
                  onChange={handleChange}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <motion.a
                  href="/login"
                  className="text-black hover:text-primary-500 text-sm font-medium"
                  whileHover={{ x: 2 }}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </motion.a>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
