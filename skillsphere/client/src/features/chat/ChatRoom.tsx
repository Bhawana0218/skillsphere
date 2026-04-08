import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../../services/socket";
import api from "../../services/api";
import { ArrowLeft, Paperclip, Send, Video, VideoOff } from "lucide-react";

interface SocketMessage {
  _id?: string;
  sender: string;
  text: string;
  type: "text" | "file";
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  timestamp: string;
  readBy: string[];
}

const ChatRoom = () => {
  const { roomId: routeRoomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const defaultName = parsedUser?.name || "Guest";

  const [roomId, setRoomId] = useState(routeRoomId || "");
  const [userName, setUserName] = useState(defaultName);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [input, setInput] = useState("");
  const [typingIndicator, setTypingIndicator] = useState("");
  const [connected, setConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callActive, setCallActive] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (socket.connected) {
      setConnected(true);
    }

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("chatHistory", (history: SocketMessage[]) => {
      setMessages(history || []);
    });

    socket.on("receiveMessage", (message: SocketMessage) => {
      setMessages((current) => [...current, message]);
      if (message.sender !== userName) {
        socket.emit("messageRead", {
          roomId,
          messageId: message._id,
          reader: userName,
        });
      }
    });

    socket.on("typing", ({ sender }: { sender: string }) => {
      if (sender !== userName) {
        setTypingIndicator(`${sender} is typing...`);
        if (typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = window.setTimeout(() => {
          setTypingIndicator("");
        }, 2000);
      }
    });

    socket.on("messageRead", ({ messageId, reader }: { messageId: string; reader: string }) => {
      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? {
                ...message,
                readBy: message.readBy.includes(reader)
                  ? message.readBy
                  : [...message.readBy, reader],
              }
            : message
        )
      );
    });

    socket.on("incomingCall", async ({ caller, offer }: { caller: string; offer: RTCSessionDescriptionInit }) => {
      setIncomingCall(true);
      setCallerName(caller);
      const stream = await prepareMedia();
      peerRef.current = createPeerConnection(stream);
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(offer);
      }
    });

    socket.on("callAccepted", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(answer);
        setCallActive(true);
      }
    });

    socket.on("iceCandidate", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (peerRef.current && candidate) {
        try {
          await peerRef.current.addIceCandidate(candidate);
        } catch (error) {
          console.error("Failed to add ICE candidate", error);
        }
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chatHistory");
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("messageRead");
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("iceCandidate");
    };
  }, [roomId, userName]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingIndicator]);

  const joinRoom = async (requestedRoomId: string) => {
    if (!requestedRoomId.trim() || !userName.trim()) return;
    setRoomId(requestedRoomId);
    socket.emit("joinRoom", { roomId: requestedRoomId, userName });
    try {
      const response = await api.get(`/chat/${requestedRoomId}`);
      setMessages(response.data?.messages || []);
    } catch (error) {
      console.error("Failed to load chat room", error);
    }
  };

  const startNewRoom = () => {
    const newId = `room-${Math.random().toString(36).slice(2, 10)}`;
    setRoomId(newId);
    joinRoom(newId);
  };

  const handleSendMessage = () => {
    if (!input.trim() || !roomId) return;

    const message: SocketMessage = {
      sender: userName,
      text: input.trim(),
      type: "text",
      timestamp: new Date().toISOString(),
      readBy: [userName],
    };

    setMessages((current) => [...current, message]);
    socket.emit("sendMessage", {
      roomId,
      sender: userName,
      text: input.trim(),
    });
    setInput("");
  };

  const handleTyping = () => {
    if (!roomId) return;
    socket.emit("typing", { roomId, sender: userName });
  };

  const handleFileSelected = async (file: File) => {
    if (!roomId || !file) return;
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const fileUrl = `data:${file.type};base64,${base64}`;

    const message: SocketMessage = {
      sender: userName,
      text: `${userName} shared ${file.name}`,
      type: "file",
      fileName: file.name,
      fileType: file.type,
      fileUrl,
      timestamp: new Date().toISOString(),
      readBy: [userName],
    };

    setMessages((current) => [...current, message]);
    socket.emit("shareFile", {
      roomId,
      sender: userName,
      fileName: file.name,
      fileType: file.type,
      fileUrl,
    });
  };

  const prepareMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error("Media setup failed", error);
      return null;
    }
  };

  const createPeerConnection = (stream: MediaStream | null) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        socket.emit("iceCandidate", { roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    return pc;
  };

  const callUser = async () => {
    if (!roomId) return;
    const stream = await prepareMedia();
    if (!stream) return;

    const pc = createPeerConnection(stream);
    peerRef.current = pc;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("startCall", {
      roomId,
      caller: userName,
      offer,
    });
  };

  const answerCall = async () => {
    if (!peerRef.current || !roomId) return;
    const pc = peerRef.current;
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answerCall", { roomId, callee: userName, answer });
    setIncomingCall(false);
    setCallActive(true);
  };

  const leaveRoom = () => {
    if (roomId) {
      socket.emit("messageRead", { roomId, reader: userName, messageId: "" });
    }
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 px-4 py-6">
      <div className="mx-auto max-w-6xl rounded-3xl border border-cyan-200 bg-white p-6 shadow-2xl shadow-cyan-100/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Real-Time Collaboration</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Instant chat, file sharing, typing indicators, read receipts, and optional video calling in one room.
            </p>
          </div>
          <button
            onClick={leaveRoom}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-5 shadow-lg shadow-cyan-100/30">
            <div className="space-y-4">
              <div>
                <label className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">Your name</label>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 placeholder-slate-400"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="text-sm uppercase tracking-[0.2em] text-slate-500 font-medium">Room ID</label>
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 placeholder-slate-400"
                  placeholder="Enter or create room ID"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => joinRoom(roomId)}
                  className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
                >
                  Join Room
                </button>
                <button
                  onClick={startNewRoom}
                  className="rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm font-semibold text-cyan-700 transition-all duration-200 hover:bg-cyan-50 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
                >
                  Create New Room
                </button>
              </div>

              <div className="rounded-3xl border border-cyan-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Live status</p>
                <div className="mt-3 text-sm text-slate-700 space-y-1">
                  <p><span className="font-medium text-slate-500">Socket:</span> <span className={`font-semibold ${connected ? 'text-green-600' : 'text-red-500'}`}>{connected ? "Connected" : "Disconnected"}</span></p>
                  <p><span className="font-medium text-slate-500">Room:</span> <span className="font-semibold text-cyan-700">{roomId || "Not joined"}</span></p>
                  <p><span className="font-medium text-slate-500">Typing:</span> <span className="font-semibold text-cyan-600">{typingIndicator || "No one is typing"}</span></p>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Video Call</p>
                <p className="mt-2 text-sm text-slate-600">Use the real-time media channel for quick collaboration.</p>
                <button
                  onClick={callUser}
                  disabled={!roomId}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-[0.98]"
                >
                  <Video className="w-4 h-4" /> Start Video Call
                </button>
                {incomingCall && (
                  <button
                    onClick={answerCall}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 transition-all duration-200 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98]"
                  >
                    <VideoOff className="w-4 h-4" /> Answer {callerName || "Incoming"} Call
                  </button>
                )}
              </div>
            </div>
          </aside>

          <section className="flex flex-col rounded-3xl border border-cyan-200 bg-white shadow-lg shadow-cyan-100/30 overflow-hidden">
            <div className="border-b border-cyan-200 bg-cyan-50/50 px-5 py-4">
              <h2 className="text-xl font-semibold text-slate-900">Room Chat</h2>
              <p className="text-sm text-slate-600">{roomId ? `Room ${roomId}` : "Join or create a room to start chatting."}</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 custom-scrollbar" style={{ minHeight: 540 }}>
              {messages.map((message) => (
                <div
                  key={message._id || `${message.sender}-${message.timestamp}`}
                  className={`rounded-3xl p-4 max-w-[85%] ${message.sender === userName ? "bg-cyan-600 text-white self-end ml-auto rounded-br-md shadow-md shadow-cyan-200/50" : "bg-cyan-50 text-slate-800 self-start rounded-bl-md border border-cyan-100 shadow-sm"}`}
                >
                  <div className={`flex flex-wrap items-center justify-between gap-3 text-xs ${message.sender === userName ? 'text-cyan-100' : 'text-slate-500'}`}>
                    <span className="font-medium">{message.sender}</span>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="mt-3 text-sm leading-relaxed">
                    {message.type === "file" && message.fileUrl ? (
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`block rounded-2xl px-3 py-3 transition-all duration-200 ${message.sender === userName ? 'bg-cyan-700/50 border border-cyan-400 text-cyan-100 hover:bg-cyan-700' : 'bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300'}`}
                      >
                        📎 {message.fileName}
                      </a>
                    ) : (
                      <p className={message.sender === userName ? 'text-white' : 'text-slate-800'}>{message.text}</p>
                    )}
                  </div>
                  {message.readBy?.length ? (
                    <div className={`mt-3 text-[11px] ${message.sender === userName ? 'text-cyan-100' : 'text-slate-500'}`}>
                      ✓ Seen by {message.readBy.join(", ")}
                    </div>
                  ) : null}
                </div>
              ))}
              <div ref={messageEndRef}></div>
            </div>

            <div className="border-t border-cyan-200 bg-cyan-50/50 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex-1 cursor-pointer rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-700 transition-all duration-200 hover:border-cyan-400 hover:bg-cyan-50 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-200">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-cyan-600" />
                    <span>Attach file</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      if (event.target.files && event.target.files[0]) {
                        handleFileSelected(event.target.files[0]);
                      }
                    }}
                  />
                </label>

                <div className="flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyUp={handleTyping}
                    placeholder="Write a message..."
                    className="w-full rounded-2xl border border-cyan-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 placeholder-slate-400"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" /> Send
                </button>
              </div>
            </div>
          </section>
        </div>

        {callActive && (
          <div className="mt-6 grid gap-4 rounded-3xl border border-cyan-200 bg-white p-5 text-slate-800 shadow-lg shadow-cyan-100/30">
            <h3 className="text-lg font-semibold text-slate-900">Video Call</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Local feed</p>
                <video ref={localVideoRef} autoPlay muted playsInline className="mt-3 h-72 w-full rounded-3xl bg-slate-100 object-cover border border-cyan-100" />
              </div>
              <div className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Remote feed</p>
                <video ref={remoteVideoRef} autoPlay playsInline className="mt-3 h-72 w-full rounded-3xl bg-slate-100 object-cover border border-cyan-100" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
