// Frontend-only Task Manager. Tasks are saved in this browser using localStorage.
const STORAGE_KEY = "taskManagerTasks";
const statuses = ["Pending", "Ongoing", "Completed"];

const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

let tasks = loadTasks();
let messageTimer;

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showError(message) {
  clearTimeout(messageTimer);
  errorMessage.textContent = message;
  errorMessage.classList.remove("d-none");
  successMessage.classList.add("d-none");
}

function showSuccess(message) {
  clearTimeout(messageTimer);
  successMessage.textContent = message;
  successMessage.classList.remove("d-none");
  errorMessage.classList.add("d-none");
  messageTimer = setTimeout(() => successMessage.classList.add("d-none"), 3000);
}

function createTask() {
  const title = taskInput.value.trim();

  if (!title) {
    showError("Task title cannot be empty.");
    return;
  }

  tasks.push({
    id: (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2),
    title,
    status: "Pending"
  });

  saveTasks();
  taskInput.value = "";
  renderTasks();
  showSuccess("Task created successfully!");
}

function updateTaskStatus(id, newStatus) {
  if (!statuses.includes(newStatus)) return;

  tasks = tasks.map(task =>
    task.id === id ? { ...task, status: newStatus } : task
  );

  saveTasks();
  renderTasks();
  showSuccess("Task status updated successfully!");
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  showSuccess("Task deleted successfully!");
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn ${className} btn-sm`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderTaskCard(task) {
  const card = document.createElement("div");
  card.className = "card mb-3";

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h6");
  title.className = "card-title";
  title.textContent = task.title;

  const status = document.createElement("p");
  status.className = "card-text";
  status.textContent = `Status: ${task.status}`;

  const actions = document.createElement("div");
  actions.className = "d-flex flex-wrap gap-2";

  if (task.status !== "Pending") {
    actions.appendChild(makeButton("Mark Pending", "btn-secondary",
      () => updateTaskStatus(task.id, "Pending")));
  }
  if (task.status !== "Ongoing") {
    actions.appendChild(makeButton("Mark Ongoing", "btn-info",
      () => updateTaskStatus(task.id, "Ongoing")));
  }
  if (task.status !== "Completed") {
    actions.appendChild(makeButton("Complete", "btn-success",
      () => updateTaskStatus(task.id, "Completed")));
  }

  actions.appendChild(makeButton("Delete", "btn-danger",
    () => deleteTask(task.id)));

  body.append(title, status, actions);
  card.appendChild(body);
  return card;
}

function renderTasks() {
  const columns = {
    Pending: document.getElementById("pendingTasks"),
    Ongoing: document.getElementById("ongoingTasks"),
    Completed: document.getElementById("completedTasks")
  };

  Object.values(columns).forEach(column => column.replaceChildren());

  statuses.forEach(status => {
    const filtered = tasks.filter(task => task.status === status);
    const column = columns[status];

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.className = "text-muted";
      empty.textContent = "No tasks in this category.";
      column.appendChild(empty);
    } else {
      filtered.forEach(task => column.appendChild(renderTaskCard(task)));
    }
  });
}

addTaskButton.addEventListener("click", createTask);
taskInput.addEventListener("keydown", event => {
  if (event.key === "Enter") createTask();
});

renderTasks();
