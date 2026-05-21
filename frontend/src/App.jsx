import { useEffect, useRef, useState } from 'react';

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'I’m SmartChatbot. Ask me anything, and I’ll keep it concise.',
  },
];

function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedMessage,
    };

    const previousMessages = messages;
    const nextMessages = [...previousMessages, userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          history: previousMessages
            .slice(-10)
            .filter((item) => item.role !== 'system')
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply,
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'The backend is unreachable right now. Start the FastAPI server and try again.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">SmartChatbot</p>
        <h1>Simple AI chatbot starter</h1>
        <p className="lede">
          React frontend, FastAPI backend, and an optional OpenAI-powered response path.
        </p>
      </section>

      <section className="chat-panel">
        <div className="messages" aria-live="polite">
          {messages.map((message) => (
            <article key={message.id} className={`message message-${message.role}`}>
              <span className="message-role">{message.role === 'user' ? 'You' : 'Bot'}</span>
              <p>{message.content}</p>
            </article>
          ))}
          <div ref={endOfMessagesRef} />
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="chat-input">
            Message
          </label>
          <input
            id="chat-input"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ask something..."
            disabled={isSending}
          />
          <button type="submit" disabled={isSending || !inputValue.trim()}>
            {isSending ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;