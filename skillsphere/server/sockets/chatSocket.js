import Chat from "../models/Chat.js";

const initChatSocket = (io) => {
  const ensureRoom = async (roomId) => {
    let chat = await Chat.findOne({ roomId });
    if (!chat) {
      chat = await Chat.create({ roomId, messages: [] });
    }
    return chat;
  };

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinRoom", async ({ roomId, userName }) => {
      socket.join(roomId);
      socket.data.userName = userName;
      console.log(`${userName || socket.id} joined room ${roomId}`);

      const chat = await ensureRoom(roomId);
      socket.emit("chatHistory", chat.messages);
      socket.to(roomId).emit("userJoined", {
        roomId,
        userName,
      });
    });

    socket.on("sendMessage", async ({ roomId, sender, text }) => {
      if (!roomId || !text) return;
      const newMessage = {
        sender,
        text,
        type: "text",
        timestamp: new Date(),
        readBy: [sender],
      };

      const chat = await ensureRoom(roomId);
      chat.messages.push(newMessage);
      await chat.save();

      io.to(roomId).emit("receiveMessage", {
        ...newMessage,
        _id: chat.messages[chat.messages.length - 1]._id,
      });
    });

    socket.on("shareFile", async ({ roomId, sender, fileName, fileType, fileUrl }) => {
      if (!roomId || !fileUrl || !fileName) return;
      const newMessage = {
        sender,
        text: `${sender} shared a file: ${fileName}`,
        type: "file",
        fileName,
        fileType,
        fileUrl,
        timestamp: new Date(),
        readBy: [sender],
      };

      const chat = await ensureRoom(roomId);
      chat.messages.push(newMessage);
      await chat.save();

      io.to(roomId).emit("receiveMessage", {
        ...newMessage,
        _id: chat.messages[chat.messages.length - 1]._id,
      });
    });

    socket.on("typing", ({ roomId, sender }) => {
      if (!roomId || !sender) return;
      socket.to(roomId).emit("typing", { sender });
    });

    socket.on("messageRead", async ({ roomId, messageId, reader }) => {
      if (!roomId || !messageId || !reader) return;
      const chat = await Chat.findOne({ roomId });
      if (!chat) return;
      const message = chat.messages.id(messageId);
      if (!message) return;
      if (!message.readBy.includes(reader)) {
        message.readBy.push(reader);
        await chat.save();
      }
      io.to(roomId).emit("messageRead", { messageId, reader });
    });

    socket.on("startCall", ({ roomId, caller, offer }) => {
      if (!roomId || !offer) return;
      socket.to(roomId).emit("incomingCall", { caller, offer });
    });

    socket.on("answerCall", ({ roomId, callee, answer }) => {
      if (!roomId || !answer) return;
      socket.to(roomId).emit("callAccepted", { callee, answer });
    });

    socket.on("iceCandidate", ({ roomId, candidate }) => {
      if (!roomId || !candidate) return;
      socket.to(roomId).emit("iceCandidate", { candidate });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default initChatSocket;
