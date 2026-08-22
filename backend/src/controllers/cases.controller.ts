import type { Request, Response } from "express";
import prisma from "../config/db.js";

export const getCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const cases = await prisma.case.findMany({
      where: userId ? { userId } : {},
      orderBy: { date: 'desc' },
      take: 20
    });
    res.json(cases);
  } catch (error: any) {
    console.error("Error fetching cases:", error);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
};

export const getCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const caseRecord = await prisma.case.findUnique({
      where: { id }
    });
    if (!caseRecord) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    // Verify ownership if user is authenticated
    if (userId && caseRecord.userId && caseRecord.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    res.json(caseRecord);
  } catch (error: any) {
    console.error("Error fetching case:", error);
    res.status(500).json({ error: "Failed to fetch case" });
  }
};

export const saveCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const newCase = req.body;
    const userId = req.user?.id || null;
    const savedCase = await prisma.case.upsert({
      where: { id: newCase.id },
      update: {
        title: newCase.title,
        description: newCase.description || null,
        status: newCase.status || "Open",
        category: newCase.category || null,
        statusColor: newCase.statusColor || null,
        type: newCase.type || null,
        snippet: newCase.snippet || null,
        data: newCase.data || null,
        date: new Date()
      },
      create: {
        id: newCase.id,
        title: newCase.title,
        description: newCase.description || null,
        status: newCase.status || "Open",
        category: newCase.category || null,
        statusColor: newCase.statusColor || null,
        type: newCase.type || null,
        snippet: newCase.snippet || null,
        data: newCase.data || null,
        userId: userId,
        date: new Date()
      }
    });
    res.json({ success: true, case: savedCase });
  } catch (error: any) {
    console.error("Error saving case:", error);
    res.status(500).json({ error: "Failed to save case" });
  }
};
