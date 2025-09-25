"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

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
        localStorage.setItem("currentUser", JSON.stringify(data.user));
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

  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-primary-600"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants} className="max-w-md w-full space-y-8">
        <motion.div variants={itemVariants} className="text-center">
          <motion.h2
            className="mt-6 text-4xl font-extrabold text-gray-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Iniciar Sesión
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Accede a tu cuenta para continuar
          </motion.p>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <Input
                  label="Usuario"
                  name="username"
                  type="text"
                  required
                  placeholder="Ingresa tu usuario"
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
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3"
                  >
                    {loading ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Iniciando sesión...
                      </motion.span>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="text-center pt-4 border-t border-gray-200"
              >
                <motion.a
                  href="/register"
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                >
                  ¿No tienes cuenta? Regístrate
                </motion.a>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
