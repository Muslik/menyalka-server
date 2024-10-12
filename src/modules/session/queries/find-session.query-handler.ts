import { IQueryHandler } from "@nestjs/cqrs";
import { SessionId } from "../session-service.port";

export class FindSessionQuery {
  readonly sessionId: SessionId;
}

export class FindSessionQueryHandler implements IQueryHandler {
  execute(query: FindSessionQuery) {}
}
