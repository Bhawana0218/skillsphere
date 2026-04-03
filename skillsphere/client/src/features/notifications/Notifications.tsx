import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../../services/api";

// Socket instance
const socket = io("http://localhost:5000");

// Notification type
interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt?: string;
  type?: string;
  link?: string;
}

// Props type
interface NotificationsProps {
  currentUserId: string;
}

const Notifications: React.FC<NotificationsProps> = ({ currentUserId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    // Join private user room
    socket.emit("joinUser", currentUserId);

    // Listen for real-time notifications
    socket.on("receiveNotification", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    // Fetch notifications from backend
    fetchNotifications();

    // Cleanup listener on unmount
    return () => {
      socket.off("receiveNotification");
    };
  }, [currentUserId]);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get<Notification[]>("/notifications");
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markRead = async (id: string) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  return (
    <div className="absolute top-16 right-4 w-80 bg-gray-900 text-white rounded shadow-lg p-4">
      <h3 className="text-lg font-bold mb-2">Notifications</h3>

      {notifications.length === 0 && <p>No notifications</p>}

      {notifications.map((n) => (
        <div
          key={n._id}
          className={`p-2 mb-1 rounded ${
            n.read ? "bg-gray-800" : "bg-blue-600 cursor-pointer"
          }`}
          onClick={() => markRead(n._id)}
        >
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;