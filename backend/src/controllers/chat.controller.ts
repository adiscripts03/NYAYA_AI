import type { Request, Response } from "express";
import prisma from "../config/db.js";

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const history = await prisma.chatSession.findMany({
      where: userId ? { userId } : {},
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });
    res.json(history);
  } catch (error: any) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

export const getChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    // Verify ownership if user is authenticated
    if (userId && session.userId && session.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    res.json(session);
  } catch (error: any) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

export const saveChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = req.body;
    const userId = req.user?.id || null;

    // UPSERT session
    const savedSession = await prisma.chatSession.upsert({
      where: { id: session.id },
      update: {
        title: session.title,
        updatedAt: new Date()
      },
      create: {
        id: session.id,
        title: session.title || "New Chat",
        userId: userId,
        createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
      }
    });

    // To handle messages efficiently, we will delete existing and insert new (simple sync for now)
    if (session.messages && Array.isArray(session.messages)) {
      await prisma.message.deleteMany({ where: { sessionId: session.id } });

      await prisma.message.createMany({
        data: session.messages.map((m: any) => ({
          id: m.id.toString().startsWith(session.id) ? m.id.toString() : `${session.id}-${m.id}`,
          sessionId: session.id,
          sender: m.sender,
          text: m.text,
          citation: m.citation || null,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date()
        }))
      });
    }

    res.json({ success: true, session: savedSession });
  } catch (error: any) {
    console.error("Error saving session:", error);
    res.status(500).json({ error: "Failed to save session" });
  }
};

export const deleteChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify ownership before deleting
    if (userId) {
      const session = await prisma.chatSession.findUnique({ where: { id } });
      if (session && session.userId && session.userId !== userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }

    await prisma.chatSession.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
};
