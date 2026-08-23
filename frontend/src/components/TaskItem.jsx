export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li data-testid={`task-${task.id}`} className="task-row">
      <label className="task-check-label">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, !task.completed)}
        />
        <span className={`task-title${task.completed ? " is-done" : ""}`}>
          {task.title}
        </span>
      </label>
      <button
        className="task-delete"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.title}`}
      >
        Delete
      </button>
    </li>
  );
}
