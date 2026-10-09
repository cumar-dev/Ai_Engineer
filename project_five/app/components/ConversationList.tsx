"use client";

import { useEffect, useState } from "react";

interface Conversation {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationList({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onClose,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadConversations() {
    try {
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();

      setConversations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  async function createConversation() {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await response.json();

      setConversations((prev) => [conversation, ...prev]);

      onSelectConversation(conversation._id);
      onClose();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteConversation(id: string, event: React.MouseEvent) {
    event.stopPropagation();

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      setConversations((prev) =>
        prev.filter((conversation) => conversation._id !== id)
      );

      if (activeConversationId === id) {
        onNewConversation();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleSelect(id: string) {
    onSelectConversation(id);
    onClose();
  }

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity duration-200 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-neutral-200 bg-neutral-50 transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={createConversation}
            className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            New chat
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversations"
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Conversations */}
        <nav
          aria-label="Conversations"
          className="flex-1 overflow-y-auto px-2 pb-3"
        >
          {loading ? (
            <div className="space-y-2 p-2" aria-label="Loading conversations">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-9 animate-pulse rounded-lg bg-neutral-200/70"
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-3 py-4 text-sm text-neutral-500">
              No conversations yet. Select New chat to start one.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((conversation) => {
                const isActive = activeConversationId === conversation._id;

                return (
                  <li
                    key={conversation._id}
                    className={`group flex items-center rounded-xl transition ${
                      isActive
                        ? "bg-neutral-200/80"
                        : "hover:bg-neutral-200/50"
                    }`}
                  >
                    <button
                      onClick={() => handleSelect(conversation._id)}
                      aria-current={isActive ? "page" : undefined}
                      className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                    >
                      <span className="block truncate text-sm text-neutral-800">
                        {conversation.title}
                      </span>
                    </button>

                    <button
                      onClick={(event) =>
                        deleteConversation(conversation._id, event)
                      }
                      aria-label={`Delete ${conversation.title}`}
                      className="mr-1.5 rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-300/60 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
}