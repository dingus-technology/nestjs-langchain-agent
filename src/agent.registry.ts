import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AgentRunner } from './agent';

/**
 * Helper to create a composite injection token for agents.
 */
export function getAgentToken(agentName: string): string {
  return `Agent:${agentName}`;
}

@Injectable()
export class AgentRegistry {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Retrieve the agent instance for a given name.
   * @param name The agent's name.
   * @returns The agent instance.
   * @throws Error if no such agent is found.
   */
  get<T>(name: string): AgentRunner<T> {
    const token = getAgentToken(name);
    const agentInstance = this.moduleRef.get<AgentRunner<T>>(token, {
      strict: false,
    });
    if (!agentInstance) {
      throw new Error(`Agent with name '${name}' not found.`);
    }
    return agentInstance;
  }
}
