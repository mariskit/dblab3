"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post, PostType } from "../../../../types";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

export default function EditPost() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    post_type_id: "",
  });
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      router.push("/login");
      return;
    }
    loadPostData();
  }, [postId, router]);

  const loadPostData = async () => {
    try {
      const [postResponse, typesResponse] = await Promise.all([
        fetch(`/api/posts/${postId}`),
        fetch("/api/post-types"),
      ]);

      if (postResponse.ok) {
        const postData: Post = await postResponse.json();

        if (currentUser && postData.author_id !== currentUser.id) {
          router.push("/posts");
          return;
        }

        setFormData({
          title: postData.title,
          content: postData.content,
          post_type_id: postData.post_type_id.toString(),
        });
      }

      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        setPostTypes(typesData);
      }
    } catch (error) {
      console.error("Error loading post data:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          post_type_id: parseInt(formData.post_type_id),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/posts/${postId}`);
      } else {
        setError(data.error || "Error al actualizar el post");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Editar Publicación
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 mt-3 text-lg"
        >
          Actualiza y mejora el contenido de tu publicación
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-8 shadow-xl border-0 bg-white/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <label
                htmlFor="post_type_id"
                className="block text-sm font-semibold text-gray-700 mb-3"
              >
                Tipo de Publicación *
              </label>
              <select
                id="post_type_id"
                name="post_type_id"
                required
                value={formData.post_type_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
              >
                <option value="">Selecciona un tipo</option>
                {postTypes.map((type, index) => (
                  <motion.option
                    key={type.id}
                    value={type.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    {type.name}
                  </motion.option>
                ))}
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Input
                label="Título *"
                name="title"
                type="text"
                required
                placeholder="Escribe un título llamativo y descriptivo"
                value={formData.title}
                onChange={handleChange}
                className="text-gray-900"
                maxLength={200}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-700 mb-3"
              >
                Contenido *
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                id="content"
                name="content"
                required
                rows={12}
                placeholder="Comparte tus ideas, experiencias o conocimientos..."
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 resize-vertical min-h-[200px]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="flex space-x-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/posts/${postId}`)}
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Cancelar
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Actualizando...
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Actualizar Publicación
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
