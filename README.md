# MAX Chat — GREEN-API

Веб-чат для отправки и получения текстовых сообщений в MAX через [GREEN-API](https://green-api.com/max).
Интерфейс выполнен по мотивам [web.max.ru](https://web.max.ru/). Стек: React + Vite.

## Возможности

- Вход по учётным данным GREEN-API (`idInstance`, `apiTokenInstance`)
- Создание чата по номеру телефона получателя
- Отправка текстовых сообщений (метод `sendMessage`)
- Приём ответов в реальном времени (HTTP API: `receiveNotification` + `deleteNotification`)

## Требования

- Установленный [Node.js](https://nodejs.org/) 18+ (для локального запуска)
- Или [Docker](https://www.docker.com/) + Docker Compose (для запуска в контейнере)
- Аккаунт GREEN-API с созданным инстансом MAX

## Запуск локально (для разработки)

```bash
npm install
npm run dev
```

Откройте адрес, который выведет Vite (по умолчанию http://localhost:5173).

Продакшен-сборка и предпросмотр:

```bash
npm run build
npm run preview
```

## Запуск в Docker

### Вариант 1 — Docker Compose (рекомендуется)

```bash
docker compose up --build
```

Приложение будет доступно по адресу http://localhost:8080.

Остановить:

```bash
docker compose down
```

### Вариант 2 — Docker вручную

```bash
docker build -t max-chat-greenapi .
docker run -p 8080:80 max-chat-greenapi
```

Откройте http://localhost:8080.

## Как пользоваться

1. Откройте приложение в браузере.
2. Введите `idInstance` и `apiTokenInstance` из [личного кабинета GREEN-API](https://console.green-api.com)
   и нажмите **Войти**.
   - Галочка «Настроить инстанс для получения сообщений» очищает `webhookUrl`,
     чтобы работал приём через HTTP API. Можно снять, если настройки уже заданы вручную.
3. Нажмите **+** в боковой панели, введите номер телефона получателя и создайте чат.
4. Напишите сообщение и отправьте его (Enter — отправить, Shift+Enter — новая строка).
5. Когда получатель ответит в MAX, сообщение появится в чате слева.

## Структура проекта

```
src/
  api/greenApi.js          # запросы к GREEN-API
  components/
    LoginScreen.jsx        # экран входа
    Sidebar.jsx            # список чатов, поиск, статус
    ChatPanel.jsx          # переписка и поле ввода
    NewChatModal.jsx       # создание чата по номеру
    Avatar.jsx             # аватар с инициалами
  utils/phone.js           # нормализация номера и chatId
  App.jsx                  # состояние и поллинг входящих
  main.jsx                 # точка входа
  styles.css               # стили
```

## Примечания

- Входящие сообщения читаются через HTTP API (поллинг). Уведомления с непустым
  `webhookUrl` в очереди недоступны — поэтому при входе инстанс настраивается на их очистку.
- Запросы идут напрямую к `https://api.green-api.com`. Если у вашего инстанса закрыт CORS,
  потребуется собственный прокси.
