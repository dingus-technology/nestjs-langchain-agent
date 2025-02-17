import { DiscoveryService } from '@nestjs/core';
import { TOOL } from './constants';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Tool, ToolMetadata } from './tool.decorator';
import * as assert from 'assert';
import { DynamicStructuredTool } from '@langchain/core/tools';

@Injectable()
export class ToolService implements OnModuleInit {
  private tools: { metadata: ToolMetadata; instance: Tool<any> }[] = [];
  private readonly logger: Logger = new Logger(ToolService.name);

  constructor(private readonly discover: DiscoveryService) {}

  onModuleInit() {
    this.tools = this.discover
      .getProviders()
      .filter(
        (provider) =>
          provider.metatype && Reflect.getMetadata(TOOL, provider.metatype),
      ) // ensure it's a class (not plain object)
      .map((provider) => {
        assert(provider.metatype !== null, 'No instance found');

        return {
          metadata: Reflect.getMetadata(
            TOOL,
            provider.metatype,
          ) as ToolMetadata,
          instance: provider.instance as Tool<any>,
        };
      });

    this.logger.log(
      `Discovered ${this.tools.length} tool${this.tools.length > 1 ? 's' : ''}`,
    );
  }

  getToolsForAgent(name: string): DynamicStructuredTool[] {
    const globalTools = this.tools.filter(
      (tool) => !tool.metadata.agents || tool.metadata.agents.includes('*'),
    );
    const tools = this.tools.filter((tool) =>
      tool.metadata.agents?.includes(name),
    );

    return [...globalTools, ...tools].map(
      (tool) =>
        new DynamicStructuredTool({
          name: tool.metadata.name,
          description: tool.metadata.description,
          schema: tool.metadata.schema,
          func: (params) => tool.instance.invoke(params),
        }),
    );
  }
}
