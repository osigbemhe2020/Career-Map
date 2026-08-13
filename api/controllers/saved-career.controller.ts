import SavedCareerService from '../services/saved-career.service';
//import { HTTP_STATUS } from '../utils/const';

import type { Request, Response } from 'express';

// assumes an auth middleware has already set req.user = { id: string }
export const saveCareer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await SavedCareerService.saveCareer(userId, req.params.careerId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const unsaveCareer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await SavedCareerService.unsaveCareer(userId, req.params.careerId);
    res.status(200).json({ message: 'Career removed from saved list' });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const getSavedCareers = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const careers = await SavedCareerService.listSaved(userId);
  res.status(200).json({ careers });
};