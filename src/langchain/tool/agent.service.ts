import { Inject, Injectable } from '@nestjs/common';
import {
  createReactAgent,
  CreateReactAgentParams,
} from '@langchain/langgraph/prebuilt';
import { ToolService } from './tool.service';
import { AGENT_CONFIG } from './constants';

export type AgentConfig<
  StructuredResponseFormat extends Record<string, any> = Record<string, any>,
> = Omit<CreateReactAgentParams<any, StructuredResponseFormat>, 'tools'>;

@Injectable()
export class AgentFactory {
  constructor(
    private readonly toolService: ToolService,
    @Inject(AGENT_CONFIG)
    private readonly agentConfigs: Record<string, AgentConfig>,
  ) {}

  create(name: string) {
    const tools = this.toolService.getToolsForAgent(name);
    const agentConfig = this.agentConfigs[name];

    if (!agentConfig) {
      throw new Error(`No agent config found for ${name}`);
    }

    return createReactAgent({
      ...agentConfig,
      tools,
    });
  }
}
