import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Socket instance
const socket: Socket = io("http://localhost:5000");

// Types
interface ChatProps {
  roomId: string;
  currentUser: string;
}

interface Message {
  message: string;
  sender: string;
  timestamp: Date;
}

interface TypingEvent {
  sender: string;
}

function Chat({ roomId, currentUser }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [typingUser, setTypingUser] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Join room and setup socket listeners
  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ sender }: TypingEvent) => {
      setTypingUser(sender);
      setTimeout(() => setTypingUser(""), 2000);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      message: input,
      sender: currentUser,
      timestamp: new Date(),
    };

    socket.emit("sendMessage", { roomId, ...newMessage });
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const handleTyping = () => {
    socket.emit("typing", { roomId, sender: currentUser });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl w-full max-w-lg">
      <div className="h-80 overflow-y-auto mb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.sender === currentUser ? "text-right" : "text-left"}
          >
            <p className="inline-block bg-gray-800 p-2 rounded my-1">
              {msg.message}
            </p>
          </div>
        ))}
        {typingUser && (
          <p className="text-sm text-gray-400">{typingUser} is typing...</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={handleTyping}
          className="flex-1 p-2 rounded bg-gray-800"
          placeholder="Type a message..."
        />
        <input
  type="file"
  onChange={async (e) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_preset");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    socket.emit("sendMessage", {
      roomId,
      message: `📎 File: ${data.secure_url}`,
      sender: currentUser,
    });
  }}
/>
        <button onClick={sendMessage} className="bg-blue-600 px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;