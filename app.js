// Default Mock Tasks Data to keep user engaged immediately
const defaultTasks = [
    {
        id: "1",
        title: "Analyze performance statistics metric design",
        desc: "Generate circular gauge progress vectors and metrics card components.",
        folder: "WORK",
        priority: "MEDIUM",
        dueDate: "2026-06-15",
        completed: true,
        checklist: [
            { id: "sub-1", text: "Draft vectors", done: true },
            { id: "sub-2", text: "Integrate tailwind theme configurations", done: true }
        ]
    },
    {
        id: "2",
        title: "Plan workout scheduling routines",
        desc: "Log weights, cardio metrics, and plan dynamic stretches.",
        folder: "HEALTH",
        priority: "LOW",
        dueDate: "2026-06-17",
        completed: false,
        checklist: [
            { id: "sub-3", text: "Stretching routine design", done: false },
            { id: "sub-4", text: "Weight targets setup", done: false }
        ]
    },
    {
        id: "3",
        title: "Review Financial Portfolio structure",
        desc: "Export Excel reports from Q2 and audit stock assets configurations.",
        folder: "FINANCE",
        priority: "HIGH",
        dueDate: "2026-06-14",
        completed: false,
        checklist: [
            { id: "sub-5", text: "Audit stock index values", done: false }
        ]
    }
];

let tasks = [];
let folders = ["WORK", "PERSONAL", "HEALTH", "FINANCE"];
let currentFilterCategory = "All";
let currentFilterStatus = "All";
let currentViewMode = "List";
let searchQuery = "";
let currentSortField = "dueDate";
let deletionTargetId = null;

window.onload = function() {
    setupDates();

    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    const savedTasks = localStorage.getItem('zenflow_tasks');
    const savedFolders = localStorage.getItem('zenflow_folders');

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [...defaultTasks];
        saveTasksToStorage();
    }

    if (savedFolders) {
        folders = JSON.parse(savedFolders);
    } else {
        saveFoldersToStorage();
    }

    renderFoldersList();
    renderFolderDropdown();
    renderActiveView();
    updateAllAnalytics();
}

function setupDates() {
    const today = new Date(2026, 5, 14);
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    document.getElementById('current-date-display').innerText = formattedDate;
}

function toggleDarkMode() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        showToast("Switched to Light Mode", "info");
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        showToast("Switched to Dark Mode", "info");
    }
}

function saveTasksToStorage() {
    localStorage.setItem('zenflow_tasks', JSON.stringify(tasks));
}

function saveFoldersToStorage() {
    localStorage.setItem('zenflow_folders', JSON.stringify(folders));
}

function toggleMobileSidebar(open) {
    const sidebar = document.getElementById('mobile-sidebar');
    const drawer = document.getElementById('mobile-sidebar-drawer');
    if (open) {
        sidebar.classList.remove('hidden');
        setTimeout(() => {
            sidebar.classList.add('opacity-100');
            drawer.classList.remove('-translate-x-full');
        }, 20);
    } else {
        sidebar.classList.remove('opacity-100');
        drawer.classList.add('-translate-x-full');
        setTimeout(() => {
            sidebar.classList.add('hidden');
        }, 300);
    }
}

