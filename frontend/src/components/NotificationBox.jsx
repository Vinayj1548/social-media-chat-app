const NotificationBox = ({ unreadMessages, onClick }) => {
    const unreadUsers = Object.keys(unreadMessages).filter(
      (userId) => unreadMessages[userId] > 0
    );
  
    if (unreadUsers.length === 0) return null; // Hide if no unread messages
  
    return (
      <div
        className="absolute top-0 left-0 right-0 bg-green-500 text-white font-bold p-3 rounded-md shadow-lg animate-pulse cursor-pointer z-50"
        onClick={onClick}
      >
        📩 {unreadUsers.length} new messages! Click to view.
      </div>
    );
  };
  
  export default NotificationBox;
  