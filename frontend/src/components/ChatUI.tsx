"use client";

import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import EmojiPicker from "emoji-picker-react";
import { FaSmile } from "react-icons/fa";
import { toast } from "react-toastify";

import { AuthContext } from "@/context/AuthContext";
import { socket } from "@/lib/socket/socket";
import SearchBox from "@/components/SearchBox";
import sendImg from "@/assets/send.png";

// How long to wait for the server to acknowledge a message.
const SEND_TIMEOUT_MS = 30000;

interface User {
  _id: string;
  username: string;
}

interface Message {
  text: string;
  senderID: string;
  senderName?: string;
  receiverID: string;
}

interface MessageAcknowledgement {
  ok?: boolean;
  error?: string;
}

export default function ChatUI() {
  const auth = useContext(AuthContext);

  // Read from localStorage after mount, so server and client render the same HTML.
  const [usrID, setUsrID] = useState("");
  const [usrName, setUsrName] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emojiWrapperRef = useRef<HTMLDivElement>(null);
  const selectedId = selectedUser?._id;

  useEffect(() => {
    setUsrID(localStorage.getItem("userID") || "");
    setUsrName(localStorage.getItem("username") || "");
  }, []);

  // Receive text messages.
  const lastNotificationRef = useRef<{
    id: string;
    time: number;
  } | null>(null);

  useEffect(() => {
    if (!usrID) return;

    const handleReceiveMessage = (messageData: Message) => {
      console.log("Received message:", messageData);

      if (messageData.receiverID !== usrID) {
        console.log("Receiver ID mismatch");
        return;
      }

      if (messageData.senderID !== selectedId) {
        const notificationId = `${messageData.senderID}-${messageData.receiverID}-${messageData.text}`;
        const now = Date.now();

        const previous = lastNotificationRef.current;
        const isDuplicate =
          previous?.id === notificationId && now - previous.time < 1000;

        if (!isDuplicate) {
          lastNotificationRef.current = {
            id: notificationId,
            time: now,
          };

          toast.info(
            `New message from ${messageData.senderName || "Someone"}: ${
              messageData.text || "sent a message"
            }`,
            {
              autoClose: 4000,
              closeButton: true,
              closeOnClick: true,
              pauseOnHover: false,
              pauseOnFocusLoss: false,
            },
          );
        }
      }

      setMessages((prev) => [...prev, messageData]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [usrID, selectedId]);

  // Scroll the message list itself.
  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, selectedId]);

  // Close the emoji picker when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiWrapperRef.current &&
        !emojiWrapperRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const conversation = selectedId
    ? messages.filter(
        (chatMessage) =>
          (chatMessage.senderID === usrID &&
            chatMessage.receiverID === selectedId) ||
          (chatMessage.senderID === selectedId &&
            chatMessage.receiverID === usrID),
      )
    : [];

  const trimmedMessage = message.trim();

  const canSend =
    Boolean(selectedUser) && !sending && trimmedMessage.length > 0;

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowEmojiPicker(false);
  };

  // Send a text message through Socket.IO.
  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser || sending || !trimmedMessage) return;

    if (!socket.connected) {
      toast.error("Chat is disconnected. Please wait for it to reconnect.");
      return;
    }

    setSending(true);

    try {
      const messageData: Message = {
        text: trimmedMessage,
        senderID: usrID,
        senderName: usrName,
        receiverID: selectedUser._id,
      };

      await new Promise<void>((resolve, reject) => {
        socket
          .timeout(SEND_TIMEOUT_MS)
          .emit(
            "sendMessage",
            messageData,
            (timeoutError: Error | null, response?: MessageAcknowledgement) => {
              if (timeoutError) {
                console.error("Send Message Error:", timeoutError);

                reject(new Error("The message timed out. Please try again."));
              } else if (response?.ok === false || response?.error) {
                reject(
                  new Error(
                    response.error ?? "The server could not send the message.",
                  ),
                );
              } else {
                resolve();
              }
            },
          );
      });

      // Add the sent message to the sender's conversation.
      setMessages((prev) => [...prev, messageData]);
      setMessage("");
    } catch (error) {
      console.error("Send Message Error:", error);

      toast.error(
        error instanceof Error ? error.message : "Could not send the message.",
      );
    } finally {
      setSending(false);
    }
  };

  if (!auth?.isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center text-white">
        Please log in to chat.
      </div>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col gap-6 px-4 py-6 text-white md:flex-row md:px-6">

      {/* User list */}
      <aside className="w-full shrink-0 rounded-3xl bg-[#61568C] p-5 md:w-80">
        <h1 className="mb-5 text-2xl font-bold">Messages</h1>

        <SearchBox onSelectUser={handleSelectUser} activeUserId={selectedId} />
      </aside>

      {/* Chat window */}
      <div className="flex min-h-[32rem] min-w-0 flex-1 flex-col overflow-hidden rounded-3xl bg-[#61568C]">
        <header className="flex min-h-[4rem] items-center border-b border-white/10 bg-[#F2A488] px-6 text-lg font-bold text-[#2E2445]">
          {selectedUser
            ? `Chatting with ${selectedUser.username}`
            : "Select a user to chat"}
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          aria-live="polite"
          className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6"
        >
          {!selectedUser && (
            <p className="py-16 text-center text-white/75">
              Pick someone from the list to start chatting.
            </p>
          )}

          {conversation.map((chatMessage, index) => {
            const isMine = chatMessage.senderID === usrID;

            return (
              <div
                key={`${chatMessage.senderID}-${index}`}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] space-y-2 break-words rounded-2xl px-4 py-3 ${
                    isMine
                      ? "bg-[#F2A488] text-[#2E2445]"
                      : "bg-[#504673] text-white"
                  }`}
                >
                  {chatMessage.text && <p>{chatMessage.text}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Text-only message form */}
        <form onSubmit={sendMessage} className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            {/* Emoji picker */}
            <div ref={emojiWrapperRef} className="relative shrink-0">
              <button
                type="button"
                aria-label="Choose emoji"
                aria-expanded={showEmojiPicker}
                disabled={!selectedUser || sending}
                onClick={() => setShowEmojiPicker((isOpen) => !isOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaSmile aria-hidden="true" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 z-50 mb-3">
                  <EmojiPicker
                    onEmojiClick={(emojiData) =>
                      setMessage((current) => current + emojiData.emoji)
                    }
                  />
                </div>
              )}
            </div>

            {/* Message input */}
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                selectedUser ? "Type a message..." : "Select a user first"
              }
              disabled={!selectedUser || sending}
              aria-label="Message"
              className="min-w-0 flex-1 rounded-xl bg-white p-3 text-[#29223f] placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            {/* Send button */}
            <button
              type="submit"
              aria-label="Send message"
              disabled={!canSend}
              className="shrink-0 rounded-xl bg-[#3BBFA7] p-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Image src={sendImg} alt="" width={32} height={32} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
