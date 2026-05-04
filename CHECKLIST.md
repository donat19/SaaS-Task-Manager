# Strata — Чеклист перехода в полноценный проект

## Стек
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **База данных**: SQLite + Prisma ORM
- **Auth**: JWT + bcrypt
- **Realtime**: Socket.io
- **Файлы**: Multer (локальное хранилище)
- **Поиск**: Full-text search через SQLite FTS5

---

## Фаза 1 — Инфраструктура проекта ✅
- [x] Инициализировать monorepo структуру (`/client`, `/server`)
- [x] Настроить `package.json` в корне с общими скриптами
- [x] Настроить Vite для клиента
- [x] Настроить Express-сервер с базовой структурой
- [x] Настроить ESLint
- [x] Настроить `.env` файлы (`.env.example` в репозиторий, `.env` в `.gitignore`)
- [x] Создать `README.md` с инструкцией запуска

---

## Фаза 2 — База данных ✅
- [x] Установить Prisma + SQLite
- [x] Создать схему базы данных:
  - [x] `User` (id, name, email, password, role, avatar, createdAt)
  - [x] `Task` (id, title, description, status, priority, dueDate, createdAt, updatedAt)
  - [x] `Tag` (id, name, color)
  - [x] `Comment` (id, text, taskId, userId, createdAt)
  - [x] `Attachment` (id, filename, path, size, taskId, userId, createdAt)
  - [x] `Notification` (id, text, read, userId, taskId, createdAt)
  - [x] `AuditLog` (id, action, entity, entityId, actorId, meta, createdAt)
  - [x] Связующие таблицы: `TaskAssignee`, `TaskTag`
- [x] Написать первую миграцию (`prisma migrate dev`)
- [x] Написать seed-скрипт с тестовыми данными (из текущего `data.jsx`)

---

## Фаза 3 — Backend API ✅
- [x] Структура папок: `routes/`, `middleware/`, `lib/`
- [x] Подключить Prisma Client глобально

### Auth
- [x] `POST /api/auth/register` — регистрация
- [x] `POST /api/auth/login` — вход, возврат JWT
- [x] `GET /api/auth/me` — текущий пользователь
- [x] Middleware `requireAuth` — проверка JWT на защищённых роутах
- [x] Middleware `requireAdmin` — проверка роли

### Задачи
- [x] `GET /api/tasks` — список всех задач (с фильтрами: status, priority, assignee, tag)
- [x] `POST /api/tasks` — создать задачу
- [x] `GET /api/tasks/:id` — детали задачи
- [x] `PATCH /api/tasks/:id` — обновить задачу
- [x] `DELETE /api/tasks/:id` — удалить задачу
- [x] `PATCH /api/tasks/:id/status` — сменить статус (drag-and-drop)

### Комментарии
- [x] `GET /api/comments/task/:id` — список комментариев
- [x] `POST /api/comments/task/:id` — добавить комментарий
- [x] `DELETE /api/comments/:id` — удалить комментарий

### Файлы
- [x] `POST /api/attachments/task/:id` — загрузить файл (Multer)
- [x] `GET /api/attachments/task/:id` — список файлов
- [x] `DELETE /api/attachments/:id` — удалить файл
- [x] `GET /uploads/:filename` — отдать файл (static)

### Пользователи
- [x] `GET /api/users` — список пользователей (для assignee)
- [x] `PATCH /api/users/:id` — обновить профиль
- [x] `PATCH /api/users/:id/role` — сменить роль (только admin)

### Теги
- [x] `GET /api/tags` — список тегов
- [x] `POST /api/tags` — создать тег
- [x] `DELETE /api/tags/:id` — удалить тег

### Уведомления
- [x] `GET /api/notifications` — уведомления текущего пользователя
- [x] `PATCH /api/notifications/:id/read` — отметить прочитанным
- [x] `PATCH /api/notifications/read-all` — отметить все прочитанными

### Поиск
- [x] `GET /api/search?q=...` — поиск по задачам и комментариям

### Аудит
- [x] `GET /api/audit` — журнал аудита (только admin, с пагинацией)
- [x] Автоматически писать в аудит при CRUD-операциях над задачами, пользователями

---

