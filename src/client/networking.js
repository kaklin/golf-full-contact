import { io } from "socket.io-client";

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: true });
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect = () => (
  connectedPromise.then(() => {
    console.log(`Connected. Your id: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      // Here add a popup window to show disconnected state
    })
  })
);