import { ToolService } from './tool.service';
import { TOOL } from './constants';
import { DiscoveryService } from '@nestjs/core';
import { DynamicStructuredTool } from '@langchain/core/tools';

// Fake tool classes to simulate providers
class GlobalTool {
  async invoke(): Promise<any> {
    return await Promise.resolve('global result');
  }
}
Reflect.defineMetadata(
  TOOL,
  {
    name: 'globalTool',
    description: 'A global tool available to all agents',
    schema: {},
    // using '*' to denote global tool
    agents: ['*'],
  },
  GlobalTool,
);

class AgentSpecificTool {
  async invoke(): Promise<any> {
    return await Promise.resolve('agent specific result');
  }
}
Reflect.defineMetadata(
  TOOL,
  {
    name: 'agentTool',
    description: 'A tool available only to a specific agent',
    schema: {},
    agents: ['agent1'],
  },
  AgentSpecificTool,
);

// Create fake provider wrappers like those provided by Nest's DiscoveryService.
const fakeProviders = [
  {
    metatype: GlobalTool,
    instance: new GlobalTool(),
  },
  {
    metatype: AgentSpecificTool,
    instance: new AgentSpecificTool(),
  },
];

// Create a fake DiscoveryService that returns our fake providers.
const fakeDiscoveryService: Partial<DiscoveryService> = {
  getProviders: jest.fn().mockReturnValue(fakeProviders),
};

describe('ToolService', () => {
  let toolService: ToolService;

  beforeEach(() => {
    // We cast fakeDiscoveryService to DiscoveryService since our implementation only relies on getProviders.
    toolService = new ToolService(fakeDiscoveryService as DiscoveryService);
    // Initialize the service (simulate module initialization)
    toolService.onModuleInit();
  });

  it('should discover all tools on module init', () => {
    const tools = toolService['tools'];
    expect(tools).toHaveLength(2);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    const toolNames = tools.map((t: any) => t.metadata.name);
    expect(toolNames).toContain('globalTool');
    expect(toolNames).toContain('agentTool');
  });

  it('should return global and agent-specific tools for a given agent', () => {
    const dynamicTools: DynamicStructuredTool[] =
      toolService.getToolsForAgent('agent1');

    // Both the global tool and the agent-specific tool should be returned.
    expect(dynamicTools).toHaveLength(2);

    // Check that the dynamic tool instances have the expected properties.
    const toolNames = dynamicTools.map((t) => t.name);
    expect(toolNames).toContain('globalTool');
    expect(toolNames).toContain('agentTool');

    // Optionally, test that calling the function of one tool returns the expected result.
    return dynamicTools[0]
      .func({}) // passing empty params
      .then((result) => {
        // || 'agent specific result'
        expect(result).toBe('global result');
      });
  });

  it('should return only global tools for an agent without specific tools', () => {
    // 'agent2' is not listed in any agent-specific tool metadata.
    const dynamicTools: DynamicStructuredTool[] =
      toolService.getToolsForAgent('agent2');

    // Only the global tool should be returned.
    expect(dynamicTools).toHaveLength(1);
    expect(dynamicTools[0].name).toBe('globalTool');
  });
});
