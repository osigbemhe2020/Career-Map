import MentorService from '../services/mentor.service';
//import { HTTP_STATUS } from '../utils/const';

import type { Request, Response } from 'express';

export const getMentors = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const mentors = await MentorService.listMentors(page, pageSize);
  res.status(200).json({ mentors });
};

export const getMentorById = async (req: Request, res: Response) => {
  try {
    const mentor = await MentorService.getMentor(req.params.id);
    res.status(200).json({ mentor });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};