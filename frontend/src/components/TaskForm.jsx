import { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    setError("");
    onAdd(title.trim());
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Add task form">
      <div className="task-form">
        <div className="field">
          <label htmlFor="task-title">New task</label>
          <input
            id="task-title"
            type="text"
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add task
        </button>
      </div>
      {error && <p role="alert" className="alert">{error}</p>}
    </form>
  );
}
