document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const taskList = document.getElementById("task-list");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskModal = document.getElementById("task-modal");
  const closeModal = document.querySelector(".close-modal");
  const cancelTask = document.getElementById("cancel-task");
  const taskForm = document.getElementById("task-form");
  const navLinks = document.querySelectorAll(".main-nav a");
  const downloadPdfBtn = document.getElementById("download-pdf-btn");
  const viewOptions = document.querySelectorAll(".view-option");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const profileImg = document.getElementById("profile-img");
  const profileUpload = document.getElementById("profile-upload");
  const usernameDisplay = document.getElementById("username-display");
  const editUsernameBtn = document.getElementById("edit-username-btn");

  // FAB nav
  const fabMainBtn = document.getElementById("fab-main-btn");
  const fabItems = document.getElementById("fab-items");
  const fabNavBtns = document.querySelectorAll(".fab-item");

  // Flatpickr date picker
  const datePicker = flatpickr("#task-due-date", {
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "D, M j Y",
    animate: true,
    disableMobile: false,
    onReady: function(selectedDates, dateStr, instance) {
      instance.calendarContainer.classList.add("taskmaster-calendar");
    }
  });

  // Data Management
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [
    { id: 1, title: "Finish Q3 product roadmap", description: "Align features with engineering, design, and leadership before the quarterly kickoff.", dueDate: new Date(Date.now() + 2*86400000).toISOString().split('T')[0], priority: "high", completed: false, category: "work" },
    { id: 2, title: "Design system component audit", description: "Review all reusable components in Figma and flag inconsistencies for the next sprint.", dueDate: new Date(Date.now() + 5*86400000).toISOString().split('T')[0], priority: "medium", completed: false, category: "work" },
    { id: 3, title: "Book flights to Dubai", description: "Compare tickets on Sky Scanner and confirm with the team before booking.", dueDate: new Date(Date.now() + 10*86400000).toISOString().split('T')[0], priority: "medium", completed: false, category: "personal" },
    { id: 4, title: "Annual performance reviews", description: "Prepare written evaluations for all 6 direct reports and schedule 1:1s.", dueDate: new Date(Date.now() + 1*86400000).toISOString().split('T')[0], priority: "high", completed: false, category: "work" },
    { id: 5, title: "Grocery run — weekly shop", description: "Vegetables, chicken breast, oat milk, Greek yogurt, sourdough, and fruit.", dueDate: new Date(Date.now() + 0*86400000).toISOString().split('T')[0], priority: "low", completed: true, category: "shopping" },
    { id: 6, title: "Respond to investor emails", description: "Draft replies to Sequoia and a16z regarding the Series B deck they requested.", dueDate: new Date(Date.now() + 3*86400000).toISOString().split('T')[0], priority: "high", completed: false, category: "work" },
    { id: 7, title: "Schedule dentist check-up", description: "Dr. Rania — routine cleaning and X-rays overdue since last spring.", dueDate: new Date(Date.now() + 14*86400000).toISOString().split('T')[0], priority: "low", completed: false, category: "personal" },
    { id: 8, title: "Learn Framer Motion basics", description: "Complete the official docs walkthrough and build a prototype animation in 2 hours.", dueDate: new Date(Date.now() + 7*86400000).toISOString().split('T')[0], priority: "low", completed: false, category: "other" },
    { id: 9, title: "Set up home office ergonomics", description: "Order a monitor arm, desk mat, and cable management kit from Amazon.", dueDate: new Date(Date.now() + 4*86400000).toISOString().split('T')[0], priority: "medium", completed: true, category: "personal" },
    { id: 10, title: "Prepare client demo walkthrough", description: "Record a Loom video of the new dashboard features before Thursday's call.", dueDate: new Date(Date.now() + 1*86400000).toISOString().split('T')[0], priority: "high", completed: false, category: "work" }
  ];

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateProgress();
  }

  function updateProgress() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    document.querySelector(".progress-header span:last-child").textContent = `${pct}%`;
    document.querySelector(".progress-fill").style.width = `${pct}%`;
  }

  // ── Modal Handling ──
  function openModal() {
    taskModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeModalFunc() {
    taskModal.style.display = "none";
    document.body.style.overflow = "auto";
    taskModal.querySelector("h3").textContent = "Add New Task";
    taskForm.querySelector('button[type="submit"]').textContent = "Save Task";
    taskForm.reset();
    datePicker.clear();
    const editIdInput = document.getElementById("edit-task-id");
    if (editIdInput) editIdInput.remove();
  }

  function closeSidebar() {
    sidebar.classList.remove("mobile-visible");
    overlay.style.display = "none";
  }

  addTaskBtn.addEventListener("click", openModal);
  closeModal.addEventListener("click", closeModalFunc);
  cancelTask.addEventListener("click", closeModalFunc);
  window.addEventListener("click", e => { if (e.target === taskModal) closeModalFunc(); });

  overlay.addEventListener("click", () => {
    closeSidebar();
    closeFab();
  });

  navLinks.forEach(link => link.addEventListener("click", closeSidebar));

  // ── FAB Navigation ──
  let fabOpen = false;

  function openFab() {
    fabOpen = true;
    fabMainBtn.classList.add("is-open");
    fabItems.classList.add("open");
  }

  function closeFab() {
    fabOpen = false;
    fabMainBtn.classList.remove("is-open");
    fabItems.classList.remove("open");
  }

  fabMainBtn.addEventListener("click", e => {
    e.stopPropagation();
    fabOpen ? closeFab() : openFab();
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".mobile-fab-nav")) closeFab();
  });

  fabNavBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      const matchingLink = document.querySelector(`.main-nav a[data-filter="${filter}"]`);
      if (matchingLink) matchingLink.click();
      fabNavBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      closeFab();
    });
  });

  // ── Theme Toggle ──
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggleBtn.querySelector("i").className = isDark ? "fas fa-sun" : "fas fa-moon";
  });

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggleBtn.querySelector("i").className = "fas fa-sun";
  }

  // ── Due Date Reminders ──
  function checkDueDates() {
    const today = new Date(); today.setHours(0,0,0,0);
    const notifiedTasks = JSON.parse(localStorage.getItem("notifiedTasks")) || {};
    const todayString = today.toISOString().split("T")[0];
    let messages = [];

    tasks.forEach(task => {
      if (task.completed || !task.dueDate) return;
      const due = new Date(task.dueDate); due.setHours(0,0,0,0);
      const diff = Math.ceil((due - today) / 86400000);
      if (diff <= 0 && notifiedTasks[task.id] !== todayString) {
        const label = diff === 0 ? `<span style="color:var(--warning);font-weight:bold;">due today!</span>` : `<span style="color:var(--danger);">${Math.abs(diff)} days overdue!</span>`;
        messages.push(`<b>${task.title}</b> is ${label}`);
        notifiedTasks[task.id] = todayString;
      }
    });

    if (messages.length > 0) {
      Swal.fire({
        title: "⏰ Task Reminders",
        html: messages.join("<br><br>"),
        icon: "info",
        confirmButtonText: "Got it!",
        confirmButtonColor: "#4A0060"
      });
    }
    localStorage.setItem("notifiedTasks", JSON.stringify(notifiedTasks));
  }

  // ── Task Management Form ──
  taskForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-description").value;
    const dueDate = document.getElementById("task-due-date").value;
    const priority = document.getElementById("task-priority").value;
    const category = document.getElementById("task-category").value;
    const editIdInput = document.getElementById("edit-task-id");

    if (editIdInput) {
      const taskId = parseInt(editIdInput.value);
      const idx = tasks.findIndex(t => t.id === taskId);
      tasks[idx] = { ...tasks[idx], title, description, dueDate, priority, category };
    } else {
      tasks.push({ id: Date.now(), title, description, dueDate, priority, completed: false, category });
    }

    saveTasks();
    Swal.fire({ icon: "success", title: "Task saved!", showConfirmButton: false, timer: 1400 });
    filterTasks();
    closeModalFunc();
  });

  // ── Rendering ──
  function renderTasks(filteredTasks = null) {
    const toRender = filteredTasks || tasks;
    taskList.innerHTML = "";

    if (toRender.length === 0) {
      taskList.innerHTML = '<p class="no-tasks">✨ No tasks here — add one to get started!</p>';
      return;
    }

    toRender.forEach((task, i) => {
      const el = createTaskElement(task);
      el.style.animationDelay = `${i * 0.04}s`;
      el.classList.add("animate__animated", "animate__fadeInUp", "animate__faster");
      taskList.appendChild(el);
    });

    setupAllTaskEventListeners();
    enableDragAndDrop();
    updateDueDates();
  }

  function createTaskElement(task) {
    const el = document.createElement("div");
    el.className = `task-item ${task.completed ? "completed" : ""}`;
    el.setAttribute("data-id", task.id);
    el.draggable = true;
    const dueDateText = formatDueDate(task.dueDate);

    el.innerHTML = `
      <div class="task-checkbox">
        <input type="checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}">
      </div>
      <div class="task-content">
        <h3 class="task-title">${task.title}</h3>
        <p class="task-description">${task.description}</p>
        <div class="task-meta">
          <span class="task-due-date"><i class="far fa-calendar-alt"></i> ${dueDateText}</span>
          <span class="task-priority priority-${task.priority}">${task.priority}</span>
          <span class="task-category">${task.category}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action-btn edit-task" data-id="${task.id}" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="task-action-btn delete-task" data-id="${task.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    `;
    return el;
  }

  function formatDueDate(dueDate) {
    if (!dueDate) return "No due date";
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(dueDate); due.setHours(0,0,0,0);
    const diff = Math.ceil((due - today) / 86400000);
    if (diff === 0) return '<span class="date-today">Today!</span>';
    if (diff < 0) return `<span class="date-overdue">${Math.abs(diff)}d overdue</span>`;
    if (diff === 1) return "Tomorrow";
    return `${diff} days left`;
  }

  function updateDueDates() {
    document.querySelectorAll(".task-due-date").forEach(el => {
      const id = parseInt(el.closest(".task-item").getAttribute("data-id"));
      const task = tasks.find(t => t.id === id);
      if (task) el.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDueDate(task.dueDate)}`;
    });
  }

  function setupAllTaskEventListeners() {
    document.querySelectorAll(".task-checkbox input").forEach(cb => {
      cb.addEventListener("change", function() {
        const id = parseInt(this.getAttribute("data-id"));
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.completed = this.checked;
          saveTasks();
          this.closest(".task-item")?.classList.toggle("completed", this.checked);
          filterTasks();
        }
      });
    });

    document.querySelectorAll(".delete-task").forEach(btn => {
      btn.addEventListener("click", function() {
        Swal.fire({
          title: "Delete this task?",
          text: "This action cannot be undone.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#E53E6A",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Yes, delete!",
        }).then(result => {
          if (result.isConfirmed) {
            const item = this.closest(".task-item");
            if (!item) return;
            item.classList.add("removing");
            item.addEventListener("animationend", () => {
              const id = parseInt(this.getAttribute("data-id"));
              tasks = tasks.filter(t => t.id !== id);
              saveTasks();
              item.remove();
              if (taskList.children.length === 0) renderTasks();
              Swal.fire({ title: "Deleted!", text: "Task removed.", icon: "success", timer: 1400, showConfirmButton: false });
            }, { once: true });
          }
        });
      });
    });

    document.querySelectorAll(".edit-task").forEach(btn => {
      btn.addEventListener("click", function() {
        const id = parseInt(this.getAttribute("data-id"));
        const task = tasks.find(t => t.id === id);
        if (task) openEditModal(task);
      });
    });
  }

  function openEditModal(task) {
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description;
    datePicker.setDate(task.dueDate);
    document.getElementById("task-priority").value = task.priority;
    document.getElementById("task-category").value = task.category;

    const existing = document.getElementById("edit-task-id");
    if (existing) existing.remove();
    const hidden = document.createElement("input");
    hidden.type = "hidden"; hidden.id = "edit-task-id"; hidden.value = task.id;
    taskForm.appendChild(hidden);
    taskModal.querySelector("h3").textContent = "Edit Task";
    taskForm.querySelector('button[type="submit"]').textContent = "Update Task";
    openModal();
  }

  // ── Navigation Filters ──
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      navLinks.forEach(l => l.parentElement.classList.remove("active"));
      this.parentElement.classList.add("active");

      const filter = this.getAttribute("data-filter");
      let filtered = [...tasks];
      resetFilters();

      switch (filter) {
        case "inbox":      filtered = filtered.filter(t => !t.completed); break;
        case "important":  filtered = filtered.filter(t => t.priority === "high" && !t.completed); break;
        case "planned":    filtered = filtered.filter(t => t.dueDate && !t.completed); break;
        case "completed":  filtered = filtered.filter(t => t.completed); break;
        case "categories": renderTasksByCategory(); return;
      }
      renderTasks(filtered);
    });
  });

  function resetFilters() {
    document.getElementById("filter-status").value = "all";
    document.getElementById("filter-priority").value = "all";
    document.getElementById("filter-date").value = "all";
  }

  function renderTasksByCategory() {
    taskList.innerHTML = "";
    const byCategory = {};
    tasks.forEach(t => {
      if (!byCategory[t.category]) byCategory[t.category] = [];
      byCategory[t.category].push(t);
    });

    const icons = { work: "💼", personal: "🏡", shopping: "🛒", other: "✨" };

    for (const cat in byCategory) {
      const section = document.createElement("div");
      section.className = "category-section";
      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `<h3>${icons[cat] || "📌"} ${cat.charAt(0).toUpperCase() + cat.slice(1)} <span class="task-count">${byCategory[cat].length}</span></h3>`;
      section.appendChild(header);
      byCategory[cat].forEach(task => section.appendChild(createTaskElement(task)));
      taskList.appendChild(section);
    }
    setupAllTaskEventListeners();
    enableDragAndDrop();
    updateDueDates();
  }

  viewOptions.forEach(opt => {
    opt.addEventListener("click", function() {
      viewOptions.forEach(o => o.classList.remove("active"));
      this.classList.add("active");
      taskList.classList.toggle("grid-view", !!this.querySelector(".fa-th-large"));
    });
  });

  function filterTasks() {
    const statusFilter = document.getElementById("filter-status").value;
    const priorityFilter = document.getElementById("filter-priority").value;
    const dateFilter = document.getElementById("filter-date").value;
    let filtered = [...tasks];

    if (statusFilter !== "all") {
      filtered = filtered.filter(t => {
        if (statusFilter === "completed") return t.completed;
        return !t.completed;
      });
    }

    if (priorityFilter !== "all") filtered = filtered.filter(t => t.priority === priorityFilter);

    if (dateFilter !== "all") {
      const today = new Date(); today.setHours(0,0,0,0);
      filtered = filtered.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate); due.setHours(0,0,0,0);
        if (dateFilter === "today") return due.getTime() === today.getTime();
        if (dateFilter === "week") { const nw = new Date(today); nw.setDate(nw.getDate()+7); return due >= today && due <= nw; }
        if (dateFilter === "month") { const nm = new Date(today); nm.setMonth(nm.getMonth()+1); return due >= today && due <= nm; }
        return true;
      });
    }
    renderTasks(filtered);
  }

  document.getElementById("filter-status").addEventListener("change", filterTasks);
  document.getElementById("filter-priority").addEventListener("change", filterTasks);
  document.getElementById("filter-date").addEventListener("change", filterTasks);

  // ── 🛠️ كود تصدير الـ PDF المصلح والمحسّن بالكامل ──
  downloadPdfBtn.addEventListener("click", async () => {
    const orig = downloadPdfBtn.innerHTML;
    downloadPdfBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Generating…`;
    downloadPdfBtn.disabled = true;

    // الحصول على الوضع الحالي (مظلم أو مضيء) لتهيئة اللقطة بشكل صحيح
    const isDarkMode = document.body.classList.contains("dark-mode");
    const container = document.querySelector(".task-manager");

    try {
      const canvas = await html2canvas(container, {
        scale: 2, // دقة مضاعفة فائقة النقاء لإنتاج نصوص واضحة
        useCORS: true,
        logging: false,
        backgroundColor: isDarkMode ? "#180228" : "#ffffff", // تحديد لون الخلفية بناءً على الثيم النشط
        onclone: (clonedDoc) => {
          const clonedTarget = clonedDoc.querySelector(".task-manager");
          if (clonedTarget) {
            // إجبار الكلون على أخذ لون الخط والخلفية الصريح للتخلص من مشكلة الألوان البيضاء المفقودة
            clonedTarget.style.color = isDarkMode ? "#F5D6F0" : "#18062A";
            clonedTarget.style.background = isDarkMode ? "#180228" : "#ffffff";
            clonedTarget.style.boxShadow = "none";
            clonedTarget.style.borderRadius = "0";
            
            // إخفاء الأزرار وصناديق الاختيار أثناء الطباعة لمنح الملف مظهر احترافي نقي
            clonedTarget.querySelectorAll(".task-actions, .task-checkbox, .task-header .task-actions").forEach(e => {
              e.style.display = "none";
            });

            // التأكيد على ظهور التواريخ والبيانات الوصفية للخطوط بوضوح متناهي
            clonedTarget.querySelectorAll(".task-due-date, .task-meta, .task-due-date span").forEach(e => {
              e.style.opacity = "1";
              e.style.visibility = "visible";
              e.style.color = isDarkMode ? "#C497C8" : "#6B4A80";
            });
          }
        }
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // رأس الصفحة للملف الصادر
      pdf.setFontSize(16);
      pdf.setTextColor(isDarkMode ? 139 : 74, isDarkMode ? 58 : 0, isDarkMode ? 139 : 96);
      pdf.text("TaskMaster Pro — Task Report", pdfWidth / 2, 15, { align: "center" });
      
      pdf.setFontSize(10);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 22, { align: "center" });
      
      // إلحاق الصورة بالصفحة
      pdf.addImage(canvas, "PNG", 10, 30, imgWidth, imgHeight);
      pdf.save("TaskMaster-Tasks.pdf");

      Swal.fire({ icon: "success", title: "PDF Ready!", text: "Your task report has been downloaded.", showConfirmButton: false, timer: 2000 });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Oops!", text: "Couldn't generate the PDF correctly. Please try again." });
    } finally {
      downloadPdfBtn.innerHTML = orig;
      downloadPdfBtn.disabled = false;
    }
  });

  // ── Drag & Drop ──
  function enableDragAndDrop() {
    let dragged = null;
    taskList.querySelectorAll(".task-item").forEach(item => {
      item.addEventListener("dragstart", function() {
        dragged = this;
        setTimeout(() => this.classList.add("dragging"), 0);
      });
      item.addEventListener("dragend", function() {
        this.classList.remove("dragging");
        dragged = null;
        document.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
      });
      item.addEventListener("dragover", e => e.preventDefault());
      item.addEventListener("dragenter", function(e) {
        e.preventDefault();
        if (this !== dragged) this.classList.add("drag-over");
      });
      item.addEventListener("dragleave", function() {
        this.classList.remove("drag-over");
      });
      item.addEventListener("drop", function() {
        this.classList.remove("drag-over");
        if (dragged && dragged !== this) {
          taskList.insertBefore(dragged, this);
          updateTaskOrder();
        }
      });
    });
  }

  function updateTaskOrder() {
    const newOrder = [];
    document.querySelectorAll(".task-item").forEach(el => {
      const id = parseInt(el.getAttribute("data-id"));
      const task = tasks.find(t => t.id === id);
      if (task) newOrder.push(task);
    });
    tasks = newOrder;
    saveTasks();
  }

  // ── Profile Loader ──
  function loadProfileData() {
    const name = localStorage.getItem("taskmaster_username");
    const pic = localStorage.getItem("taskmaster_profile_pic");
    if (name) usernameDisplay.textContent = name;
    if (pic) profileImg.src = pic;
  }

  profileUpload.addEventListener("change", function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      profileImg.src = e.target.result;
      localStorage.setItem("taskmaster_profile_pic", e.target.result);
    };
    reader.readAsDataURL(file);
  });

  editUsernameBtn.addEventListener("click", function() {
    const current = usernameDisplay.textContent;
    const input = document.createElement("input");
    input.type = "text"; input.value = current; input.className = "username-input";
    usernameDisplay.replaceWith(input);
    input.focus();

    function save() {
      const val = input.value.trim() || current;
      usernameDisplay.textContent = val;
      localStorage.setItem("taskmaster_username", val);
      input.replaceWith(usernameDisplay);
    }

    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") save();
      if (e.key === "Escape") { usernameDisplay.textContent = current; input.replaceWith(usernameDisplay); }
    });
  });

  // Init
  loadProfileData();
  filterTasks();
  updateProgress();
  checkDueDates();
});