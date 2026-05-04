# Strata — Чеклист перехода в полноценный проект

## Стек
- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Fastify
- **База данных**: SQLite + Prisma ORM
- **Auth**: JWT + bcrypt
- **Realtime**: Socket.io
- **Файлы**: Multer (локальное хранилище)
- **Поиск**: Full-text search через SQLite FTS5

---

## Фаза 1 — Инфраструктура проекта
- [ ] Инициализировать monorepo структуру (`/client`, `/server`)
- [ ] Настроить `package.json` в корне с общими скриптами
- [ ] Настроить Vite для клиента
- [ ] Настроить Express-сервер с базовой структурой
- [ ] Настроить ESLint + Prettier
- [ ] Настроить `.env` файлы (`.env.example` в репозиторий, `.env` в `.gitignore`)
- [ ] Создать `README.md` с инструкцией запуска

---

## Фаза 2 — База данных
- [ ] Установить Prisma + SQLite
- [ ] Создать схему базы данных:
  - [ ] `User` (id, name, email, password, role, avatar, createdAt)
  - [ ] `Task` (id, title, description, status, priority, dueDate, createdAt, updatedAt)
  - [ ] `Tag` (id, name, color)
  - [ ] `Comment` (id, text, taskId, userId, createdAt)
  - [ ] `Attachment` (id, filename, path, size, taskId, userId, createdAt)
  - [ ] `Notification` (id, text, read, userId, taskId, createdAt)
  - [ ] `AuditLog` (id, action, entity, entityId, actorId, meta, createdAt)
  - [ ] Связующие таблицы: `TaskAssignee`, `TaskTag`
- [ ] Написать первую миграцию (`prisma migrate dev`)
- [ ] Написать seed-скрипт с тестовыми данными (из текущего `data.jsx`)

---

## Фаза 3 — Backend API
- [ ] Структура папок: `routes/`, `controllers/`, `middleware/`, `lib/`
- [ ] Подключить Prisma Client глобально

### Auth
- [ ] `POST /api/auth/register` — регистрация
- [ ] `POST /api/auth/login` — вход, возврат JWT
- [ ] `POST /api/auth/logout` — выход
- [ ] `GET /api/auth/me` — текущий пользователь
- [ ] Middleware `requireAuth` — проверка JWT на защищённых роутах
- [ ] Middleware `requireAdmin` — проверка роли

### Задачи
- [ ] `GET /api/tasks` — список всех задач (с фильтрами: status, priority, assignee, tag)
- [ ] `POST /api/tasks` — создать задачу
- [ ] `GET /api/tasks/:id` — детали задачи
- [ ] `PATCH /api/tasks/:id` — обновить задачу
- [ ] `DELETE /api/tasks/:id` — удалить задачу
- [ ] `PATCH /api/tasks/:id/status` — сменить статус (drag-and-drop)

### Комментарии
- [ ] `GET /api/tasks/:id/comments` — список комментариев
- [ ] `POST /api/tasks/:id/comments` — добавить комментарий
- [ ] `DELETE /api/comments/:id` — удалить комментарий

### Файлы
- [ ] `POST /api/tasks/:id/attachments` — загрузить файл (Multer)
- [ ] `GET /api/tasks/:id/attachments` — список файлов
- [ ] `DELETE /api/attachments/:id` — удалить файл
- [ ] `GET /api/uploads/:filename` — отдать файл

### Пользователи
- [ ] `GET /api/users` — список пользователей (для assignee)
- [ ] `PATCH /api/users/:id` — обновить профиль
- [ ] `PATCH /api/users/:id/role` — сменить роль (только admin)

### Теги
- [ ] `GET /api/tags` — список тегов
- [ ] `POST /api/tags` — создать тег
- [ ] `DELETE /api/tags/:id` — удалить тег

### Уведомления
- [ ] `GET /api/notifications` — уведомления текущего пользователя
- [ ] `PATCH /api/notifications/:id/read` — отметить прочитанным
- [ ] `PATCH /api/notifications/read-all` — отметить все прочитанными

### Поиск
- [ ] `GET /api/search?q=...` — полнотекстовый поиск по задачам и комментариям (SQLite FTS5)

### Аудит
- [ ] `GET /api/audit` — журнал аудита (только admin, с пагинацией)
- [ ] Автоматически писать в аудит при CRUD-операциях над задачами, пользователями, файлами

---

## Фаза 4 — Realtime (Socket.io)
- [ ] Подключить Socket.io к серверу
- [ ] Аутентификация WebSocket через JWT
- [ ] События:
  - [ ] `task:created` — новая задача
  - [ ] `task:updated` — задача изменена
  - [ ] `task:deleted` — задача удалена
  - [ ] `task:moved` — задача перемещена в другую колонку
  - [ ] `comment:added` — новый комментарий
  - [ ] `notification:new` — новое уведомление
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
| 1. Инфраструктура | ⬜ Не начата |
| 2. База данных | ⬜ Не начата |
| 3. Backend API | ⬜ Не начата |
| 4. Realtime | ⬜ Не начата |
| 5. Frontend | ⬜ Не начата |
| 6. Безопасность | ⬜ Не начата |
| 7. Финал | ⬜ Не начата |
