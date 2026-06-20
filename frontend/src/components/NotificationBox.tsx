"use client";

interface NotificationBoxProps {
  unreadMessages: Record<string, number>;
  onClick: () => void;
}

export default function NotificationBox({
  unreadMessages,
  onClick,
}: NotificationBoxProps) {
  const unreadUsers = Object.keys(unreadMessages).filter(
    (userId) => unreadMessages[userId] > 0
  );

  const totalUnread = Object.values(unreadMessages).reduce(
    (sum, count) => sum + count,
    0
  );

  if (unreadUsers.length === 0) return null;

  return (
    <button
      onClick={onClick}
      className="
        fixed
        top-4
        left-1/2
        -translate-x-1/2
        z-50
        flex
        items-center
        gap-3
        rounded-xl
        bg-[#3BBFA7]
        px-5
        py-3
        text-white
        shadow-xl
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-2xl
      "
    >
      <span className="text-lg">📩</span>

      <div className="flex flex-col text-left">
        <span className="font-semibold">
          New Messages
        </span>

        <span className="text-sm text-white/90">
          {totalUnread} unread from {unreadUsers.length}{" "}
          {unreadUsers.length === 1 ? "user" : "users"}
        </span>
      </div>
    </button>
  );
}