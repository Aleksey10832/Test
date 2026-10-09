import { useState } from 'react';
import Avatar from './Avatar';

function preview(chat) {
  const last = chat.messages[chat.messages.length - 1];
  if (!last) return 'Нет сообщений';
  const prefix = last.direction === 'out' ? 'Вы: ' : '';
  return `${prefix}${last.text}`;
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABELS = {
  connecting: 'Подключение…',
  online: 'На связи',
  error: 'Ошибка соединения',
  idle: 'Не подключено',
};

export default function Sidebar({
  chats,
  activeChatId,
  idInstance,
  connection,
  connectionError,
  onSelectChat,
  onNewChat,
  onLogout,
}) {
  const [query, setQuery] = useState('');
  const filtered = chats.filter((chat) =>
    chat.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-logo small">M</div>
          <h2>MAX</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          title="Выйти"
          onClick={onLogout}
        >
          ⎋
        </button>
      </header>

      <div className="sidebar-search">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск чата"
        />
        <button
          type="button"
          className="new-chat-button"
          title="Новый чат"
          onClick={onNewChat}
        >
          +
        </button>
      </div>

      <div className="chat-list">
        {filtered.length === 0 && (
          <div className="empty-list">
            <p>Пока нет чатов</p>
            <button type="button" className="btn-ghost" onClick={onNewChat}>
              Создать чат
            </button>
          </div>
        )}
        {filtered.map((chat) => {
          const last = chat.messages[chat.messages.length - 1];
          return (
            <button
              key={chat.id}
              type="button"
              className={`chat-item${chat.id === activeChatId ? ' active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <Avatar name={chat.name} />
              <div className="chat-item-body">
                <div className="chat-item-top">
                  <span className="chat-item-name">{chat.name}</span>
                  <span className="chat-item-time">
                    {formatTime(last?.timestamp)}
                  </span>
                </div>
                <div className="chat-item-preview">{preview(chat)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <footer className={`sidebar-footer status-${connection}`}>
        <span className="status-dot" />
        <div className="status-text">
          <span>Инстанс {idInstance}</span>
          <small>
            {connection === 'error' && connectionError
              ? connectionError
              : STATUS_LABELS[connection]}
          </small>
        </div>
      </footer>
    </aside>
  );
}
