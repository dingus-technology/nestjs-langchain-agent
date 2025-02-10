import { SetMetadata } from '@nestjs/common';
import { ToolConstructor } from './type-utils';

export const AGENT_TOOL = 'AGENT_TOOL';

/**
 * Helper function to generate a unique token based on agent and tool.
 * @param agent The agent identifier.
 * @param tool The tool identifier.
 * @returns A composite token string.
 */
export function getAgentToolToken(agent: string, tool: string): string {
  return `AgentTool:${agent}:${tool}`;
}

// Global registry to hold agent tool classes.
const agentToolRegistry: Array<{
  agent: string;
  tool: string;
  token: string;
  target: ToolConstructor;
}> = [];

/**
 * Decorator to mark a class as an agent tool.
 * @param config An object with properties 'agent' and 'tool'
 */
export function AgentTool(config: { agent: string; tool: string }) {
  return (target: ToolConstructor) => {
    const token = getAgentToolToken(config.agent, config.tool);
    // Optionally, set metadata on the class.
    SetMetadata(AGENT_TOOL, config)(target);
    // Add the tool to the global registry.
    agentToolRegistry.push({
      agent: config.agent,
      tool: config.tool,
      token,
      target,
    });
  };
}

/**
 * Helper function to retrieve all registered agent tools.
 */
export function getAgentTools() {
  return agentToolRegistry;
}
