document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("new-task");
  const dueDateInput = document.getElementById("due-date");
  const priorityInput = document.getElementById("priority");
  const taskList = document.getElementById("task-list");
  const addTaskBtn = document.getElementById("add-task-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const notifications = document.getElementById("notifications");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notifications.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  function renderTasks(sortBy = "default", statusFilter = "all") {
    taskList.innerHTML = "";

    let filteredTasks = [...tasks];
    
    if (statusFilter === "pending") {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (statusFilter === "completed") {
      filteredTasks = filteredTasks.filter(task => task.completed);
    }

    if (sortBy === "date") {
      filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === "priority") {
      filteredTasks.sort((a, b) => b.priority - a.priority);
    }

    filteredTasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = `task ${task.completed ? "completed" : ""} ${['low-priority', 'medium-priority', 'high-priority'][task.priority]}`;
      li.dataset.index = index;

      li.innerHTML = `
        <span>${task.text} - Due: ${task.dueDate || "No due date"} - Priority: ${['Low', 'Medium', 'High'][task.priority]}</span>
        <div>
          <button onclick="toggleTask(${index})">${task.completed ? "Undo" : "Complete"}</button>
          <button onclick="deleteTask(${index})">Delete</button>
        </div>
      `;

      li.querySelector("button[onclick^='deleteTask']").addEventListener("click", () => {
        li.classList.add("removing");
        setTimeout(() => deleteTask(index), 300);
      });

      taskList.appendChild(li);

      // Check for reminders
      if (task.dueDate && !task.completed && new Date(task.dueDate).getTime() < Date.now()) {
        showNotification(`Reminder: ${task.text} is due!`);
      }
    });
  }

  window.toggleTask = (index) => {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  };

  window.deleteTask = (index) => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  };

  addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.selectedIndex;

    if (text) {
      tasks.push({ text, dueDate, priority, completed: false });
      saveTasks();
      renderTasks();
      taskInput.value = "";
      dueDateInput.value = "";
    }
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  document.querySelectorAll(".filters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".filters .active")?.classList.remove("active");
      btn.classList.add("active");
      const sortType = btn.dataset.sort || "default";
      const statusFilter = btn.dataset.status || "all";
      renderTasks(sortType, statusFilter);
    });
  });

  renderTasks();
});
