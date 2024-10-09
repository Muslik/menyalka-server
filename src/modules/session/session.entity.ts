import { SessionId } from "./session.service.interface";

export class Session {
  sessionId: SessionId;
  userAgent: string;
  ip: string;
  createdAt: Date;
  lastAccessAt: Date;
  userId: number;
};
