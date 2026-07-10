import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const WS_URL = import.meta.env.VITE_WS_URL;

export function createSocket(): Socket {
  return io(WS_URL, {
    auth: { token: getAccessToken() },
    autoConnect: false,
  });
}
