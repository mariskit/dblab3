"use client";
import { useState, useEffect } from "react";
import { PostType } from "../../types";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function TypesPage() {
  const [types, setTypes] = useState<PostType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [editingType, setEditingType] = useState<PostType | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/post-types");
      if (!response.ok) throw new Error("Error loading types");
      const data = await response.json();
      setTypes(data);
    } catch (error) {
      console.error("Error loading types:", error);
      setError("Error al cargar los tipos de posts");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const url = editingType
        ? `/api/post-types/${editingType.id}`
        : "/api/post-types";
      const method = editingType ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: "", description: "" });
        setEditingType(null);
        loadTypes();
      } else {
        const data = await response.json();
        setError(data.error || "Error al guardar el tipo");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (type: PostType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
    });
  };

  const handleDelete = async (typeId: number) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este tipo? Los posts asociados no se eliminarán, pero perderán esta categorización."
      )
    )
      return;

    try {
      const response = await fetch(`/api/post-types/${typeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadTypes();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar el tipo");
      }
    } catch (error) {
      console.error("Error deleting type:", error);
      alert("Error al eliminar el tipo");
    }
  };

  const cancelEdit = () => {
    setEditingType(null);
    setFormData({ name: "", description: "" });
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
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

  if (loading) {
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
      className="space-y-6"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-gray-900">Tipos de Posts</h1>
      </motion.div>

      {/* Formulario */}
      <motion.div variants={formVariants} initial="hidden" animate="visible">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            {editingType ? "Editar Tipo" : "Crear Nuevo Tipo"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileHover={{ scale: 1.01 }}>
              <Input
                label="Nombre del Tipo *"
                name="name"
                type="text"
                required
                placeholder="Ej: Base de datos, IA, Programación..."
                value={formData.name}
                onChange={handleChange}
                className="text-black"
                maxLength={100}
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-black mb-1"
              >
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Descripción opcional del tipo de post..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                maxLength={255}
              />
            </motion.div>

            <motion.div className="flex space-x-4">
              {editingType && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={cancelEdit}
                  disabled={formLoading}
                >
                  Cancelar
                </Button>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button type="submit" disabled={formLoading}>
                  {formLoading
                    ? editingType
                      ? "Actualizando..."
                      : "Creando..."
                    : editingType
                    ? "Actualizar Tipo"
                    : "Crear Tipo"}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </Card>
      </motion.div>

      {/* Lista de tipos */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tipos Existentes ({types.length})
          </h2>

          <motion.div
            layout
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {types.map((type, index) => (
                <motion.div
                  key={type.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {type.name}
                    </h3>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(type)}
                        className="text-black hover:text-primary-800 text-sm"
                      >
                        Editar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(type.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </motion.button>
                    </div>
                  </div>

                  {type.description && (
                    <p className="text-gray-600 text-sm mt-2">
                      {type.description}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">ID: {type.id}</span>
                  </div>
                </motion.div>
              ))}

              {types.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-8"
                >
                  <p className="text-gray-500">
                    No hay tipos de posts creados aún.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
