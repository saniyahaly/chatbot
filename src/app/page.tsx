
"use client";

import { useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const restaurantRules = rules as Rule[];

const quickTopics = [
  "Menu",
  "Deals",
  "Timings",
  "Location",
  "Delivery",
  "Payment",
];

const fallbackReply =
  "😊 Sorry, I didn't quite understand that.\n\nI can help you with our menu, deals, opening timings, location, delivery, payment, or placing an order.\n\nPlease try asking in a different way, or choose one of the topics below!";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findReply(message: string): string {
  const normalizedMessage = message.toLowerCase().trim();

  // Check specific restaurant topics before general greetings.
  // Match complete words so "hi" will not match "this".
  for (const rule of restaurantRules) {
    const matched = rule.keywords.some((keyword) => {
      const escapedKeyword = escapeRegExp(keyword.toLowerCase());
      const pattern = new RegExp(`\\b${escapedKeyword}\\b`, "i");

      return pattern.test(normalizedMessage);
    });

    if (matched) {
      return rule.reply;
    }
  }

  return fallbackReply;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "👋 Assalamualaikum! Welcome to Desi Bites!\n\nI'm your restaurant assistant in Sargodha. Ask me about our menu, deals, timings, delivery, or anything else about our restaurant.\n\nHow can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    const userText = text.trim();

    if (!userText || isTyping) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        sender: "user",
        text: userText,
      },
    ]);

    setInput("");
    setIsTyping(true);

    // Simulate the bot thinking for approximately half a second.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const reply = findReply(userText);

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now() + 1,
        sender: "bot",
        text: reply,
      },
    ]);

    setIsTyping(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <main className="min-h-screen bg-orange-50 px-3 py-6 text-gray-800 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl">
        {/* Restaurant header */}
        <header className="bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-6 text-white sm:px-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
              🍛
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Desi Bites
              </h1>
              <p className="mt-1 text-sm text-orange-50">
                Your Desi food assistant · Sargodha
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                <span>Chat assistant available</span>
              </div>
            </div>
          </div>
        </header>

        {/* Intro banner */}
        <div className="border-b border-orange-100 bg-orange-50/80 px-5 py-4 sm:px-7">
          <p className="text-sm leading-6 text-gray-600">
            Hungry? 😋 Ask about our menu, special deals, delivery, or
            restaurant timings. We&apos;re here to help!
          </p>
        </div>

        {/* Quick topic buttons */}
        <section className="border-b border-gray-100 px-4 py-4 sm:px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Quick topics
          </p>

          <div className="flex flex-wrap gap-2">
            {quickTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                disabled={isTyping}
                onClick={() => void sendMessage(topic)}
                className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition hover:border-orange-500 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        {/* Chat messages */}
        <section
          aria-label="Chat conversation"
          aria-live="polite"
          className="flex-1 space-y-5 overflow-y-auto bg-white px-4 py-6 sm:px-6"
        >
          {messages.map((message) => {
            const isBot = message.sender === "bot";

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  isBot ? "justify-start" : "justify-end"
                }`}
              >
                {isBot && (
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
                    🍛
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[78%] ${
                    isBot
                      ? "rounded-bl-md border border-orange-100 bg-orange-50 text-gray-800"
                      : "rounded-br-md bg-orange-600 text-white"
                  }`}
                >
                  <p className="whitespace-pre-line break-words">
                    {message.text}
                  </p>
                </div>

                {!isBot && (
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
                🍛
              </div>

              <div
                role="status"
                className="rounded-2xl rounded-bl-md border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-gray-500"
              >
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </section>

        {/* Message input */}
        <footer className="border-t border-gray-100 bg-white p-4 sm:p-6">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <label htmlFor="chat-message" className="sr-only">
              Type your message
            </label>

            <input
              id="chat-message"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask us anything about Desi Bites..."
              disabled={isTyping}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Send</span>
              <span aria-hidden="true">➤</span>
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-gray-400">
            Powered by a simple rule-based chatbot · Demo restaurant
          </p>
        </footer>
      </div>
    </main>
  );
}
