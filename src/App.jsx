import { useEffect, useRef, useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import NewChatModal from './components/NewChatModal';
import {
  deleteNotification,
  receiveNotification,
  sendMessage,
} from './api/greenApi';
import { phoneToChatId, formatPhone } from './utils/phone';

const STORAGE_KEY = 'max-greenapi-credentials';

function loadCredentials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function appendMessage(chats, chatId, message, meta = {}) {
  const exists = chats.some((chat) => chat.id === chatId);
  if (!exists) {
    return [
      ...chats,
      {
        id: chatId,
        name: meta.name || chatId,
        phone: meta.phone || '',
        messages: [message],
      },
    ];
  }
  return chats.map((chat) => {
    if (chat.id !== chatId) return chat;
    const duplicate = chat.messages.some((item) => item.id === message.id);
    return {
      ...chat,
      ...meta,
      messages: duplicate ? chat.messages : [...chat.messages, message],
    };
  });
}

function patchMessage(chats, chatId, messageId, patch) {
  return chats.map((chat) =>
    chat.id === chatId
      ? {
          ...chat,
          messages: chat.messages.map((item) =>
            item.id === messageId ? { ...item, ...patch } : item
          ),
        }
      : chat
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [credentials, setCredentials] = useState(loadCredentials);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [connection, setConnection] = useState('idle');
  const [connectionError, setConnectionError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const credentialsRef = useRef(credentials);
  credentialsRef.current = credentials;

  useEffect(() => {
    if (!credentials) return undefined;
    let cancelled = false;

    async function poll() {
      while (!cancelled) {
        try {
          const notification = await receiveNotification(credentials);
          if (cancelled) break;
          setConnection('online');
          setConnectionError('');
          if (notification) {
            handleNotification(notification.body);
            await deleteNotification(credentials, notification.receiptId);
          }
        } catch (error) {
          if (cancelled) break;
          setConnection('error');
          setConnectionError(error.message);
          await sleep(5000);
        }
      }
    }

    setConnection('connecting');
    poll();
    return () => {
      cancelled = true;
    };
  }, [credentials]);

  function handleNotification(body) {
    if (!body || body.typeWebhook !== 'incomingMessageReceived') return;
    const messageData = body.messageData;
    if (!messageData || messageData.typeMessage !== 'textMessage') return;
    const text = messageData.textMessageData?.textMessage;
    if (!text) return;

    const chatId = body.senderData?.chatId;
    if (!chatId) return;

    const message = {
      id: body.idMessage || `${chatId}-${Date.now()}`,
      text,
      direction: 'in',
      timestamp: (body.timestamp || Math.floor(Date.now() / 1000)) * 1000,
    };

    const meta = {};
    const name =
      body.senderData?.chatName || body.senderData?.senderName || null;
    if (name) meta.name = name;
    if (body.senderData?.senderPhoneNumber) {
      meta.phone = String(body.senderData.senderPhoneNumber);
    }

    setChats((prev) => appendMessage(prev, chatId, message, meta));
  }

  function handleLogin(nextCredentials) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCredentials));
    setCredentials(nextCredentials);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setCredentials(null);
    setChats([]);
    setActiveChatId(null);
    setConnection('idle');
  }

  function handleCreateChat(phone) {
    const chatId = phoneToChatId(phone);
    if (!chatId) return;
    setChats((prev) => {
      if (prev.some((chat) => chat.id === chatId)) return prev;
      return [
        ...prev,
        {
          id: chatId,
          name: formatPhone(phone) || phone,
          phone: formatPhone(phone) || phone,
          messages: [],
        },
      ];
    });
    setActiveChatId(chatId);
    setModalOpen(false);
  }

  async function handleSend(text) {
    const activeChat = chats.find((chat) => chat.id === activeChatId);
    if (!activeChat) return;
    const tempId = `tmp-${Date.now()}`;
    const message = {
      id: tempId,
      text,
      direction: 'out',
      timestamp: Date.now(),
      status: 'pending',
    };
    setChats((prev) => appendMessage(prev, activeChat.id, message));
    try {
      const result = await sendMessage(credentialsRef.current, activeChat.id, text);
      setChats((prev) =>
        patchMessage(prev, activeChat.id, tempId, {
          id: result?.idMessage || tempId,
          status: 'sent',
        })
      );
    } catch (error) {
      setChats((prev) =>
        patchMessage(prev, activeChat.id, tempId, {
          status: 'error',
          error: error.message,
        })
      );
    }
  }

  if (!credentials) {
    return <LoginScreen initial={credentials} onLogin={handleLogin} />;
  }

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  return (
    <div className="chat-layout">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        idInstance={credentials.idInstance}
        connection={connection}
        connectionError={connectionError}
        onSelectChat={setActiveChatId}
        onNewChat={() => setModalOpen(true)}
        onLogout={handleLogout}
      />
      <ChatPanel chat={activeChat} onSend={handleSend} />
      {isModalOpen && (
        <NewChatModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateChat}
        />
      )}
    </div>
  );
}
