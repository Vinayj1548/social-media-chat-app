"use client";

import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import EmojiPicker from "emoji-picker-react";
import { FaSmile, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

import { AuthContext } from "@/context/AuthContext";
import { socket } from "@/lib/socket/socket";
import SearchBox from "@/components/SearchBox";
import AttachmentPicker from "@/components/AttachmentPicker";
import sendImg from "@/assets/send.png";

// How long to wait for the server to acknowledge a message.
const SEND_TIMEOUT_MS = 30000;
const MAX_TOTAL_ATTACHMENT_BYTES = 10 * 1024 * 1024;

interface User {
  _id: string;
  username: string;
}

interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string; // data URL
}

interface Message {
  text: string;
  senderID: string;
  senderName?: string;
  receiverID: string;
  attachments?: Attachment[];
}

interface MessageAcknowledgement {
  ok?: boolean;
  error?: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;

const totalBytes = (files: File[]) =>
  files.reduce((sum, file) => sum + file.size, 0);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error(`Could not read ${file.name}.`));
      }
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error(`Could not read ${file.name}.`));
    };
    reader.readAsDataURL(file);
  });

export default function ChatUI() {
  const auth = useContext(AuthContext);

  // Read from localStorage after mount, so server and client render the same HTML.
  const [usrID, setUsrID] = useState("");
  const [usrName, setUsrName] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Wraps both the emoji button and the picker, so clicking the button
  // does not count as an "outside" click.
  const emojiWrapperRef = useRef<HTMLDivElement>(null);

  const selectedId = selectedUser?._id;

  useEffect(() => {
    setUsrID(localStorage.getItem("userID") || "");
    setUsrName(localStorage.getItem("username") || "");
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (messageData: Message) => {
      if (messageData.receiverID !== usrID) return;

      if (messageData.senderID !== selectedId) {
        toast.info(
          `New message from ${messageData.senderName || "Someone"}: ${
            messageData.text || "sent an attachment"
          }`,
        );
      }

      setMessages((prev) => [...prev, messageData]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [usrID, selectedId]);

  // Scroll the message list itself. scrollIntoView can scroll the whole page.
  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, selectedId]);

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
  const hasContent = trimmedMessage.length > 0 || pendingFiles.length > 0;
  const canSend = Boolean(selectedUser) && !sending && hasContent;

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setPendingFiles([]);
  };

  const handleFilesSelected = (files: File[]) => {
    const known = new Set(pendingFiles.map(fileKey));
    const fresh = files.filter((file) => {
      const key = fileKey(file);
      if (known.has(key)) return false;
      known.add(key);
      return true;
    });

    const next = [...pendingFiles, ...fresh];

    if (totalBytes(next) > MAX_TOTAL_ATTACHMENT_BYTES) {
      toast.error("Attachments exceed the 10 MB total limit.");
      return;
    }

    setPendingFiles(next);
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser || sending || !hasContent) return;

    if (!socket.connected) {
      toast.error("Chat is disconnected. Please wait for it to reconnect.");
      return;
    }

    setSending(true);

    try {
      const attachments: Attachment[] = await Promise.all(
        pendingFiles.map(async (file) => ({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          data: await readFileAsDataUrl(file),
        })),
      );

      const messageData: Message = {
        text: trimmedMessage,
        senderID: usrID,
        senderName: usrName,
        receiverID: selectedUser._id,
        attachments: attachments.length > 0 ? attachments : undefined,
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
                reject(
                  new Error("The message timed out. Please try again."),
                );
              } else if (response?.ok === false || response?.error) {
                reject(
                  new Error(
                    response?.error ?? "The server could not save the message.",
                  ),
                );
              } else {
                resolve();
              }
            },
          );
      });

      setMessages((prev) => [...prev, messageData]);
      setMessage("");
      setPendingFiles([]);
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
      <ToastContainer />

      <aside className="w-full shrink-0 rounded-3xl bg-[#61568C] p-5 md:w-80">
        <h1 className="mb-5 text-2xl font-bold">Messages</h1>
        <SearchBox onSelectUser={handleSelectUser} activeUserId={selectedId} />
      </aside>

      <div className="flex min-h-[32rem] min-w-0 flex-1 flex-col overflow-hidden rounded-3xl bg-[#61568C]">
        <header className="flex min-h-[4rem] items-center border-b border-white/10 bg-[#F2A488] px-6 text-lg font-bold text-[#2E2445]">
          {selectedUser
            ? `Chatting with ${selectedUser.username}`
            : "Select a user to chat"}
        </header>

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

                  {chatMessage.attachments?.map((attachment, attachmentIndex) => (
                    <a
                      key={`${attachment.name}-${attachmentIndex}`}
                      href={attachment.data}
                      download={attachment.name}
                      className="flex items-center justify-between gap-4 rounded-lg bg-black/10 px-3 py-2 text-sm hover:bg-black/20"
                    >
                      <span className="min-w-0 truncate">{attachment.name}</span>
                      <span className="shrink-0 text-xs opacity-75">
                        {formatSize(attachment.size)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={sendMessage} className="border-t border-white/10 p-4">
          {pendingFiles.length > 0 && (
            <ul
              aria-label="Files ready to send"
              className="mb-3 flex flex-wrap gap-2"
            >
              {pendingFiles.map((file, index) => (
                <li
                  key={fileKey(file)}
                  className="flex max-w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm"
                >
                  <span className="max-w-[12rem] truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-white/60">
                    {formatSize(file.size)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      setPendingFiles((current) =>
                        current.filter((_, fileIndex) => fileIndex !== index),
                      )
                    }
                    className="shrink-0 rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-3">
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

            <AttachmentPicker
              disabled={!selectedUser || sending}
              maxFileSizeMB={10}
              onFilesSelected={handleFilesSelected}
            />

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