## Фаза 4 — Realtime (Socket.io) ✅ (сервер)
- [x] Подключить Socket.io к серверу
- [x] Аутентификация WebSocket через JWT
- [x] События:
  - [x] `task:created` — новая задача
  - [x] `task:updated` — задача изменена
  - [x] `task:deleted` — задача удалена
  - [x] `task:moved` — задача перемещена в другую колонку
  - [x] `comment:added` — новый комментарий
- [ ] На клиенте: подписаться на события и обновлять UI без перезагрузки

---

## Фаза 5 — Frontend (перенос на Vite) ✅
- [x] Создать Vite-проект в `/client`
- [x] Перенести все JSX-компоненты из `/src` в `/client/src`
- [x] Убрать CDN-зависимости из HTML
- [x] Настроить axios-обёртку для API-запросов
- [x] Добавить React Router для навигации
- [x] Реализовать контекст авторизации (`AuthContext`)

### Страницы
- [x] `/login` — страница входа
- [x] `/register` — страница регистрации
- [x] `/` — Kanban доска (данные из API)
- [x] Табличный вид (данные из API)
- [x] Журнал аудита (данные из API, только admin)

### Компоненты
- [x] Подключить реальный поиск (⌘K — SearchModal с debounce)
- [x] Подключить drag-and-drop к API (`PATCH /tasks/:id/status`)
- [x] Подключить загрузку файлов к API (Multer)
- [x] Подключить комментарии к API
- [x] Подключить уведомления к WebSocket (`notification:new`)

---

## Фаза 6 — Качество и безопасность ✅
- [x] Валидация входных данных на сервере (zod)
- [x] Rate limiting (`express-rate-limit` — 200 req/15min)
- [x] CORS настройка (только CLIENT_URL)
- [x] Helmet.js (HTTP security headers)
- [x] Обработка ошибок — глобальный error handler
- [x] Логирование запросов (morgan)
- [x] Пагинация для аудита и уведомлений (limit/page)

---

## Фаза 7 — Финальные штрихи (портфолио)
- [x] Обновить `README.md`: описание, инструкция запуска, API таблица
- [ ] Загрузить на GitHub
- [x] `npm run install:all && npm run dev` запускает всё одной командой

---

## Фаза 8 — UI: Сайдбар и навигация (из оригинала)
> Фичи из оригинального дизайна, которых ещё нет

### Множественные доски
- [ ] Модель `Board` в Prisma: `id, name, color, createdAt`
- [ ] `TaskBoard` связь — задача принадлежит доске
- [ ] `GET /api/boards`, `POST /api/boards`, `PATCH /api/boards/:id`, `DELETE /api/boards/:id`
- [ ] Сайдбар: список досок с цветными точками и счётчиком задач
- [ ] Кнопка `+` для создания новой доски (модал с именем и цветом)
- [ ] Переключение между досками — фильтрует задачи

### Сайдбар: Inbox / My week / Starred
- [ ] **Inbox** — задачи, где я ассайни, статус не `done` (+ счётчик)
- [ ] **My week** — задачи с `dueDate` в текущей неделе (+ счётчик)
- [ ] **Starred** — задачи, отмеченные звёздой; модель `StarredTask` или поле `starred` в Task

### Спринты / Board header
- [ ] Название спринта в заголовке доски (редактируемое поле)
- [ ] Подзаголовок / описание спринта
- [ ] Диапазон дат спринта (date range picker)
- [ ] Индикатор «X syncing» (количество активных WebSocket-клиентов на доске)
- [ ] Прогресс «67% on track» — `done / total * 100` с цветом

### Топбар
- [ ] Кластер аватаров участников доски (справа, max 4 + `+N`)
- [ ] Кнопка фильтров с бейджем активных фильтров (⌘F или иконка воронки)
- [ ] Кнопка сортировки задач в колонке
- [ ] Breadcrumbs: `Workspace / [Board name] / [Sprint name]`

### Карточки
- [ ] Прогресс-бар на карточке (процент выполнения подзадач или ручной %)
- [ ] Подзадачи: модель `Subtask`, отображение `2/5` на карточке

