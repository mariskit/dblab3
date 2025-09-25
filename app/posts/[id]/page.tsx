"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post, Comment } from "../../../types";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
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
      ease: "easeOut",
    },
  },
};

const commentVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<{
    id: number;
    content: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    loadPostData();
  }, [postId]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      const [postResponse, commentsResponse] = await Promise.all([
        fetch(`/api/posts/${postId}`),
        fetch(`/api/comments?postId=${postId}`),
      ]);

      if (postResponse.ok) {
        const postData = await postResponse.json();
        setPost(postData);
      }

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Error loading post data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setCommentLoading(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: parseInt(postId),
          author_id: currentUser.id,
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment("");
        loadPostData();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment({ id: comment.id, content: comment.content });
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingComment || !editingComment.content.trim()) return;

    setCommentLoading(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editingComment.content,
        }),
      });

      if (response.ok) {
        setEditingComment(null);
        loadPostData();
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadPostData();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este post? Todos los comentarios también se eliminarán."
      )
    )
      return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/posts");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
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

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <h2 className="text-2xl font-bold text-gray-900">Post no encontrado</h2>
        <p className="text-gray-600 mt-2">
          El post que buscas no existe o fue eliminado.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} className="mt-4">
          <Button onClick={() => router.push("/posts")}>Volver a Posts</Button>
        </motion.div>
      </motion.div>
    );
  }

  const canEditPost = currentUser && currentUser.id === post.author_id;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <motion.div whileHover={{ scale: 1.02 }}>
          <Link href="/posts">
            <Button variant="secondary" size="sm">
              ← Volver a Posts
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <motion.h1
                className="text-3xl font-bold text-gray-900 mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {post.title}
              </motion.h1>
              <motion.div
                className="flex items-center space-x-4 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <span>Por {post.author_username}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <motion.span
                  className="bg-gray-100 px-2 py-1 rounded-full text-xs"
                  whileHover={{ scale: 1.05 }}
                >
                  {post.post_type_name}
                </motion.span>
              </motion.div>
            </div>

            {canEditPost && (
              <motion.div
                className="flex space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={`/posts/edit/${post.id}`}>
                    <Button variant="secondary" size="sm">
                      Editar
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="danger" size="sm" onClick={handleDeletePost}>
                    Eliminar
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>

          <motion.div
            className="prose max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </motion.div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 transition-all duration-300 hover:shadow-lg">
          <motion.h2
            className="text-xl font-semibold text-gray-900 mb-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            Comentarios ({comments.length})
          </motion.h2>

          {/* Formulario de comentario */}
          {currentUser && (
            <motion.form
              onSubmit={handleAddComment}
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Añadir comentario
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  rows={3}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" disabled={commentLoading}>
                  {commentLoading ? "Publicando..." : "Publicar Comentario"}
                </Button>
              </motion.div>
            </motion.form>
          )}

          {/* Lista de comentarios */}
          <AnimatePresence>
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  variants={commentVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-200 pb-4 last:border-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-900">
                        {comment.author_username}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        {new Date(comment.created_at).toLocaleDateString()}
                        {comment.updated_at && " (editado)"}
                      </span>
                    </div>

                    {currentUser && currentUser.id === comment.author_id && (
                      <div className="flex space-x-2">
                        {editingComment?.id === comment.id ? (
                          <>
                            <motion.button
                              onClick={() => handleUpdateComment(comment.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                              disabled={commentLoading}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              Guardar
                            </motion.button>
                            <motion.button
                              onClick={() => setEditingComment(null)}
                              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                              disabled={commentLoading}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              Cancelar
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              onClick={() => handleEditComment(comment)}
                              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              Editar
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              Eliminar
                            </motion.button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {editingComment?.id === comment.id ? (
                    <textarea
                      value={editingComment.content}
                      onChange={(e) =>
                        setEditingComment({
                          ...editingComment,
                          content: e.target.value,
                        })
                      }
                      rows={3}
                      className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </motion.div>
              ))}

              {comments.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 text-center py-4"
                >
                  No hay comentarios aún. Sé el primero en comentar.
                </motion.p>
              )}
            </div>
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}
