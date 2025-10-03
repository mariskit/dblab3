"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostType } from "../../../types";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

export default function CreatePost() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    post_type_id: "",
  });
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      router.push("/login");
      return;
    }
    loadPostTypes();
  }, [router]);

  const loadPostTypes = async () => {
    try {
      const response = await fetch("/api/post-types");
      if (!response.ok) throw new Error("Error loading post types");
      const data = await response.json();
      setPostTypes(data);
    } catch (error) {
      console.error("Error loading post types:", error);
      setError("Error al cargar los tipos de posts");
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

    if (!currentUser) {
      setError("Debes iniciar sesión para crear un post");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          author_id: currentUser.id,
          post_type_id: parseInt(formData.post_type_id),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/posts");
      } else {
        setError(data.error || "Error al crear el post");
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Post</h1>
        <p className="text-black mt-2">
          Comparte tus ideas con la comunidad
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-black bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="post_type_id"
              className="block text-sm font-medium text-black mb-1"
            >
              Tipo de Post *
            </label>
            <select
              id="post_type_id"
              name="post_type_id"
              required
              value={formData.post_type_id}
              onChange={handleChange}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecciona un tipo</option>
              {postTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Título *"
            name="title"
            type="text"
            required
            placeholder="Escribe un título llamativo"
            value={formData.title}
            onChange={handleChange}
            maxLength={200}
          />

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-black  mb-1"
            >
              Contenido *
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={10}
              placeholder="Escribe el contenido de tu post aquí..."
              value={formData.content}
              onChange={handleChange}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-vertical"
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/posts")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando post..." : "Crear Post"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
