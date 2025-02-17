<h1 align="center">NestJS Agent Framework</h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">Dynamic Agent and Tool Integration for NestJS</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

A simple agent framework for NestJS applications, allowing you to create tool calls in a nestjs DI friendly way

---

## Installation

```bash
npm install @dingusjs-scope/nestjs-langchain-agent
```

## Example

1. Registering Agents and Tools

In your application's main module, import the dynamic module to automatically register all agents and tools. Ensure that your agent and tool files are imported so that their decorators are executed.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { LangchainModule } from '@dinguslabs/nestjs-langchain-agent';
import { MyAgent } from './my-agent';
import { GoogleSearch } from './google-search';
import { SomeService } from './some.service';

@Module({
  imports: [
    LangchainModule.register({
      useFactory: () => ({
        //your agent config here like responseStructure
      }),
      inject: [],
    }),
  ],
  providers: [SomeService, GoogleSearch, MyAgent],
})
export class AppModule {}
```

2. Creating a Tool

```typescript
import { AgentTool } from '@dinguslabs/nestjs-langchain-agent';

@AgentTool({ agents: ['myAgent'], tool: 'GoogleSearch' })
export class GoogleSearch {
  async execute(): Promise<{ response: string }> {
    // Implement your tool logic here.
    return { response: 'Google search result' };
  }
}
```

_Note_: Global agents are defined like `@AgentTool({ agents: ['*'], tool: 'GoogleSearch' })`

3. Using the agent factory

```typescript
import { Injectable } from '@nestjs/common';
import { AgentRegistry } from '@dinguslabs/nestjs-langchain-agent';

@Injectable()
export class SomeService {
  constructor(private readonly agentRegistry: AgentFactory) {}

  async runAgentTask() {
    // Retrieve the agent instance registered as "myAgent"
    const agent = this.agentRegistry.create('myAgent');
    const result = await agent.invoke({
      messages: [],
      //...
    });
    console.log('Agent result:', result);
  }
}
```
