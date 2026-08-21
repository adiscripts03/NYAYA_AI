import type { Request, Response } from "express";
import prisma from "../config/db.js";

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await prisma.chatSession.findMany({
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
    res.json(session);
  } catch (error: any) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

export const saveChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = req.body;
    
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
        createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
      }
    });

    // To handle messages efficiently, we will delete existing and insert new (simple sync for now)
    // Or just insert the ones that are missing. Since frontend sends the full session, we'll sync it.
    if (session.messages && Array.isArray(session.messages)) {
      // For simplicity in sync, delete all messages for this session and recreate
      // (In production, you'd only append new messages)
      await prisma.message.deleteMany({ where: { sessionId: session.id } });
      
      await prisma.message.createMany({
        data: session.messages.map((m: any) => ({
          id: m.id.toString(),
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
    await prisma.chatSession.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
};
