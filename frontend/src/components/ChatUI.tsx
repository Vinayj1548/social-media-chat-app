"use client";

import {
  useState,
  useEffect,
  useRef,
  useContext,
  FormEvent,
} from "react";
import Image from "next/image";
import EmojiPicker from "emoji-picker-react";
import { FaSmile } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

import { socket } from "@/lib/socket/socket";
import SearchBox from "@/components/SearchBox";
import { AuthContext } from "@/context/AuthContext";

import sendImg from "@/assets/send.png";

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

export default function ChatUI() {
  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

  const { isAuthenticated } = auth;

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [notifications, setNotifications] =
    useState<Record<string, number>>({});

  const [usrID, setUsrID] =
    useState("");

  const [usrName, setUsrName] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const emojiPickerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsrID(
      localStorage.getItem(
        "userID"
      ) || ""
    );

    setUsrName(
      localStorage.getItem(
        "username"
      ) || ""
    );
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (
      msgData: Message
    ) => {
      if (
        msgData.receiverID ===
        usrID
      ) {
        if (
          selectedUser?._id !==
          msgData.senderID
        ) {
          toast.info(
            `New message from ${msgData.senderName}: ${msgData.text}`
          );
        }

        setNotifications(
          (prev) => ({
            ...prev,
            [msgData.senderID]:
              (prev[
                msgData.senderID
              ] || 0) + 1,
          })
        );

        setMessages((prev) => [
          ...prev,
          msgData,
        ]);
      }
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );
    };
  }, [usrID, selectedUser]);

  useEffect(() => {
    if (selectedUser?._id) {
      setNotifications(
        (prev) => ({
          ...prev,
          [selectedUser._id]:
            0,
        })
      );
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(
          event.target as Node
        )
      ) {
        setShowEmojiPicker(
          false
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const sendMessage = (
    e:
      | FormEvent
      | React.MouseEvent
  ) => {
    e.preventDefault();

    if (
      !message.trim() ||
      !selectedUser
    )
      return;

    const msgData: Message = {
      text: message,
      senderID: usrID,
      senderName: usrName,
      receiverID:
        selectedUser._id,
    };

    socket.emit(
      "sendMessage",
      msgData
    );

    setMessages((prev) => [
      ...prev,
      msgData,
    ]);

    setMessage("");
  };

  const addEmoji = (
    emojiData: {
      emoji: string;
    }
  ) => {
    setMessage(
      (prev) =>
        prev + emojiData.emoji
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center text-white">
        Please log in to chat.
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-center items-center w-screen p-4">
      <ToastContainer />

      <SearchBox
        onSelectUser={
          setSelectedUser
        }
      />

      <div className="w-full h-180 bg-[#61568C] rounded-3xl flex flex-col overflow-hidden">
        {selectedUser ? (
          <div className="bg-[#F2A488] text-white text-2xl font-bold w-full h-20 flex items-center justify-center">
            Chatting with{" "}
            {
              selectedUser.username
            }
          </div>
        ) : (
          <div className="text-center mt-3 text-2xl text-white font-bold">
            Select a user to
            chat
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages
            .filter(
              (msg) =>
                (msg.senderID ===
                  usrID &&
                  msg.receiverID ===
                    selectedUser?._id) ||
                (msg.senderID ===
                  selectedUser?._id &&
                  msg.receiverID ===
                    usrID)
            )
            .map(
              (
                msg,
                index
              ) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.senderID ===
                    usrID
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl max-w-md ${
                      msg.senderID ===
                      usrID
                        ? "bg-[#F2A488]"
                        : "bg-[#504673]"
                    } text-white`}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            )}

          <div
            ref={
              messagesEndRef
            }
          />
        </div>

        <form
          onSubmit={
            sendMessage
          }
          className="relative flex items-center border-t p-4"
        >
          {showEmojiPicker && (
            <div
              ref={
                emojiPickerRef
              }
              className="absolute bottom-20 left-5 z-50"
            >
              <EmojiPicker
                onEmojiClick={
                  addEmoji
                }
              />
            </div>
          )}

          <input
            type="text"
            value={message}
            placeholder="Type a message..."
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            className="flex-1 p-4 rounded-xl text-black outline-none"
          />

          <button
            type="button"
            onClick={() =>
              setShowEmojiPicker(
                !showEmojiPicker
              )
            }
            className="mx-3"
          >
            <FaSmile className="text-2xl text-white" />
          </button>

          <button
            type="submit"
            className="bg-[#3BBFA7] p-3 rounded-xl"
          >
            <Image
              src={sendImg}
              alt="Send"
              width={32}
              height={32}
            />
          </button>
        </form>
      </div>
    </div>
  );
}