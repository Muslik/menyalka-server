export abstract class ExceptionBase<T extends string = string> extends Error {
  abstract type: string;
  abstract statusCode: number;

  constructor(
    public readonly code: T,
    public readonly message: string,
    public readonly inner?: unknown,
  ) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toString(): string {
    const lines: string[] = [];

    // Add the basic exception information
    lines.push(`Exception Type: ${this.type}`);
    lines.push(`Code: ${this.code}`);
    lines.push(`Message: ${this.message}`);

    // Handle the inner exception if it exists
    if (this.inner) {
      lines.push('Inner Exception:');

      if (this.inner instanceof ExceptionBase) {
        // Recursively call toString on nested Exception instances
        lines.push(this.inner.toString());
      } else if (this.inner instanceof Error) {
        // Include stack trace or message from standard Error objects
        lines.push(this.inner.stack || this.inner.message || String(this.inner));
      } else {
        // For any other types, convert to string
        lines.push(String(this.inner));
      }
    }

    // Include the stack trace of the current exception
    if (this.stack) {
      lines.push('Stack Trace:');
      lines.push(this.stack);
    }

    // Join all the lines into a single string output
    return lines.join('\n');
  }
}
