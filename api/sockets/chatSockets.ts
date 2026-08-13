// sockets/chatSocket.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import ConversationModel from '../models/conversation.model';
import MessageModel from '../models/message.model';

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

// In-memory presence tracking. Works cleanly for a single server instance.
// If this app ever runs multiple backend instances behind a load balancer,
// this map only knows who's connected to THIS instance -- presence would
// need to move to a shared store (e.g. Redis pub/sub) at that point. Not a
// concern at current scale, just the ceiling on this approach.
const onlineUsers = new Map<string, string>(); // userId -> socketId

export function setupChatSocket(httpServer: HTTPServer) {
    const io = new SocketIOServer(httpServer, {
        cors: { origin: process.env.FRONTEND_URL || '*', credentials: true }
    });

    // Auth happens once, at connection time -- reuses the same JWT the REST
    // API already trusts, no separate auth system for sockets.
    io.use((socket: AuthenticatedSocket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error('No auth token provided'));
            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: string };
            socket.userId = payload.id;
            next();
        } catch {
            next(new Error('Invalid or expired token'));
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log('A user is connected', socket.userId);
        // handle users when they join the chat

        const userId = socket.userId!;
        onlineUsers.set(userId, socket.id); -
            io.emit('presence:online', { userId });

        // handle incoming Chat messages

        socket.on('conversation:join', async (conversationId: string) => {
            const conversation = await ConversationModel.findById(conversationId);
            if (!conversation) return;
            const isParticipant =
                conversation.student_id === userId || conversation.mentor_user_id === userId;
            if (!isParticipant) return;
            socket.join(`conversation:${conversationId}`);
        });


        socket.on('conversation:leave', (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`);
        });

        socket.on('message:send', async (data: { conversationId: string; body: string }) => {
            const conversation = await ConversationModel.findById(data.conversationId);
            if (!conversation) return;
            const isParticipant =
                conversation.student_id === userId || conversation.mentor_user_id === userId;
            if (!isParticipant) return;
            if (!data.body?.trim()) return;

            const message = await MessageModel.create({
                conversation_id: data.conversationId,
                sender_id: userId,
                body: data.body.trim()
            });

            io.to(`conversation:${data.conversationId}`).emit('message:new', message);
        });

        // handle user disconnect
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('presence:offline', { userId });
        });
    });

    return io;
}

export function isUserOnline(userId: string): boolean {
    return onlineUsers.has(userId);
}