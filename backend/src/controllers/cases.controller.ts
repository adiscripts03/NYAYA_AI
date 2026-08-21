import type { Request, Response } from "express";
import prisma from "../config/db.js";

export const getCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const cases = await prisma.case.findMany({
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
    const caseRecord = await prisma.case.findUnique({
      where: { id }
    });
    if (!caseRecord) {
      res.status(404).json({ error: "Case not found" });
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
    const savedCase = await prisma.case.upsert({
      where: { id: newCase.id },
      update: {
        title: newCase.title,
        description: newCase.description || null,
        status: newCase.status || "Open",
        date: new Date()
      },
      create: {
        id: newCase.id,
        title: newCase.title,
        description: newCase.description || null,
        status: newCase.status || "Open",
        date: new Date()
      }
    });
    res.json({ success: true, case: savedCase });
  } catch (error: any) {
    console.error("Error saving case:", error);
    res.status(500).json({ error: "Failed to save case" });
  }
};
