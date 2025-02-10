// Option 1: Direct constructor type alias
export type ToolConstructor = new (...args: any[]) => {
  execute(): Promise<{ response: string }>;
};

export type AgentConstructor = new (...args: any[]) => {
  run(): Promise<void>;
};
