"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post, PostType } from "../../../../types";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";

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

        // Verificar que el usuario actual es el autor
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Post</h1>
        <p className="text-gray-600 mt-2">
          Actualiza la información de tu post
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="post_type_id"
              className="block text-sm font-medium text-gray-700 mb-1"
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
            className="text-black"
            maxLength={200}
          />

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              onClick={() => router.push(`/posts/${postId}`)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Post"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
