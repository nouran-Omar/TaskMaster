 document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelTask = document.getElementById('cancel-task');
    const taskForm = document.getElementById('task-form');
    const navLinks = document.querySelectorAll('.main-nav a');
    const viewOptions = document.querySelectorAll('.view-option');
    
    // Load tasks from localStorage or use sample data
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [
        {
            id: 1,
            title: 'Complete project proposal',
            description: 'Finish the proposal document and send to client for review',
            dueDate: '2023-06-15',
            priority: 'high',
            completed: false,
            category: 'work'
        },
        {
            id: 2,
            title: 'Team meeting',
            description: 'Weekly team sync up meeting',
            dueDate: '2023-06-12',
            priority: 'medium',
            completed: false,
            category: 'work'
        },
        {
            id: 3,
            title: 'Buy groceries',
            description: 'Milk, eggs, bread, fruits',
            dueDate: '2023-06-10',
            priority: 'low',
            completed: true,
            category: 'personal'
        },
        {
            id: 4,
            title: 'Prepare presentation',
            description: 'Create slides for quarterly review',
            dueDate: '2023-06-20',
            priority: 'high',
            completed: false,
            category: 'work'
        },
        {
            id: 5,
            title: 'Call mom',
            description: 'Weekly call with family',
            dueDate: '2023-06-14',
            priority: 'medium',
            completed: false,
            category: 'personal'
        }
    ];
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgress();
    }
    
    // Update progress bar
    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        document.querySelector('.progress-header span:last-child').textContent = `${progress}%`;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
    }
    
    // Modal functions
    function openModal() {
        taskModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModalFunc() {
        taskModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        taskForm.reset();
        // Reset form to create mode
        taskForm.querySelector('h3').textContent = 'Add New Task';
        taskForm.querySelector('button[type="submit"]').textContent = 'Save Task';
        const editIdInput = document.getElementById('edit-task-id');
        if (editIdInput) editIdInput.remove();
    }
    
    // Event listeners for modal
    addTaskBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFunc);
    cancelTask.addEventListener('click', closeModalFunc);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === taskModal) {
            closeModalFunc();
        }
    });
    
    // Form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        
        const editIdInput = document.getElementById('edit-task-id');
        
        if (editIdInput) {
            // Update existing task
            const taskId = parseInt(editIdInput.value);
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title,
                description,
                dueDate,
                priority,
                category
            };
        } else {
            // Create new task
            const newTask = {
                id: tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1,
                title,
                description,
                dueDate,
                priority,
                completed: false,
                category
            };
            
            tasks.push(newTask);
        }
        
        saveTasks();
        renderTasks();
        closeModalFunc();
    });
    
    // Render tasks
    function renderTasks(filteredTasks = null) {
        const tasksToRender = filteredTasks || tasks;
        taskList.innerHTML = '';
        
        if (tasksToRender.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks found. Add a new task to get started!</p>';
            return;
        }
        
        tasksToRender.forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });
        
        setupTaskEventListeners();
        enableDragAndDrop();
        updateDueDates();
    }
    
    // Create task element
    function createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-id', task.id);
        taskItem.draggable = true;
        
        const dueDateText = formatDueDate(task.dueDate);
        
        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
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
                <button class="task-action-btn edit-task" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                <button class="task-action-btn delete-task" data-id="${task.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        return taskItem;
    }
    
    // Format due date
    function formatDueDate(dueDate) {
        if (!dueDate) return 'No due date';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '<span style="color:var(--danger-color)">Today!</span>';
        } else if (diffDays < 0) {
            return `<span style="color:var(--danger-color)">${Math.abs(diffDays)} days overdue</span>`;
        } else {
            return `${diffDays} days left (${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
        }
    }
    
    // Update due dates
    function updateDueDates() {
        document.querySelectorAll('.task-due-date').forEach(element => {
            const taskId = parseInt(element.closest('.task-item').getAttribute('data-id'));
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                element.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDueDate(task.dueDate)}`;
            }
        });
    }
    
    // Setup event listeners for tasks
    function setupTaskEventListeners() {
        // Checkboxes
        document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = parseInt(this.getAttribute('data-id'));
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = this.checked;
                    saveTasks();
                    this.closest('.task-item').classList.toggle('completed', this.checked);
                    filterTasks();
                }
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = parseInt(this.getAttribute('data-id'));
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = parseInt(this.getAttribute('data-id'));
                const task = tasks.find(t => t.id === taskId);
                if (task) openEditModal(task);
            });
        });
    }
    
    // Open edit modal
    function openEditModal(task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-category').value = task.category;
        
        // Change form to update instead of create
        taskForm.innerHTML += `<input type="hidden" id="edit-task-id" value="${task.id}">`;
        taskForm.querySelector('h3').textContent = 'Edit Task';
        taskForm.querySelector('button[type="submit"]').textContent = 'Update Task';
        
        openModal();
    }
    
    // Navigation links functionality
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Get the link type from href attribute
            const linkType = this.getAttribute('href').replace('#', '');
            
            // Filter tasks based on link type
            let filteredTasks = [...tasks];
            
            switch(linkType) {
                case 'inbox':
                    // Show all non-completed tasks
                    filteredTasks = filteredTasks.filter(task => !task.completed);
                    break;
                    
                case 'important':
                    // Show high priority tasks
                    filteredTasks = filteredTasks.filter(task => task.priority === 'high' && !task.completed);
                    break;
                    
                case 'planned':
                    // Show tasks with due date that are not completed
                    filteredTasks = filteredTasks.filter(task => task.dueDate && !task.completed);
                    break;
                    
                case 'completed':
                    // Show completed tasks
                    filteredTasks = filteredTasks.filter(task => task.completed);
                    break;
                    
                case 'categories':
                    // Show all tasks grouped by category
                    renderTasksByCategory();
                    return;
            }
            
            renderTasks(filteredTasks);
        });
    });
    
    // Render tasks grouped by category
    function renderTasksByCategory() {
        taskList.innerHTML = '';
        
        // Group tasks by category
        const tasksByCategory = {};
        tasks.forEach(task => {
            if (!tasksByCategory[task.category]) {
                tasksByCategory[task.category] = [];
            }
            tasksByCategory[task.category].push(task);
        });
        
        // Render each category section
        for (const category in tasksByCategory) {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.innerHTML = `
                <h3>
                    <i class="fas fa-tag"></i> 
                    ${category.charAt(0).toUpperCase() + category.slice(1)}
                    <span class="task-count">${tasksByCategory[category].length} tasks</span>
                </h3>
            `;
            
            categorySection.appendChild(categoryHeader);
            
            tasksByCategory[category].forEach(task => {
                const taskItem = createTaskElement(task);
                categorySection.appendChild(taskItem);
            });
            
            taskList.appendChild(categorySection);
        }
        
        setupTaskEventListeners();
        enableDragAndDrop();
        updateDueDates();
    }
    
    // View options functionality
    viewOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Toggle active class
            viewOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Toggle view mode
            if (this.querySelector('.fa-th-large')) {
                // Grid view
                taskList.classList.add('grid-view');
                taskList.classList.remove('list-view');
                
                // Add CSS for grid view
                const style = document.createElement('style');
                style.id = 'grid-view-style';
                style.textContent = `
                    .task-list.grid-view {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 1rem;
                    }
                    
                    .task-list.grid-view .task-item {
                        margin: 0;
                    }
                `;
                
                // Remove existing style if any
                const existingStyle = document.getElementById('grid-view-style');
                if (existingStyle) existingStyle.remove();
                
                document.head.appendChild(style);
            } else {
                // List view
                taskList.classList.add('list-view');
                taskList.classList.remove('grid-view');
                
                // Remove grid view style
                const gridStyle = document.getElementById('grid-view-style');
                if (gridStyle) gridStyle.remove();
            }
        });
    });
    
    // Filter tasks based on dropdown filters
    function filterTasks() {
        const statusFilter = document.getElementById('filter-status').value;
        const priorityFilter = document.getElementById('filter-priority').value;
        const dateFilter = document.getElementById('filter-date').value;
        
        let filteredTasks = [...tasks];
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => {
                if (statusFilter === 'completed') return task.completed;
                if (statusFilter === 'pending') return !task.completed;
                if (statusFilter === 'in-progress') return !task.completed;
                return true;
            });
        }
        
        // Apply priority filter
        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        // Apply date filter
        if (dateFilter !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            filteredTasks = filteredTasks.filter(task => {
                if (!task.dueDate) return false;
                
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                
                if (dateFilter === 'today') {
                    return dueDate.getTime() === today.getTime();
                } else if (dateFilter === 'week') {
                    const nextWeek = new Date(today);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    return dueDate >= today && dueDate <= nextWeek;
                } else if (dateFilter === 'month') {
                    const nextMonth = new Date(today);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    return dueDate >= today && dueDate <= nextMonth;
                }
                return true;
            });
        }
        
        renderTasks(filteredTasks);
    }
    
    // Initialize filters
    document.getElementById('filter-status').addEventListener('change', filterTasks);
    document.getElementById('filter-priority').addEventListener('change', filterTasks);
    document.getElementById('filter-date').addEventListener('change', filterTasks);
    
    // Enable drag and drop
    function enableDragAndDrop() {
        let draggedItem = null;

        taskList.querySelectorAll('.task-item').forEach(task => {
            task.addEventListener('dragstart', function() {
                draggedItem = this;
                setTimeout(() => this.style.opacity = '0.5', 0);
            });

            task.addEventListener('dragend', function() {
                setTimeout(() => this.style.opacity = '1', 0);
                draggedItem = null;
            });

            task.addEventListener('dragover', function(e) {
                e.preventDefault();
            });

            task.addEventListener('dragenter', function(e) {
                e.preventDefault();
                this.style.borderTop = '2px solid var(--primary-color)';
            });

            task.addEventListener('dragleave', function() {
                this.style.borderTop = 'none';
            });

            task.addEventListener('drop', function() {
                this.style.borderTop = 'none';
                if (draggedItem !== this) {
                    taskList.insertBefore(draggedItem, this);
                    updateTaskOrder();
                }
            });
        });
    }
    
    // Update task order after drag and drop
    function updateTaskOrder() {
        const newOrder = [];
        document.querySelectorAll('.task-item').forEach(task => {
            const taskId = parseInt(task.getAttribute('data-id'));
            const taskObj = tasks.find(t => t.id === taskId);
            if (taskObj) newOrder.push(taskObj);
        });
        tasks = newOrder;
        saveTasks();
    }
    
    // Initial render
    renderTasks();
    updateProgress();   
})