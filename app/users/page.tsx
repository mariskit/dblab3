"use client";
import { useState, useEffect } from "react";
import { User } from "../../types";
import Card from "../../components/ui/Card";

export default function UsersPage() {
  const [users, setUsers] = useState<(User & { post_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Error loading users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <div className="text-sm text-gray-600">
          Total: {users.length} usuarios
        </div>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Miembro desde{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">Posts publicados:</span>
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm font-medium">
                  {user.post_count}
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-500">ID: {user.id}</div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No hay usuarios registrados.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
