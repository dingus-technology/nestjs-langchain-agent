import { SetMetadata } from '@nestjs/common';
import { AgentConstructor } from './type-utils';

export const AGENT_METADATA_KEY = 'agent:name';

interface AgentRegistration {
  name: string;
  target: AgentConstructor;
}

// Global registry for agent classes.
const agentRegistry: AgentRegistration[] = [];

/**
 * Decorator to mark a class as an agent.
 * Usage: @Agent('myAgent')
 */
export function Agent(name: string) {
  return (target: AgentConstructor) => {
    // Optionally store metadata (if needed elsewhere).
    SetMetadata(AGENT_METADATA_KEY, name)(target);
    // Add this agent to the registry.
    agentRegistry.push({ name, target });
  };
}

/**
 * Retrieve all registered agents.
 */
export function getRegisteredAgents(): AgentRegistration[] {
  return agentRegistry;
}
