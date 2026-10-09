import { useState } from 'react';

export default function NewChatModal({ onClose, onCreate }) {
  const [phone, setPhone] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!phone.replace(/\D/g, '')) return;
    onCreate(phone);
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <form
        className="modal"
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2>Новый чат</h2>
        <p className="modal-subtitle">
          Введите номер телефона получателя в MAX
        </p>
        <label className="field">
          <span>Номер телефона</span>
          <input
            autoFocus
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+7 999 123-45-67"
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn-primary" disabled={!phone.trim()}>
            Создать
          </button>
        </div>
      </form>
    </div>
  );
}
