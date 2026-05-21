import { useEffect, useRef, useState } from "react";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm SaffronBot. Ask me about exotic spices, flavor profiles, or sourcing logistics.",
  },
];

function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    const previousMessages = messages;
    const nextMessages = [...previousMessages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
            history: previousMessages
              .slice(-10)
              .filter((item) => item.role !== "system")
              .map(({ role, content }) => ({ role, content })),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "The backend is unreachable right now. Start the FastAPI server and try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero-header">
        <p className="brand-subheading">Saffron Intelligence</p>
        <h1>
          SaffronBot: <br />
          <span>Your AI Spice Specialist</span>
        </h1>
        <p className="hero-description">
          Unlock the world of aromatics. Powered by Saffron Intelligence for
          deep culinary insights and supply chain expertise.
        </p>
      </header>

      <main className="chat-stage">
        <section className="glass-panel chat-card">
          <div className="message-list scroll-hide" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-row message-row-${message.role}`}
              >
                <span className="message-label">
                  {message.role === "user" ? (
                    "You"
                  ) : (
                    <>
                      <img
                        className="bot-avatar"
                        src="/images/logo.PNG"
                        alt="SG-BOT"
                      />
                      <span>SG-BOT</span>
                    </>
                  )}
                </span>
                <div
                  className={`message-bubble message-bubble-${message.role}`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="chat-controls">
            <form className="chat-form" onSubmit={handleSubmit}>
              <div className="input-shell">
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
              </div>
              <button type="submit" disabled={isSending || !inputValue.trim()}>
                <span>Send</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="mobile-footer">
        © 2026 Saffron Intelligence • Proprietary AI
      </footer>
    </div>
  );
}

export default App;
