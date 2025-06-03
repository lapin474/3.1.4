// Красиво форматируем роль: ROLE_ADMIN → Admin
function beautifyRole(role) {
    return role.replace("ROLE_", "").toLowerCase().replace(/^./, c => c.toUpperCase());
}

document.addEventListener("DOMContentLoaded", () => {
    // Загрузка всех пользователей в таблицу (для админа)
    loadUsers();

    // Загрузка текущего пользователя (для верхней панели)
    loadCurrentUser();

    // Обработчик формы добавления нового пользователя
    document.getElementById("addUserForm").addEventListener("submit", (e) => {
        e.preventDefault();
        createUser();
    });

    // Обработчик формы редактирования пользователя
    document.getElementById("editUserForm").addEventListener("submit", (e) => {
        e.preventDefault();
        updateUser();
    });
});

// Загрузить всех пользователей и отобразить в таблице
function loadUsers() {
    fetch("/api/users")
        .then(res => res.json())
        .then(users => {
            const tbody = document.getElementById("userTableBody");
            tbody.innerHTML = "";
            users.forEach(user => {
                tbody.insertAdjacentHTML("beforeend", renderUserRow(user));
            });
        })
        .catch(err => console.error("Ошибка загрузки пользователей:", err));
}

// Вернуть HTML строку таблицы с данными пользователя
function renderUserRow(user) {
    const roles = user.roleNames.map(beautifyRole).join(", ");
    return `
    <tr>
      <td>${user.id}</td>
      <td>${user.email}</td>
      <td>${user.firstName}</td>
      <td>${user.lastName}</td>
      <td>${roles}</td>
      <td>
        <button class="btn btn-sm btn-info me-1" onclick="openEditModal(${user.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${user.id})">Delete</button>
      </td>
    </tr>
  `;
}

// Загрузить данные текущего пользователя и вывести в верхнюю панель
function loadCurrentUser() {
    fetch("/api/users/me")
        .then(res => res.json())
        .then(user => {
            window.currentUser = user;  // сохраняем глобально
            loadSidebarMenu(user);
            const roles = user.roleNames.map(beautifyRole).join(", ");
            document.getElementById("auth-info").textContent = `${user.email} с ролями: ${roles}`;

            if (user.roleNames.includes("ROLE_ADMIN")) {
                showPanel("admin-panel");
            } else {
                showPanel("user-panel");
                renderUserInfo(user);
            }

        })
        .catch(err => console.error("Ошибка загрузки текущего пользователя:", err));
}


// Функция для вывода данных пользователя на страницу
function renderUserInfo(user) {
    const tbody = document.getElementById("user-info-body");
    tbody.innerHTML = `
        <tr>
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.roleNames.map(beautifyRole).join(", ")}</td>
        </tr>
    `;
}
function loadSidebarMenu(user) {
    const sidebar = document.getElementById("sidebar-menu");
    sidebar.innerHTML = ""; // очистить меню

    if (user.roleNames.includes("ROLE_ADMIN")) {
        sidebar.insertAdjacentHTML("beforeend", `
        <li class="nav-item">
            <a class="nav-link" href="#admin-panel" onclick="showPanel('admin-panel')">Admin</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#user-panel" onclick="showPanel('user-panel')">User</a>
        </li>
    `);
    } else {
        sidebar.insertAdjacentHTML("beforeend", `
        <li class="nav-item">
            <a class="nav-link" href="#user-panel" onclick="showPanel('user-panel')">User</a>
        </li>
    `);
    }

    // 👇 Автоматически установить правильную вкладку и подсветку
    if (user.roleNames.includes("ROLE_ADMIN")) {
        showPanel("admin-panel");
    } else {
        showPanel("user-panel");
    }
}




