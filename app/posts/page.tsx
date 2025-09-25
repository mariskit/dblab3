"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post, PostType } from "../../types";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Link from "next/link";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [authors, setAuthors] = useState<string[]>([]); // Nuevo estado para autores
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    author: "", // Nuevo filtro por autor
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
      setAuthChecked(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await Promise.all([loadPosts(), loadPostTypes()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Error loading posts");
      const data = await response.json();
      setPosts(data);

      // Extraer autores únicos de los posts
      const uniqueAuthors = Array.from(
        new Set(data.map((post: Post) => post.author_username))
      ).filter(Boolean) as string[];
      setAuthors(uniqueAuthors);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const loadPostTypes = async () => {
    try {
      const response = await fetch("/api/post-types");
      if (!response.ok) throw new Error("Error loading post types");
      const data = await response.json();
      setPostTypes(data);
    } catch (error) {
      console.error("Error loading post types:", error);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("¿Estás seguro de eliminar este post?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error deleting post");
      loadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error al eliminar el post");
    }
  };

  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.content.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType =
      !filters.type || post.post_type_id.toString() === filters.type;
    const matchesAuthor =
      !filters.author || post.author_username === filters.author;

    return matchesSearch && matchesType && matchesAuthor;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
        <Link href="/posts/create">
          <Button>Crear Post</Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="text-black grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por título o contenido..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Todos los tipos</option>
            {postTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={filters.author}
            onChange={(e) => setFilters({ ...filters, author: e.target.value })}
          >
            <option value="">Todos los autores</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => setFilters({ search: "", type: "", author: "" })}
            className="whitespace-nowrap"
          >
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {/* Lista de posts */}
      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  <Link
                    href={`/posts/${post.id}`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Por {post.author_username}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                    {post.post_type_name}
                  </span>
                </div>
              </div>

              {currentUser && currentUser.id === post.author_id && (
                <div className="flex space-x-2 ml-4">
                  <Link
                    href={`/posts/edit/${post.id}`}
                    className="text-black text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-700 line-clamp-3">{post.content}</p>
          </Card>
        ))}

        {filteredPosts.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No se encontraron posts</p>
          </Card>
        )}
      </div>
    </div>
  );
}
