export interface SignalMessage {
  type: "join" | "signal";
  channelId: string;
  payload?: any;
}

export interface User {
  name: string;
  speaking: boolean;
}

export interface Channel { id: string; userCount: number }