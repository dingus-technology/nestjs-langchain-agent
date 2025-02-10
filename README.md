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

A dynamic and typesafe agent framework for NestJS applications.

---

## Installation

```bash
npm install @dingusjs-scope/nestjs-agent
```

## Example 

1. Registering Agents and Tools

In your application's main module, import the dynamic module to automatically register all agents and tools. Ensure that your agent and tool files are imported so that their decorators are executed.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AgentToolsModule } from '@dingusjs/nestjs-agent';
import { MyAgent } from './my-agent';
import { GoogleSearch } from './google-search';
import { SomeService } from './some.service';

@Module({
  imports: [
    AgentToolsModule.register(), // Auto-registers all agents and tools.
  ],
  providers: [SomeService, GoogleSearch, MyAgent],
})
export class AppModule {}
```

2. Creating an agent

```typescript
// src/my-agent.ts
import { Agent, BaseAgent, LLMClient } from '@dingusjs/nestjs-agent';

@Agent('myAgent')
export class MyAgent extends BaseAgent<string> {
  parse(response: string): string {
    return response
  }

  getClient() {
    //return an instance on LLMClient
  }
}

```

3. Creating a Tool

```typescript
import { AgentTool } from '@dingusjs/nestjs-agent';

@AgentTool({ agent: 'myAgent', tool: 'GoogleSearch' })
export class GoogleSearch {
  async execute(): Promise<{ response: string }> {
    // Implement your tool logic here.
    return { response: 'Google search result' };
  }
}
```

4. Using the agent registry 

```typescript
import { Injectable } from '@nestjs/common';
import { AgentRegistry } from '@dingusjs/nestjs-agent';

@Injectable()
export class SomeService {
  constructor(private readonly agentRegistry: AgentRegistry) {}

  async runAgentTask() {
    // Retrieve the agent instance registered as "myAgent"
    const agent = this.agentRegistry.get('myAgent');
    const result = await agent.run('sample parameter');
    console.log('Agent result:', result);
  }
}

```