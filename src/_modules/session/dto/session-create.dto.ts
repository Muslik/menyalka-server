import { B } from "~/infrastructure/database";

export class SessionCreateDto {
  userAgent: string;
  ip: string;
  userId: B.UserId
}
