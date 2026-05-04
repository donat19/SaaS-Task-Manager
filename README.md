# Strata — Task Manager

SaaS-инструмент управления задачами. React + Vite на фронте, Node.js + Express + SQLite на бэке.

## Быстрый старт

### Требования
- Node.js 18+
- npm 9+

### Установка

```bash
# Установить все зависимости (корень + client + server)
npm run install:all
```

### База данных

```bash
# Создать таблицы
npm run db:migrate

# Заполнить тестовыми данными
npm run db:seed
```

### Запуск

```bash
# Запустить клиент и сервер одновременно
npm run dev
```

- Фронтенд: http://localhost:5173
- Бэкенд API: http://localhost:3000

### Тестовые аккаунты (после seed)

| Email | Пароль | Роль |
|-------|--------|------|
| alice@strata.app | admin123 | admin |
| bob@strata.app | user123 | user |
| carol@strata.app | user123 | user |

### Полезные команды

```bash
npm run db:studio    # Открыть Prisma Studio (GUI для БД)
npm run build        # Собрать фронтенд для продакшна
```

## Структура проекта

```
strata/
├── client/          # React + Vite фронтенд
│   └── src/
├── server/          # Node.js + Express бэкенд
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── lib/
│   └── prisma/
├── uploads/         # Загруженные файлы
└── package.json     # Корневой (запуск обоих частей)
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход |
| GET | /api/auth/me | Текущий пользователь |
| GET | /api/tasks | Список задач |
| POST | /api/tasks | Создать задачу |
| PATCH | /api/tasks/:id | Обновить задачу |
| DELETE | /api/tasks/:id | Удалить задачу |
| GET | /api/search?q= | Поиск |
| GET | /api/audit | Журнал аудита (admin) |
