"use client";

import { useState, useEffect, useCallback } from "react";
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

  useEffect(() => {
    const channel = supabase
      .channel(`todos-${listId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos", filter: `list_id=eq.${listId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTodos((prev) => {
              if (prev.some((t) => t.id === (payload.new as Todo).id)) return prev;
              return [...prev, payload.new as Todo];
            });
          } else if (payload.eventType === "UPDATE") {
            setTodos((prev) =>
              prev.map((t) => (t.id === (payload.new as Todo).id ? (payload.new as Todo) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTodos((prev) => prev.filter((t) => t.id !== (payload.old as Todo).id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [listId, supabase]);

  const addTodo = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    const title = newTitle.trim();
    const tempId = crypto.randomUUID();
    const optimisticTodo: Todo = {
      id: tempId, list_id: listId, title, is_done: false,
      created_by: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setTodos((prev) => [...prev, optimisticTodo]);
    setNewTitle("");

    const { data, error } = await supabase
      .from("todos").insert({ list_id: listId, title }).select().single();

    if (error) {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
    } else if (data) {
      setTodos((prev) => prev.map((t) => (t.id === tempId ? (data as Todo) : t)));
    }
    setLoading(false);
  }, [newTitle, listId, supabase]);

  const toggleTodo = useCallback(async (todo: Todo) => {
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, is_done: !t.is_done } : t)));
    const { error } = await supabase.from("todos").update({ is_done: !todo.is_done }).eq("id", todo.id);
    if (error) {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, is_done: todo.is_done } : t)));
    }
  }, [supabase]);

  const deleteTodo = useCallback(async (id: string) => {
    const deleted = todos.find((t) => t.id === id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error && deleted) {
      setTodos((prev) => [...prev, deleted]);
    }
  }, [supabase, todos]);

  const done = todos.filter((t) => t.is_done).length;
  const total = todos.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Todos</h2>
        {total > 0 && (
          <span className="text-xs text-text-muted">
            {done}/{total} completed
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-300"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a todo..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 px-3.5 py-2.5 border border-border rounded-xl bg-surface text-sm placeholder:text-text-muted"
        />
        <button
          type="submit"
          disabled={loading || !newTitle.trim()}
          className="px-5 py-2.5 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 disabled:opacity-40 transition-all"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {todos.length === 0 && (
          <div className="text-center py-10 bg-surface rounded-xl border border-border">
            <p className="text-text-muted text-sm">No todos yet. Add one above.</p>
          </div>
        )}
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border transition-all ${
              todo.is_done ? "border-border/50 opacity-60" : "border-border"
            }`}
          >
            <button
              onClick={() => toggleTodo(todo)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                todo.is_done
                  ? "bg-teal border-teal"
                  : "border-border hover:border-teal/50"
              }`}
            >
              {todo.is_done && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span
              className={`flex-1 text-sm ${
                todo.is_done ? "line-through text-text-muted" : "text-text-primary"
              }`}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-text-muted hover:text-coral text-xs transition-colors opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
              style={{ opacity: 1 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
