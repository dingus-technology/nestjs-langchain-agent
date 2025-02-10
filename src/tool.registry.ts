import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getAgentTools, getAgentToolToken } from './tool.decorator';
import { ToolConstructor } from './type-utils';
import { Tool } from './tool.type';

@Injectable()
export class AgentToolRegistry {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Retrieve a specific tool instance by agent and tool name.
   */
  get({ agent, tool }: { agent: string; tool: string }): ToolConstructor {
    const token = getAgentToolToken(agent, tool);
    const toolInstance = this.moduleRef.get<ToolConstructor>(token, {
      strict: false,
    });
    if (!toolInstance) {
      throw new Error(
        `Tool with agent '${agent}' and tool '${tool}' not found.`,
      );
    }
    return toolInstance;
  }

  /**
   * Retrieve all tool instances registered for a given agent.
   */
  getAllToolsForAgent(agent: string): { [tool: string]: Tool<unknown> } {
    const tools = getAgentTools().filter((t) => t.agent === agent);
    const instances: { [tool: string]: any } = {};
    for (const tool of tools) {
      const instance = this.moduleRef.get<ToolConstructor>(tool.token, {
        strict: false,
      });
      if (instance) {
        instances[tool.tool] = instance;
      }
    }
    return instances;
  }
}