function promptCreateNewFolder() {
    const modal = document.getElementById('folder-modal');
    const card = document.getElementById('folder-modal-card');
    document.getElementById('new-folder-input').value = "";
    modal.classList.remove('hidden');
    setTimeout(() => {
        card.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeFolderModal() {
    const modal = document.getElementById('folder-modal');
    const card = document.getElementById('folder-modal-card');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function saveNewFolder() {
    let inputName = document.getElementById('new-folder-input').value.trim().toUpperCase();
    if (!inputName) {
        showToast("Please enter a valid folder name.", "warning");
        return;
    }
    if (folders.includes(inputName)) {
        showToast("This folder already exists.", "warning");
        return;
    }
    folders.push(inputName);
    saveFoldersToStorage();
    renderFoldersList();
    renderFolderDropdown();
    closeFolderModal();
    showToast(`Folder "${inputName}" created successfully!`, "success");
}

function askDeleteTask(taskId) {
    deletionTargetId = taskId;
    const modal = document.getElementById('confirm-modal');
    const card = document.getElementById('confirm-modal-card');
    modal.classList.remove('hidden');
    document.getElementById('confirm-delete-btn').onclick = function() {
        confirmDeleteTask();
    }
    setTimeout(() => {
        card.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeConfirmModal() {
    deletionTargetId = null;
    const modal = document.getElementById('confirm-modal');
    const card = document.getElementById('confirm-modal-card');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function confirmDeleteTask() {
    if (deletionTargetId) {
        tasks = tasks.filter(t => t.id !== deletionTargetId);
        saveTasksToStorage();
        renderActiveView();
        updateAllAnalytics();
        closeConfirmModal();
        showToast("Task successfully removed", "error");
    }
}

function renderFoldersList() {
    const container = document.getElementById('folder-list-container');
    const mobileContainer = document.getElementById('mobile-folder-list-container');
    let htmlContent = "";

    folders.forEach(folder => {
        let count = tasks.filter(t => t.folder === folder && !t.completed).length;
        let activeClass = currentFilterCategory === folder ? 'bg-brand-50 text-brand-600 dark:bg-slate-800/50 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40';

        htmlContent += `
            <button onclick="setFilterCategory('${folder}')" class="sidebar-category-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeClass}" data-category="${folder}">
                <span class="flex items-center gap-2.5 truncate">
                    <span class="w-2.5 h-2.5 rounded bg-brand-500/20 border border-brand-500 text-brand-500 flex items-center justify-center font-extrabold text-[8px] flex-shrink-0">#</span>
                    <span class="truncate uppercase text-xs tracking-wider">${folder}</span>
                </span>
                <span class="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-semibold flex-shrink-0">${count}</span>
            </button>
        `;
    });

    container.innerHTML = htmlContent;

    let mobileHtmlContent = "";
    folders.forEach(folder => {
        let count = tasks.filter(t => t.folder === folder && !t.completed).length;
        let activeClass = currentFilterCategory === folder ? 'bg-brand-50 text-brand-600 dark:bg-slate-800/50 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40';

        mobileHtmlContent += `
            <button onclick="setFilterCategory('${folder}'); toggleMobileSidebar(false);" class="mobile-sidebar-category-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeClass}" data-category="${folder}">
                <span class="flex items-center gap-2.5 truncate">
                    <span class="w-2.5 h-2.5 rounded bg-brand-500/20 border border-brand-500 text-brand-500 flex items-center justify-center font-extrabold text-[8px] flex-shrink-0">#</span>
                    <span class="truncate uppercase text-xs tracking-wider">${folder}</span>
                </span>
                <span class="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-semibold flex-shrink-0">${count}</span>
            </button>
        `;
    });

    mobileContainer.innerHTML = mobileHtmlContent;
}

function renderFolderDropdown() {
    const dropdown = document.getElementById('task-folder-field');
    let content = "";
    folders.forEach(folder => {
        content += `<option value="${folder}">${folder}</option>`;
    });
    dropdown.innerHTML = content;
}

function setFilterCategory(category) {
    currentFilterCategory = category;
    let titleEl = document.getElementById('current-view-title');
    if (category === 'All') titleEl.innerText = "All Tasks Grid";
    else if (category === 'Today') titleEl.innerText = "Today's Focus";
    else if (category === 'Upcoming') titleEl.innerText = "Upcoming Events & Sprints";
    else titleEl.innerText = `${category} Folder`;

    updateSidebarActiveStates(category);
    renderActiveView();
    updateAllAnalytics();
}

function updateSidebarActiveStates(category) {
    const btns = document.querySelectorAll('.sidebar-category-btn');
    btns.forEach(btn => {
        const btnCat = btn.getAttribute('data-category');
        if (btnCat === category) {
            btn.className = "sidebar-category-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-brand-50 text-brand-600 dark:bg-slate-800/50 dark:text-brand-400";
        } else {
            btn.className = "sidebar-category-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40";
        }
    });

    const mobileBtns = document.querySelectorAll('.mobile-sidebar-category-btn');
    mobileBtns.forEach(btn => {
        const btnCat = btn.getAttribute('data-category');
        if (btnCat === category) {
            btn.className = "mobile-sidebar-category-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-brand-50 text-brand-600 dark:bg-slate-800/50 dark:text-brand-400";
        } else {
            btn.className = "mobile-sidebar-category-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40";
        }
    });
}

function setFilterStatus(status) {
    currentFilterStatus = status;
    const statuses = ['All', 'Active', 'Completed'];
    statuses.forEach(s => {
        const btn = document.getElementById(`status-btn-${s}`);
        if (s === status) {
            btn.className = "px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white";
        } else {
            btn.className = "px-3 py-1.5 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-950 dark:hover:text-slate-200 transition-all";
        }
    });
    renderActiveView();
}

function setViewMode(view) {
    currentViewMode = view;
    const listBtn = document.getElementById('view-mode-List');
    const boardBtn = document.getElementById('view-mode-Board');
    const listContainer = document.getElementById('list-view-container');
    const boardContainer = document.getElementById('board-view-container');

    if (view === 'List') {
        listBtn.className = "p-1 px-2.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm";
        boardBtn.className = "p-1 px-2.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200";
        listContainer.classList.remove('hidden');
        boardContainer.classList.add('hidden');
    } else {
        boardBtn.className = "p-1 px-2.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm";
        listBtn.className = "p-1 px-2.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200";
        listContainer.classList.add('hidden');
        boardContainer.classList.remove('hidden');
    }

    renderActiveView();
}

function handleSearch(val) {
    searchQuery = val.trim().toLowerCase();
    renderActiveView();
}

function handleSortChange(sortField) {
    currentSortField = sortField;
    renderActiveView();
}

function getProcessedTasks() {
    const todayStr = "2026-06-14";
    let filtered = tasks.filter(task => {
        if (currentFilterCategory === 'Today') {
            if (task.dueDate !== todayStr) return false;
        } else if (currentFilterCategory === 'Upcoming') {
            if (task.dueDate <= todayStr) return false;
        } else if (currentFilterCategory !== 'All') {
            if (task.folder !== currentFilterCategory) return false;
        }
        if (currentFilterStatus === 'Active') {
            if (task.completed) return false;
        } else if (currentFilterStatus === 'Completed') {
            if (!task.completed) return false;
        }
        if (searchQuery) {
            const matchesTitle = task.title.toLowerCase().includes(searchQuery);
            const matchesDesc = task.desc.toLowerCase().includes(searchQuery);
            const matchesFolder = task.folder.toLowerCase().includes(searchQuery);
            if (!matchesTitle && !matchesDesc && !matchesFolder) return false;
        }
        return true;
    });
    filtered.sort((a, b) => {
        if (currentSortField === 'dueDate') {
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (currentSortField === 'priority') {
            const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        } else if (currentSortField === 'alphabetical') {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });
    return filtered;
}

function renderActiveView() {
    const filteredTasks = getProcessedTasks();
    const emptyState = document.getElementById('tasks-empty-state');

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
        document.getElementById('list-view-container').innerHTML = "";
        clearBoardColumns();
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    if (currentViewMode === 'List') {
        renderListView(filteredTasks);
    } else {
        renderBoardView(filteredTasks);
    }
}

function renderListView(filteredTasks) {
    const container = document.getElementById('list-view-container');
    let contentHtml = "";

    filteredTasks.forEach(task => {
        let pBadgeClass = "";
        if (task.priority === 'HIGH') pBadgeClass = "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400";
        else if (task.priority === 'MEDIUM') pBadgeClass = "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";
        else pBadgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

        let progressPercent = 0;
        if (task.checklist && task.checklist.length > 0) {
            const checkedCount = task.checklist.filter(item => item.done).length;
            progressPercent = Math.round((checkedCount / task.checklist.length) * 100);
        } else {
            progressPercent = task.completed ? 100 : 0;
        }

        const todayRef = new Date(2026, 5, 14);
        const taskDate = new Date(task.dueDate + 'T00:00:00');
        const diffTime = taskDate - todayRef;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dateBadgeClass = "text-slate-400 dark:text-slate-500";
        let dateDisplayValue = task.dueDate;
        if (diffDays === 0) {
            dateBadgeClass = "text-amber-500 font-semibold";
            dateDisplayValue = "Due Today";
        } else if (diffDays === 1) {
            dateBadgeClass = "text-emerald-500 font-semibold";
            dateDisplayValue = "Due Tomorrow";
        } else if (diffDays < 0) {
            dateBadgeClass = "text-rose-500 font-semibold";
            dateDisplayValue = `Overdue (${Math.abs(diffDays)}d)`;
        } else {
            dateDisplayValue = `Due in ${diffDays}d`;
        }

        contentHtml += `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 transition-all hover:shadow-md hover:border-brand-500/50 dark:hover:border-brand-500/40 ${task.completed ? 'opacity-70' : ''}">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 min-w-0 flex-1">
                        <button onclick="event.stopPropagation(); toggleTaskCompletion('${task.id}')" class="mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${task.completed ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 dark:border-slate-700 hover:border-brand-500'} flex-shrink-0 z-10">
                            ${task.completed ? '<svg class="w-3.5 h-3.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>' : ''}
                        </button>
                        <div onclick="openEditModal('${task.id}')" class="min-w-0 flex-1 cursor-pointer select-none">
                            <div class="flex flex-wrap items-center gap-2 mb-1.5">
                                <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-brand-500 dark:hover:text-brand-400 transition-colors ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${escapeHtml(task.title)}</h4>
                                <span class="px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                    ${task.folder}
                                </span>
                                <span class="px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase ${pBadgeClass}">
                                    ${task.priority}
                                </span>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 break-words mb-3 ${task.completed ? 'line-through' : ''}">
                                ${escapeHtml(task.desc || 'No descriptions provided for this active task. Click to edit/add details.')}
                            </p>
                            ${task.checklist && task.checklist.length > 0 ? `
                                <div class="mb-3 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800" onclick="event.stopPropagation()">
                                    <div class="flex items-center justify-between mb-1.5">
                                        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                            Checklist Progress
                                        </span>
                                        <span class="text-[10px] font-extrabold text-brand-500">${progressPercent}%</span>
                                    </div>
                                    <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                        <div class="bg-brand-500 h-full rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
                                    </div>
                                    <div class="space-y-1">
                                        ${task.checklist.map(item => `
                                            <div class="flex items-center gap-2">
                                                <button onclick="toggleSubtaskCompletion('${task.id}', '${item.id}')" class="w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${item.done ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'border-slate-300 dark:border-slate-700'}">
                                                    ${item.done ? '<svg class="w-2.5 h-2.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>' : ''}
                                                </button>
                                                <span class="text-xs ${item.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'} truncate">
                                                    ${escapeHtml(item.text)}
                                                </span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            <div class="flex items-center gap-1.5 text-xs">
                                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <span class="${dateBadgeClass}">${dateDisplayValue}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <button onclick="openEditModal('${task.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all" title="Edit Task details">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onclick="askDeleteTask('${task.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all" title="Delete Task">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = contentHtml;
}

function renderBoardView(filteredTasks) {
    clearBoardColumns();

    const colLow = document.getElementById('board-column-low');
    const colMedium = document.getElementById('board-column-medium');
    const colHigh = document.getElementById('board-column-high');

    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;

    filteredTasks.forEach(task => {
        const cardHtml = `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl space-y-2 shadow-sm relative hover:shadow-md hover:border-brand-500/50 dark:hover:border-brand-500/40 transition-all ${task.completed ? 'opacity-70' : ''}">
                <div class="flex items-start justify-between gap-1.5">
                    <span class="px-2 py-0.5 text-[8px] font-bold uppercase rounded tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        ${task.folder}
                    </span>
                    <div class="flex items-center gap-1">
                        <button onclick="openEditModal('${task.id}')" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onclick="askDeleteTask('${task.id}')" class="text-slate-400 hover:text-rose-500 p-0.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                <div onclick="openEditModal('${task.id}')" class="cursor-pointer space-y-2">
                    <div class="flex items-start gap-2">
                        <button onclick="event.stopPropagation(); toggleTaskCompletion('${task.id}')" class="mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${task.completed ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 dark:border-slate-700'} flex-shrink-0">
                            ${task.completed ? '<svg class="w-2.5 h-2.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>' : ''}
                        </button>
                        <h5 class="text-xs font-bold text-slate-900 dark:text-white break-words ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${escapeHtml(task.title)}</h5>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 break-words line-clamp-2">${escapeHtml(task.desc || '')}</p>
                    <div class="pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500" onclick="event.stopPropagation()">
                        <span class="flex items-center gap-1">
                            <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            ${task.dueDate}
                        </span>
                        ${task.checklist && task.checklist.length > 0 ? `
                            <span class="text-brand-500 font-semibold">
                                ${task.checklist.filter(item => item.done).length}/${task.checklist.length} Checklist
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        if (task.priority === 'HIGH') {
            colHigh.innerHTML += cardHtml;
            highCount++;
        } else if (task.priority === 'MEDIUM') {
            colMedium.innerHTML += cardHtml;
            medCount++;
        } else {
            colLow.innerHTML += cardHtml;
            lowCount++;
        }
    });

    document.getElementById('board-count-low').innerText = lowCount;
    document.getElementById('board-count-medium').innerText = medCount;
    document.getElementById('board-count-high').innerText = highCount;
}

function clearBoardColumns() {
    document.getElementById('board-column-low').innerHTML = "";
    document.getElementById('board-column-medium').innerHTML = "";
    document.getElementById('board-column-high').innerHTML = "";
}

function toggleTaskCompletion(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index].completed = !tasks[index].completed;
        if (tasks[index].checklist && tasks[index].checklist.length > 0) {
            tasks[index].checklist.forEach(item => {
                item.done = tasks[index].completed;
            });
        }
        saveTasksToStorage();
        renderActiveView();
        updateAllAnalytics();
        showToast(tasks[index].completed ? "Task Completed" : "Task restored to active", "success");
    }
}

function toggleSubtaskCompletion(taskId, subtaskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const subIndex = tasks[taskIndex].checklist.findIndex(s => s.id === subtaskId);
        if (subIndex !== -1) {
            tasks[taskIndex].checklist[subIndex].done = !tasks[taskIndex].checklist[subIndex].done;
            const totalSubtasks = tasks[taskIndex].checklist.length;
            const completedSubtasks = tasks[taskIndex].checklist.filter(item => item.done).length;
            tasks[taskIndex].completed = completedSubtasks === totalSubtasks;
            saveTasksToStorage();
            renderActiveView();
            updateAllAnalytics();
        }
    }
}

function updateAllAnalytics() {
    const todayStr = "2026-06-14";
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const activeTasks = tasks.filter(t => !t.completed);
    let progressPercent = 0;
    if (total > 0) progressPercent = Math.round((completed / total) * 100);
    document.getElementById('stats-percentage-text').innerText = `${progressPercent}%`;
    document.getElementById('stats-fraction-text').innerText = `${completed} of ${total} done`;
    const progressRing = document.getElementById('stats-progress-ring');
    progressRing.setAttribute('stroke-dasharray', `${progressPercent}, 100`);
    const highCount = activeTasks.filter(t => t.priority === 'HIGH').length;
    document.getElementById('stats-high-priority-count').innerText = highCount;
    const totalHigh = tasks.filter(t => t.priority === 'HIGH').length;
    let highBarPercent = 0;
    if (totalHigh > 0) highBarPercent = Math.round(((totalHigh - highCount) / totalHigh) * 100);
    document.getElementById('stats-high-bar').style.width = `${highBarPercent}%`;
    let urgentCount = 0;
    let overdueCount = 0;
    const todayRef = new Date(2026, 5, 14);
    activeTasks.forEach(t => {
        const taskDate = new Date(t.dueDate + 'T00:00:00');
        const diffTime = taskDate - todayRef;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays >= 0) urgentCount++;
        else if (diffDays < 0) overdueCount++;
    });
    document.getElementById('stats-urgent-deadlines-count').innerText = urgentCount;
    document.getElementById('stats-urgent-text').innerText = `${overdueCount} overdue`;
    const scoreEl = document.getElementById('stats-productivity-grade');
    if (progressPercent >= 90) {
        scoreEl.innerText = "Ultimate Zen";
        scoreEl.className = "text-sm sm:text-lg font-bold tracking-tight text-emerald-500";
    } else if (progressPercent >= 60) {
        scoreEl.innerText = "Steady Flow";
        scoreEl.className = "text-sm sm:text-lg font-bold tracking-tight text-brand-500";
    } else if (progressPercent >= 30) {
        scoreEl.innerText = "Rising Focus";
        scoreEl.className = "text-sm sm:text-lg font-bold tracking-tight text-amber-500";
    } else {
        scoreEl.innerText = "Deep Sleep";
        scoreEl.className = "text-sm sm:text-lg font-bold tracking-tight text-slate-400";
    }
    renderFoldersList();
    const countAll = tasks.filter(t => !t.completed).length;
    const countToday = tasks.filter(t => t.dueDate === todayStr && !t.completed).length;
    const countUpcoming = tasks.filter(t => t.dueDate > todayStr && !t.completed).length;
    document.getElementById('all-count-badge').innerText = countAll;
    document.getElementById('today-count-badge').innerText = countToday;
    document.getElementById('upcoming-count-badge').innerText = countUpcoming;
    document.getElementById('mobile-all-count-badge').innerText = countAll;
    document.getElementById('mobile-today-count-badge').innerText = countToday;
    document.getElementById('mobile-upcoming-count-badge').innerText = countUpcoming;
}

function addSubtaskField(initialText = "", isDone = false) {
    const container = document.getElementById('subtask-builder-list');
    const subId = "sub-field-" + Date.now() + Math.random().toString(36).substr(2, 4);
    const itemDiv = document.createElement('div');
    itemDiv.id = subId;
    itemDiv.className = "flex items-center gap-2";
    itemDiv.innerHTML = `
        <input type="checkbox" ${isDone ? 'checked' : ''} class="subtask-field-check w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-brand-500 focus:ring-brand-500 flex-shrink-0">
        <input type="text" value="${escapeHtml(initialText)}" placeholder="Checklist item description..." class="subtask-field-text flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-900 dark:text-white placeholder-slate-400">
        <button type="button" onclick="removeSubtaskField('${subId}')" class="p-1 text-slate-400 hover:text-rose-500 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
    `;
    container.appendChild(itemDiv);
    document.getElementById('subtask-builder-empty').classList.add('hidden');
}

function removeSubtaskField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) field.remove();
    const container = document.getElementById('subtask-builder-list');
    if (container.children.length === 0) {
        document.getElementById('subtask-builder-empty').classList.remove('hidden');
    }
}

function getSubtasksFromForm() {
    const fields = document.querySelectorAll('#subtask-builder-list > div');
    const subtasksList = [];
    fields.forEach(field => {
        const textInput = field.querySelector('.subtask-field-text').value.trim();
        const isChecked = field.querySelector('.subtask-field-check').checked;
        if (textInput) {
            subtasksList.push({
                id: "sub-form-" + Math.random().toString(36).substr(2, 9),
                text: textInput,
                done: isChecked
            });
        }
    });
    return subtasksList;
}

function openCreateModal() {
    document.getElementById('modal-title').innerText = "Add New Task";
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = "";
    document.getElementById('subtask-builder-list').innerHTML = "";
    document.getElementById('subtask-builder-empty').classList.remove('hidden');
    document.getElementById('modal-delete-btn').classList.add('hidden');
    document.getElementById('task-date-field').value = "2026-06-14";
    const modal = document.getElementById('task-modal');
    const card = document.getElementById('task-modal-card');
    modal.classList.remove('hidden');
    setTimeout(() => {
        card.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    document.getElementById('modal-title').innerText = "Modify Active Task";
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title-field').value = task.title;
    document.getElementById('task-folder-field').value = task.folder;
    document.getElementById('task-desc-field').value = task.desc || "";
    document.getElementById('task-priority-field').value = task.priority;
    document.getElementById('task-date-field').value = task.dueDate;
    document.getElementById('modal-delete-btn').classList.remove('hidden');
    const builderList = document.getElementById('subtask-builder-list');
    builderList.innerHTML = "";
    if (task.checklist && task.checklist.length > 0) {
        document.getElementById('subtask-builder-empty').classList.add('hidden');
        task.checklist.forEach(item => addSubtaskField(item.text, item.done));
    } else {
        document.getElementById('subtask-builder-empty').classList.remove('hidden');
    }
    const modal = document.getElementById('task-modal');
    const card = document.getElementById('task-modal-card');
    modal.classList.remove('hidden');
    setTimeout(() => {
        card.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    const card = document.getElementById('task-modal-card');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function triggerModalDelete() {
    const taskId = document.getElementById('task-id').value;
    if (taskId) {
        closeTaskModal();
        askDeleteTask(taskId);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    const taskId = document.getElementById('task-id').value;
    const titleVal = document.getElementById('task-title-field').value.trim();
    const folderVal = document.getElementById('task-folder-field').value;
    const descVal = document.getElementById('task-desc-field').value.trim();
    const priorityVal = document.getElementById('task-priority-field').value;
    const dateVal = document.getElementById('task-date-field').value;
    const listCheckitems = getSubtasksFromForm();
    if (!titleVal || !dateVal) {
        showToast("Please fill in all mandatory fields (*).", "warning");
        return;
    }
    if (taskId) {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index].title = titleVal;
            tasks[index].folder = folderVal;
            tasks[index].desc = descVal;
            tasks[index].priority = priorityVal;
            tasks[index].dueDate = dateVal;
            tasks[index].checklist = listCheckitems;
            if (listCheckitems.length > 0) {
                const allDone = listCheckitems.every(item => item.done);
                tasks[index].completed = allDone;
            }
            showToast("Task updated", "success");
        }
    } else {
        const newTask = {
            id: "task-" + Date.now(),
            title: titleVal,
            folder: folderVal,
            desc: descVal,
            priority: priorityVal,
            dueDate: dateVal,
            completed: false,
            checklist: listCheckitems
        };
        if (listCheckitems.length > 0) {
            const allDone = listCheckitems.every(item => item.done);
            newTask.completed = allDone;
        }
        tasks.push(newTask);
        showToast("New Task created successfully!", "success");
    }
    saveTasksToStorage();
    renderActiveView();
    updateAllAnalytics();
    closeTaskModal();
}

function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    const toastId = "toast-" + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = "flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold bg-white dark:bg-slate-900 transition-all transform translate-y-2 opacity-0 pointer-events-auto min-w-[200px] max-w-sm";
    let iconHtml = "";
    if (type === "success") {
        toast.classList.add('border-emerald-500/20', 'text-emerald-600', 'dark:text-emerald-400');
        iconHtml = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else if (type === "error") {
        toast.classList.add('border-rose-500/20', 'text-rose-500', 'dark:text-rose-400');
        iconHtml = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else if (type === "warning") {
        toast.classList.add('border-amber-500/20', 'text-amber-500', 'dark:text-amber-400');
        iconHtml = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    } else {
        toast.classList.add('border-slate-200', 'dark:border-slate-800', 'text-slate-600', 'dark:text-slate-300');
        iconHtml = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }
    toast.innerHTML = `${iconHtml}<span class="flex-1">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 50);
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => { toast.remove(); }, 300);
    }, 3500);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
