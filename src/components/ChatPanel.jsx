import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusMark({ status }) {
  if (status === 'pending') return <span className="msg-status">⏳</span>;
  if (status === 'error') return <span className="msg-status error">⚠</span>;
  return <span className="msg-status">✓</span>;
}

export default function ChatPanel({ chat, onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    setText('');
  }, [chat?.id]);

  useEffect(() => {
    const node = messagesRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [chat?.messages]);

  async function submit() {
    const value = text.trim();
    if (!value || sending) return;
    setText('');
    setSending(true);
    try {
      await onSend(value);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  if (!chat) {
    return (
      <main className="chat-panel empty">
        <div className="empty-state">
          <div className="brand-logo large">M</div>
          <h2>Выберите чат</h2>
          <p>Создайте новый чат, чтобы отправить сообщение в MAX</p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-panel">
      <header className="chat-header">
        <Avatar name={chat.name} size={44} />
        <div className="chat-header-info">
          <span className="chat-header-name">{chat.name}</span>
          <span className="chat-header-sub">{chat.phone || chat.id}</span>
        </div>
      </header>

      <div className="messages" ref={messagesRef}>
        {chat.messages.length === 0 && (
          <div className="messages-empty">
            Напишите первое сообщение получателю
          </div>
        )}
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`bubble-row ${message.direction === 'out' ? 'out' : 'in'}`}
          >
            <div className="bubble">
              <span className="bubble-text">{message.text}</span>
              <span className="bubble-meta">
                {formatTime(message.timestamp)}
                {message.direction === 'out' && (
                  <StatusMark status={message.status} />
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      <footer className="composer">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение"
          rows={1}
        />
        <button
          type="button"
          className="send-button"
          onClick={submit}
          disabled={!text.trim() || sending}
          title="Отправить"
        >
          ➤
        </button>
      </footer>
    </main>
  );
}
