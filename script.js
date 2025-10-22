const STORAGE_KEY = "lifeProductivityData";
let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { users: {}, currentUser: null };

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function login(user, pass) {
  if (!state.users[user]) return alert("Account not found!");
  if (state.users[user].password !== pass) return alert("Wrong password!");
  state.currentUser = user;
  save();
  showApp();
}

function signup(user, pass) {
  if (state.users[user]) return alert("User already exists!");
  state.users[user] = { password: pass, sections: { Personal: [], Home: [], School: [], Work: [] } };
  state.currentUser = user;
  save();
  showApp();
}

function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("app").style.display = "block";
  renderTasks();
}

function logout() {
  state.currentUser = null;
  save();
  document.getElementById("app").style.display = "none";
  document.getElementById("loginScreen").style.display = "block";
}

document.getElementById("loginBtn").onclick = () => {
  login(username.value.trim(), password.value.trim());
};

document.getElementById("signupBtn").onclick = () => {
  signup(username.value.trim(), password.value.trim());
};

document.getElementById("logoutBtn").onclick = logout;
document.getElementById("toggleThemeBtn").onclick = () => {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  document.body.setAttribute("data-theme", isDark ? "light" : "dark");
};

document.getElementById("newTaskBtn").onclick = () => {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDue").value = "";
};

document.getElementById("cancelBtn").onclick = () => {
  document.getElementById("modal").style.display = "none";
};

document.getElementById("saveTaskBtn").onclick = () => {
  const title = taskTitle.value.trim();
  const due = taskDue.value ? new Date(taskDue.value).getTime() : null;
  if (!title) return alert("Enter a task title!");
  const section = sectionSelect.value;
  const task = { id: Date.now(), title, due, done: false };
  state.users[state.currentUser].sections[section].push(task);
  save();
  document.getElementById("modal").style.display = "none";
  renderTasks();
};

function renderTasks() {
  const section = sectionSelect.value;
  const user = state.users[state.currentUser];
  const list = document.getElementById("taskList");
  const history = document.getElementById("taskHistory");
  list.innerHTML = "";
  history.innerHTML = "";

  const tasks = user.sections[section];
  let doneCount = 0;
  tasks.forEach(t => {
    const li = document.createElement("li");
    const title = document.createElement("span");
    title.textContent = t.title + (t.due ? ` (due: ${new Date(t.due).toLocaleString()})` : "");
    if (t.done) title.style.textDecoration = "line-through";
    const btns = document.createElement("div");

    const markBtn = document.createElement("button");
    markBtn.textContent = t.done ? "Undo" : "Done";
    markBtn.onclick = () => {
      t.done = !t.done;
      if (t.done) t.doneAt = Date.now();
      save();
      renderTasks();
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      user.sections[section] = tasks.filter(x => x.id !== t.id);
      save();
      renderTasks();
    };

    btns.append(markBtn, delBtn);
    li.append(title, btns);
    if (t.done) history.append(li);
    else list.append(li);
    if (t.done) doneCount++;
  });

  const progress = tasks.length ? (doneCount / tasks.length) * 100 : 0;
  document.getElementById("progressBar").style.width = progress + "%";
}