### Tweaks-панель (настройки интерфейса)
- [ ] Кнопка ⚙ открывает панель «Tweaks» (floating panel)
- [ ] Тёмная тема — toggle (уже есть, подключить в панель)
- [ ] Accent hue — слайдер `0–360°`, меняет CSS-переменную `--accent` через HSL
- [ ] Density — переключатель `compact / comfortable` (меняет padding карточек и строк)
- [ ] Tour-кнопки: «Replay onboarding», «Open shortcuts overlay», «Open audit log»

### Колонки
- [ ] Кнопка `···` в заголовке колонки — меню: переименовать, скрыть колонку, удалить все задачи

---

## Фаза 9 — Members (управление участниками)
- [ ] Страница `/members` в сайдбаре (только admin)
- [ ] Список всех пользователей: аватар, имя, email, роль, дата регистрации
- [ ] Смена роли пользователя (admin ↔ user) прямо из таблицы
- [ ] Деактивация / удаление пользователя (admin only)
- [ ] Приглашение нового пользователя по email (создание аккаунта без регистрации)
- [ ] Backend: `DELETE /api/users/:id` (admin only)

---

## Фаза 10 — Direct Messages (личные сообщения)
- [ ] Модель `Message` в Prisma: `id, text, fromId, toId, createdAt, read`
- [ ] `GET /api/dm/:userId` — история переписки с пользователем
- [ ] `POST /api/dm/:userId` — отправить сообщение
- [ ] Socket.io событие `dm:message` — доставка в реальном времени в комнату `user:${id}`
- [ ] UI: панель DM в сайдбаре со списком диалогов
- [ ] UI: окно чата с историей и полем ввода
- [ ] Бейдж с количеством непрочитанных DM в сайдбаре
- [ ] Отметка сообщений как прочитанных при открытии диалога

---

## Фаза 11 — Фильтрация и поиск на доске
- [ ] Панель фильтров над доской: по статусу, приоритету, тегу, ассайни
- [ ] Активные фильтры отображаются как чипы с крестиком (сброс одного)
- [ ] Кнопка «Сбросить всё»
- [ ] Фильтры сохраняются в URL-параметрах (`?priority=high&tag=bug`)
- [ ] Backend: `GET /api/tasks` уже поддерживает фильтры — подключить к UI

---

## Фаза 12 — Профиль пользователя
- [ ] Страница профиля (доступна всем)
- [ ] Смена имени
- [ ] Загрузка аватара (Multer, уже есть `/api/users/:id`)
- [ ] Смена пароля (`PATCH /api/users/:id/password` с проверкой старого)
- [ ] Отображение аватара во всём приложении (аватар уже в модели)

---

## Фаза 13 — Аналитика и экспорт
- [ ] Страница метрик (только admin или все?)
  - [ ] График выполнения задач по неделям (bar chart, нативный SVG или recharts)
  - [ ] Карточки: всего задач / в работе / просрочено / выполнено
  - [ ] Топ исполнителей по закрытым задачам
- [ ] Экспорт задач в CSV (`GET /api/tasks/export?format=csv`)
- [ ] Backend: агрегирующий эндпоинт `GET /api/stats`

---

## Фаза 14 — Дедлайн-напоминания
- [ ] Cron-джоб на сервере (node-cron, раз в час)
- [ ] Находит задачи с `dueDate` через 24 часа, статус не `done`
- [ ] Создаёт уведомление каждому ассайни через `sendNotification`
- [ ] Не дублирует: хранить флаг `reminded` в модели Task или отдельную таблицу

---

## Прогресс

| Фаза | Статус |
|------|--------|
| 1. Инфраструктура | ✅ Готова |
| 2. База данных | ✅ Готова |
| 3. Backend API | ✅ Готов |
| 4. Realtime (сервер) | ✅ Готов |
| 5. Frontend | ✅ Готов |
| 6. Безопасность | ✅ Готова |
| 7. Финал | 🔄 GitHub остался |
| 8. UI из оригинала (доски, tweaks, спринты) | ⬜ Не начата |
| 9. Members | ⬜ Не начата |
| 10. Direct Messages | ⬜ Не начата |
| 11. Фильтрация доски | ⬜ Не начата |
| 12. Профиль | ⬜ Не начата |
| 13. Аналитика | ⬜ Не начата |
| 14. Напоминания | ⬜ Не начата |
