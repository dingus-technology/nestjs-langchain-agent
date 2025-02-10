import { Module, DynamicModule, Global } from '@nestjs/common';
import { getAgentTools } from './tool.decorator';
import { AgentToolRegistry } from './tool.registry';
import { getAgentToken, AgentRegistry } from './agent.registry';
import { getRegisteredAgents } from './agent.decorator';

/**
 * The AgentToolsModule registers:
 * - All tools discovered via @AgentTool (using composite tokens).
 * - For each agent name provided in the register() call, a provider for a DefaultAgent.
 * - The AgentToolRegistry and AgentRegistry services.
 *
 * Note: This module assumes that an LLM client provider is registered in the DI container with the token "LLMClient".
 */
@Global()
@Module({})
export class AgentToolsModule {
  static register(): DynamicModule {
    // Retrieve all tools registered via the @AgentTool decorator.
    const agentTools = getAgentTools();
    const toolProviders = agentTools.map(({ token, target }) => ({
      provide: token,
      useClass: target,
    }));

    const registeredAgents = getRegisteredAgents();

    // Create provider definitions using the composite token.
    const agentProviders = registeredAgents.map(({ name, target }) => ({
      provide: getAgentToken(name),
      useClass: target,
    }));

    // Gather all providers.
    const providers = [
      ...toolProviders,
      AgentToolRegistry,
      AgentRegistry,
      ...agentProviders,
    ];

    return {
      module: AgentToolsModule,
      providers,
      exports: providers,
    };
  }
}
