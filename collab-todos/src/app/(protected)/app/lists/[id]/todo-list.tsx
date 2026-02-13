"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Todo = {
  id: string;
  list_id: string;
  title: string;
  is_done: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export function TodoList({
  listId,
  initialTodos,
}: {
  listId: string;
  initialTodos: Todo[];
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`todos-${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTodos((prev) => [...prev, payload.new as Todo]);
          } else if (payload.eventType === "UPDATE") {
            setTodos((prev) =>
              prev.map((t) =>
                t.id === (payload.new as Todo).id ? (payload.new as Todo) : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTodos((prev) =>
              prev.filter((t) => t.id !== (payload.old as Todo).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, supabase]);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    const { error } = await supabase
      .from("todos")
      .insert({ list_id: listId, title: newTitle.trim() });

    if (!error) setNewTitle("");
    setLoading(false);
  }

  async function toggleTodo(todo: Todo) {
    await supabase
      .from("todos")
      .update({ is_done: !todo.is_done })
      .eq("id", todo.id);
  }

  async function deleteTodo(id: string) {
    await supabase.from("todos").delete().eq("id", id);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Todos</h2>

      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a todo..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !newTitle.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {todos.length === 0 && (
          <p className="text-gray-400 text-center py-4">No todos yet.</p>
        )}
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
          >
            <input
              type="checkbox"
              checked={todo.is_done}
              onChange={() => toggleTodo(todo)}
              className="w-4 h-4 rounded"
            />
            <span
              className={`flex-1 ${
                todo.is_done ? "line-through text-gray-400" : ""
              }`}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
