"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  return (
    <div>
      <h2 className="text-2xl mb-4">Posts</h2>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.id} className="p-4 border rounded-lg bg-white">
            <a href={`/post/${p.id}`} className="text-lg font-semibold">
              {p.title}
            </a>
            <p className="text-sm text-gray-600">
              {p.content.slice(0, 100)}...
            </p>
            <p className="text-xs text-gray-400">Autor: {p.username}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
