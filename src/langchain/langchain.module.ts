import {
  DynamicModule,
  InjectionToken,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { AGENT_CONFIG } from './tool/constants';
import { AgentConfig, AgentFactory } from './tool/agent.service';
import { ToolService } from './tool/tool.service';
import { DiscoveryModule } from '@nestjs/core';

export class LangchainModule {
  static register(models: {
    useFactory: (args: any[]) => Record<string, AgentConfig>;
    inject: (InjectionToken | OptionalFactoryDependency)[];
  }): DynamicModule {
    return {
      imports: [DiscoveryModule],
      module: LangchainModule,
      providers: [
        AgentFactory,
        ToolService,
        {
          provide: AGENT_CONFIG,
          useFactory: models.useFactory,
          inject: models.inject,
        },
      ],
      exports: [ToolService, AgentFactory],
    };
  }
}
