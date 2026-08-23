import { Suspense, lazy, useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import * as api from "./api";

// RegisterForm is only needed on the (less common) sign-up path, so it's
// split into its own chunk and only fetched once the user asks for it —
// keeps the initial bundle smaller for the common login case.
const RegisterForm = lazy(() => import("./components/RegisterForm"));

export default function App() {
  const [token, setToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      api
        .fetchTasks(token)
        .then((data) => setTasks(data.tasks))
        .catch((err) => setError(err.message));
    }
  }, [token]);

  async function handleLogin({ email, password }) {
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegister({ email, password }) {
    try {
      const data = await api.register(email, password);
      setToken(data.token);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddTask(title) {
    try {
      const data = await api.createTask(token, title);
      setTasks((prev) => [...prev, data.task]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleTask(id, completed) {
    // Update the UI immediately so the checkbox responds instantly, then
    // sync with the server. Roll back if the request fails.
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
    try {
      await api.updateTask(token, id, { completed });
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
      setError(err.message);
    }
  }

  async function handleDeleteTask(id) {
    try {
      await api.deleteTask(token, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const pad = (n) => String(n).padStart(3, "0");

  if (!token) {
    return (
      <main className="app">
        <div className="app-shell">
          <div className="brand">
            <span className="brand-mark">TaskFlow</span>
          </div>
          <section className="card">
            {error && <p role="alert" className="alert">{error}</p>}
            {showRegister ? (
              <Suspense fallback={<p className="alert">Loading…</p>}>
                <RegisterForm onRegister={handleRegister} />
              </Suspense>
            ) : (
              <LoginForm onLogin={handleLogin} />
            )}
            <button className="btn btn-ghost" onClick={() => setShowRegister((s) => !s)}>
              {showRegister ? "Have an account? Log in" : "Need an account? Sign up"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <div className="app-shell">
        <div className="brand">
          <span className="brand-mark">TaskFlow</span>
          <span className="brand-counter">
            {pad(done)}/{pad(total)}
          </span>
        </div>
        <section className="card">
          <div className="flow-rail">
            <div className="flow-rail-fill" style={{ height: `${percent}%` }} />
            {total > 0 && (
              <div className="flow-rail-ticks">
                {tasks.map((t) => (
                  <div key={t.id} className="flow-rail-tick" />
                ))}
              </div>
            )}
          </div>
          {error && <p role="alert" className="alert">{error}</p>}
          <TaskForm onAdd={handleAddTask} />
          <TaskList tasks={tasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
        </section>
      </div>
    </main>
  );
}
