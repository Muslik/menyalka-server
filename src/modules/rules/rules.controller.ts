import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiResponse } from '@nestjs/swagger';
import { Effect } from 'effect';
import { FastifyReply } from 'fastify';
import * as NodeFS from 'node:fs';
import { join } from 'path';

import { NotFoundException } from '~/libs/exceptions';

import { FileNotFoundError } from './rules.errors';

const readFile = (filename: string) =>
  Effect.async<Buffer, Error>((resume) => {
    if (!NodeFS.existsSync(filename)) {
      resume(Effect.fail(new Error('File not found')));
    }
    NodeFS.readFile(filename, (error, data) => {
      if (error) {
        resume(Effect.fail(error));
      } else {
        resume(Effect.succeed(data));
      }
    });
  });

@Controller('rules')
export class RulesController {
  @ApiResponse({
    status: 200,
    description: 'Returns the rules in Markdown format',
    type: String,
    content: {
      'text/markdown': {
        example: '### Terms of Service\n\nPlease read the following terms...', // Optional example
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Rules file not found',
    type: NotFoundException,
  })
  @Get(':lang')
  getRules(@Param('lang') lang: string, @Res() res: FastifyReply) {
    return Effect.runPromiseExit(
      readFile(join(__dirname, '..', '..', 'public', `rules_${lang}.md`)).pipe(
        Effect.tap((buffer) => {
          res.header('Content-Type', 'text/markdown');
          res.send(buffer);
        }),
        Effect.mapError(() => new FileNotFoundError()),
      ),
    );
  }
}
