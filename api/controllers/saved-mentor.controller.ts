import SavedMentorService from '../services/saved-mentor.service';
//import { HTTP_STATUS } from '../utils/const';

import type { Request, Response } from 'express';

export const saveMentor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await SavedMentorService.saveMentor(userId, req.params.mentorId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const unsaveMentor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await SavedMentorService.unsaveMentor(userId, req.params.mentorId);
    res.status(200).json({ message: 'Mentor removed from saved list' });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const getSavedMentors = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const mentors = await SavedMentorService.listSaved(userId);
  res.status(200).json({ mentors });
};