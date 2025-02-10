import 'reflect-metadata';
import { AgentToolRegistry } from './tool.registry';
import { Tool } from './tool.type';

/**
 * Message structure for LLM communications.
 */
export interface Message {
  role: string;
  content: string;
  name?: string;
}

/**
 * Result returned by an Action.
 */
export interface ActionResult<T> {
  role: string;
  response: T;
}

/**
 * A function call as returned by the LLM.
 */
export type FunctionCall = {
  arguments: string;
  name: string;
};

/**
 * Response from the LLM that indicates a function call.
 */
export interface FunctionCallResponse {
  finishReason: 'function_call';
  functionCall: FunctionCall;
  message: Message;
}

/**
 * Response from the LLM that indicates the final answer.
 */
export interface StopResponse {
  finishReason: 'stop';
  content: string;
}

/**
 * Union type for an LLM response.
 */
export type LLMResponse = FunctionCallResponse | StopResponse;

/**
 * Interface for a Language Model Client.
 */
export interface LLMClient {
  sendMessage(messages: Message[]): Promise<LLMResponse>;
}

/**
 * Agent class that implements the agent “algorithm.”
 * It automatically loads available tool actions from the AgentToolRegistry.
 */
export abstract class AgentRunner<T> {
  protected actions: { [key: string]: Tool<unknown> } = {};

  constructor(agentToolRegistry: AgentToolRegistry, agentId: string) {
    // Determine the agent ID to use.
    if (agentId) {
      // Load all tools registered for this agent.
      const tools = agentToolRegistry.getAllToolsForAgent(agentId);
      this.actions = { ...tools };
    }
  }

  abstract getClient(): LLMClient;

  /**
   * Optionally, additional actions can be added programmatically.
   */
  addAction(name: string, action: Tool<unknown>): this {
    this.actions[name] = action;
    return this;
  }

  abstract parse(params: string): T;

  /**
   * Runs the agent:
   * 1. Sends the initial messages to the LLM.
   * 2. If the LLM responds with a function call, parse its arguments,
   *    find the corresponding action, validate parameters, and run it.
   * 3. Appends the tool’s result to the conversation, then sends a new message.
   * 4. Returns the final content when the LLM signals a stop.
   *
   * @param inputMessages The initial conversation messages.
   * @returns The final LLM response content.
   * @throws Error if an unknown function is requested or if no final response is detected.
   */
  async run(inputMessages: Message[]): Promise<T> {
    let aiResponse = await this.getClient().sendMessage(inputMessages);
    // If the first response is already final, return it.
    if (aiResponse.finishReason === 'stop') {
      return this.parse(aiResponse.content);
    }
    const messages: Message[] = [];
    while (aiResponse.finishReason === 'function_call') {
      const functionCall = aiResponse.functionCall;
      if (!functionCall) {
        throw new Error('No function call detected.');
      }
      let params: any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        params = JSON.parse(functionCall.arguments);
      } catch (e) {
        throw new Error(`Invalid JSON arguments: ${e}`);
      }
      const action = this.actions[functionCall.name];
      if (!action) {
        throw new Error(`Unknown function: ${functionCall.name}`);
      }
      if (!action.validateParams(params)) {
        throw new Error(
          `Invalid parameters for function: ${functionCall.name}`,
        );
      }
      const toolResult = await action.execute(params);
      // Add the LLM's function call message and the tool's result to the conversation.
      messages.push(aiResponse.message);
      messages.push({
        role: toolResult.role,
        content: toolResult.response.toString(),
        name: functionCall.name,
      });
      aiResponse = await this.getClient().sendMessage(messages);
      if (aiResponse.finishReason === 'stop') {
        return this.parse(aiResponse.content);
      }
    }
    throw new Error('No final response detected.');
  }
}
