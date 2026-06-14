import { Request, Response } from "express";

type UserLeftEvent = {
  type: "userLeft";
  data: {
    projectId: string;
    roomId: string;
    connectionId: number;
    userId: string | null;
    userInfo: Record<string, any> | null;
    leftAt: string;
    numActiveUsers: number;
  };
};

export const handleUserLeft = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { roomId, numActiveUsers } = req.body as UserLeftEvent["data"];
  
};
