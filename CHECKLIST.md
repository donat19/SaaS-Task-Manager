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

## Фаза 5 — Frontend (перенос на Vite)
- [ ] Создать Vite-проект в `/client`
- [ ] Перенести все JSX-компоненты из `/src` в `/client/src`
- [ ] Убрать CDN-зависимости из HTML
- [ ] Настроить `axios` или `fetch`-обёртку для API-запросов
- [ ] Добавить React Router для навигации
- [ ] Реализовать контекст авторизации (`AuthContext`)

### Страницы
- [ ] `/login` — страница входа
- [ ] `/register` — страница регистрации
- [ ] `/board` — Kanban доска (данные из API)
- [ ] `/table` — табличный вид (данные из API)
- [ ] `/audit` — журнал аудита (данные из API, только admin)

### Компоненты
- [ ] Подключить реальный поиск к Search-компоненту
- [ ] Подключить drag-and-drop к API (`PATCH /tasks/:id/status`)
- [ ] Подключить загрузку файлов к API
- [ ] Подключить комментарии к API
- [ ] Подключить уведомления к WebSocket
- [ ] Убрать `tweaks-panel.jsx` или оставить только для dev-режима

---

## Фаза 6 — Качество и безопасность
- [ ] Валидация входных данных на сервере (zod или express-validator)
- [ ] Rate limiting (`express-rate-limit`)
- [ ] CORS настройка
- [ ] Helmet.js (HTTP security headers)
- [ ] Обработка ошибок — глобальный error handler
- [ ] Логирование запросов (morgan)
- [ ] Пагинация для списков (tasks, audit, notifications)

---

## Фаза 7 — Финальные штрихи (портфолио)
- [ ] Обновить `README.md`: описание, скриншоты, инструкция запуска
- [ ] Добавить `docker-compose.yml` (опционально, для удобного запуска)
- [ ] Загрузить на GitHub
- [ ] Убедиться что `npm install && npm run dev` запускает весь проект одной командой

---

## Прогресс

| Фаза | Статус |
|------|--------|
| 1. Инфраструктура | ✅ Готова |
| 2. База данных | ✅ Готова |
| 3. Backend API | ✅ Готов |
| 4. Realtime (сервер) | ✅ Готов |
| 5. Frontend | ✅ Готов |
| 6. Безопасность | ⬜ Не начата |
| 7. Финал | ⬜ Не начата |
