import { SetMetadata } from '@nestjs/common';
import { z } from 'zod';
import { TOOL } from './constants';

type Constructor<T> = {
  new (params: any[]): T;
};

export interface Tool<T extends z.ZodSchema> {
  invoke<K = any>(params: T): Promise<K>;
}

export type ToolMetadata = {
  schema: z.AnyZodObject;
  name: string;
  description: string;
  agents?: string[];
};

export function AgentTool<Schema extends z.ZodSchema>(params: ToolMetadata) {
  return (target: Constructor<Tool<Schema>>) => {
    SetMetadata(TOOL, params)(target);
  };
}
