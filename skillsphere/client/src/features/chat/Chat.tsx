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
    <div className="bg-white text-slate-900 p-4 rounded-3xl w-full max-w-lg shadow-2xl shadow-cyan-100/40 border border-cyan-200">
      <div className="h-80 overflow-y-auto mb-3 custom-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.sender === currentUser ? "text-right" : "text-left"}
          >
            <p className={`inline-block p-3 rounded-2xl my-2 text-sm font-medium transition-all duration-200 ${
              msg.sender === currentUser 
                ? "bg-cyan-600 text-white rounded-br-md shadow-md shadow-cyan-200/50" 
                : "bg-cyan-50 text-slate-800 rounded-bl-md border border-cyan-100 shadow-sm"
            }`}>
              {msg.message}
            </p>
          </div>
        ))}
        {typingUser && (
          <p className="text-xs text-cyan-600 font-medium italic animate-pulse ml-2 mt-1">
            {typingUser} is typing...
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={handleTyping}
          className="flex-1 p-3 rounded-2xl bg-cyan-50 border border-cyan-300 text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 shadow-sm hover:border-cyan-400"
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
          className="hidden"
          id="file-upload"
        />
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-cyan-300 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </label>
        <button 
          onClick={sendMessage} 
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-3 rounded-2xl transition-all duration-200 shadow-md shadow-cyan-200/50 hover:shadow-lg hover:shadow-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;