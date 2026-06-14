import { Request, Response } from "express";

type UserEnteredEvent = {
  type: "userEntered";
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

export const handleUserEntered = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { roomId, numActiveUsers } = req.body as UserEnteredEvent["data"];
  
};
