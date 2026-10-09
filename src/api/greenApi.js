const API_URL = 'https://api.green-api.com';

async function readError(response) {
  let detail = '';
  try {
    const data = await response.json();
    detail = data?.message || data?.error || JSON.stringify(data);
  } catch {
    detail = response.statusText;
  }
  return `Ошибка ${response.status}${detail ? `: ${detail}` : ''}`;
}

export async function getStateInstance({ idInstance, apiTokenInstance }) {
  const url = `${API_URL}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function setSettings(
  { idInstance, apiTokenInstance },
  settings
) {
  const url = `${API_URL}/waInstance${idInstance}/setSettings/${apiTokenInstance}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function sendMessage(
  { idInstance, apiTokenInstance },
  chatId,
  message
) {
  const url = `${API_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function receiveNotification({ idInstance, apiTokenInstance }) {
  const url = `${API_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(await readError(response));
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

export async function deleteNotification(
  { idInstance, apiTokenInstance },
  receiptId
) {
  const url = `${API_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}