// Создать нового пользователя
function createUser() {
    const user = {
        firstName: document.getElementById("addFirstName").value.trim(),
        lastName: document.getElementById("addLastName").value.trim(),
        email: document.getElementById("addEmail").value.trim(),
        password: document.getElementById("addPassword").value,
        roleNames: Array.from(document.getElementById("addRoles").selectedOptions).map(opt => opt.value)
    };

    fetch("/api/users", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(user)
    })
        .then(res => {
            if (res.ok) {
                document.getElementById("addUserForm").reset();
                // Закрываем форму, если у тебя есть модалка (иначе убирай эту строку)
                const addModal = document.getElementById("addUserModal");
                if (addModal) bootstrap.Modal.getInstance(addModal)?.hide();

                loadUsers();
            } else {
                alert("Ошибка при добавлении пользователя");
            }
        })
        .catch(err => {
            alert("Ошибка сети при добавлении пользователя");
            console.error(err);
        });
}

let currentEditUserId = null;

// Открыть модальное окно редактирования и заполнить данные
function openEditModal(id) {
    fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(user => {
            currentEditUserId = id;
            document.getElementById("editUserId").value = user.id;
            document.getElementById("editFirstName").value = user.firstName;
            document.getElementById("editLastName").value = user.lastName;
            document.getElementById("editEmail").value = user.email;
            document.getElementById("editPassword").value = "";

            const rolesSelect = document.getElementById("editRoles");
            Array.from(rolesSelect.options).forEach(opt => {
                opt.selected = user.roleNames.includes(opt.value);
            });

            bootstrap.Modal.getOrCreateInstance(document.getElementById("editUserModal")).show();
        })
        .catch(err => alert("Ошибка при загрузке данных пользователя для редактирования"));
}

// Отправить обновления пользователя на сервер
function updateUser() {
    const updatedUser = {
        firstName: document.getElementById("editFirstName").value.trim(),
        lastName: document.getElementById("editLastName").value.trim(),
        email: document.getElementById("editEmail").value.trim(),
        password: document.getElementById("editPassword").value,
        roleNames: Array.from(document.getElementById("editRoles").selectedOptions).map(opt => opt.value)
    };

    fetch(`/api/users/${currentEditUserId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(updatedUser)
    })
        .then(res => {
            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
                loadUsers();
            } else {
                alert("Ошибка при обновлении пользователя");
            }
        })
        .catch(err => alert("Ошибка сети при обновлении пользователя"));
}

let currentDeleteUserId = null;

// Открыть модалку удаления пользователя с заполненными данными
function openDeleteModal(id) {
    currentDeleteUserId = id;

    fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(user => {
            document.getElementById("deleteId").value = user.id;
            document.getElementById("deleteFirstName").value = user.firstName;
            document.getElementById("deleteLastName").value = user.lastName;
            document.getElementById("deleteEmail").value = user.email;

            const rolesSelect = document.getElementById("deleteRoles");
            Array.from(rolesSelect.options).forEach(opt => {
                opt.selected = user.roleNames.includes(opt.value);
            });

            bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteUserModal")).show();
        })
        .catch(err => alert("Ошибка при загрузке данных пользователя для удаления"));
}

// Подтвердить удаление пользователя
function confirmDeleteUser() {
    fetch(`/api/users/${currentDeleteUserId}`, {
        method: "DELETE"
    })
        .then(res => {
            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById("deleteUserModal")).hide();
                loadUsers();
            } else {
                alert("Ошибка при удалении пользователя");
            }
        })
        .catch(err => alert("Ошибка сети при удалении пользователя"));
}
function showPanel(panelId) {
    const panels = ["admin-panel", "user-panel"];
    panels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === panelId) ? "block" : "none";
    });

    document.querySelectorAll("#sidebar-menu .nav-link").forEach(link => {
        const href = link.getAttribute("href");
        if (href === `#${panelId}`) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Если показали user-panel, обновляем информацию пользователя
    if (panelId === "user-panel" && window.currentUser) {
        renderUserInfo(window.currentUser);
    }
}


window.showPanel = showPanel; // Делаем функцию доступной глобально

