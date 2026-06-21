# ZenFlow Task Manager

ZenFlow is a polished browser-based TODO app built with Tailwind CSS and vanilla JavaScript. It offers task organization, folder filtering, priority views, checklist support, and local persistence.

## Features

- Create, edit, and delete tasks
- Task folders and custom category filtering
- Today / Upcoming task views
- Priority-based board and list views
- Subtask checklist support with progress tracking
- Task due dates and overdue/urgent indicators
- Dark mode toggle with theme persistence
- Local storage persistence for tasks and folders
- Live analytics dashboard with completion rate and urgency metrics
- Responsive layout optimized for desktop and mobile

## Built With

- HTML
- Tailwind CSS (CDN)
- JavaScript

## Project Structure

- `index.html` — app layout and UI structure
- `style.css` — custom styling and visual polish
- `app.js` — task logic, filters, storage, and UI rendering

## Usage

1. Open `index.html` in a modern browser.
2. Use the sidebar to switch between All Tasks, Today, Upcoming, or folder views.
3. Click `New Task` to add a task with priority, due date, and optional checklist items.
4. Toggle task completion or edit tasks directly from the task cards.
5. Switch between `List` and `Board` views for different workflows.
6. Toggle dark mode and continue where you left off — data is saved in the browser.

## Notes

- Task data is stored in `localStorage` under `zenflow_tasks` and `zenflow_folders`.
- The app is fully client-side and requires no backend.
- For best results, use a modern desktop browser with JavaScript enabled.

## License

Add your preferred open source license before publishing on GitHub.
