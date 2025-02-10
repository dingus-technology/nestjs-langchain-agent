export interface Response<T> {
  value: T;
  toString(): string;
}
export interface Tool<T> {
  execute(params: any): Promise<{ response: Response<T>; role: string }>;
  validateParams(params: any): boolean;
}
