import { useState } from 'react';
import { getStateInstance, setSettings } from '../api/greenApi';

export default function LoginScreen({ initial, onLogin }) {
  const [idInstance, setIdInstance] = useState(initial?.idInstance || '');
  const [apiTokenInstance, setApiTokenInstance] = useState(
    initial?.apiTokenInstance || ''
  );
  const [configure, setConfigure] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const id = idInstance.trim();
    const token = apiTokenInstance.trim();
    if (!id || !token) {
      setError('Заполните оба поля');
      return;
    }
    setBusy(true);
    const credentials = { idInstance: id, apiTokenInstance: token };
    try {
      await getStateInstance(credentials);
      if (configure) {
        try {
          await setSettings(credentials, {
            webhookUrl: '',
            incomingWebhook: 'yes',
            outgoingWebhook: 'yes',
            stateWebhook: 'yes',
          });
        } catch {
          /* не критично — пользователь может настроить вручную в кабинете */
        }
      }
      onLogin(credentials);
    } catch (submitError) {
      setError(
        submitError.message ||
          'Не удалось подключиться. Проверьте idInstance и apiTokenInstance.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="brand-logo">M</div>
          <div>
            <h1>MAX</h1>
            <p>чат через GREEN-API</p>
          </div>
        </div>

        <label className="field">
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            placeholder="1101000000"
            autoComplete="off"
            disabled={busy}
          />
        </label>

        <label className="field">
          <span>apiTokenInstance</span>
          <input
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            placeholder="d75b3a66374942c5b3c..."
            autoComplete="off"
            disabled={busy}
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={configure}
            onChange={(event) => setConfigure(event.target.checked)}
            disabled={busy}
          />
          <span>
            Настроить инстанс для получения сообщений (очистить webhook URL)
          </span>
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Подключение…' : 'Войти'}
        </button>

        <p className="login-hint">
          Учётные данные находятся в личном кабинете{' '}
          <a
            href="https://console.green-api.com"
            target="_blank"
            rel="noreferrer"
          >
            console.green-api.com
          </a>
        </p>
      </form>
    </div>
  );
}
