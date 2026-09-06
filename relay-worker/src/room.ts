import { DurableObject } from 'cloudflare:workers';

/**
 * Kaleido Party Room - Durable Object
 *
 * Shared room where party members broadcast their skin selections.
 * All messages are JSON. Max 10 members per room.
 *
 * Messages from clients:
 *   { type: 'join', summoner_id, summoner_name }         announce yourself
 *   { type: 'skin', skin }                                update your skin selection
 *   { type: 'event', event, data, to? }                   relay an event to everyone else (or to one member)
 *   { type: 'room_set', key, value }                      set shared room state (color, theme, ...)
 *   { type: 'leave' }
 *
 * Messages to clients:
 *   { type: 'members', members: [...], room: {...} }
 *   { type: 'event', event, data, from: { summoner_id, summoner_name }, to }
 */

interface MemberInfo {
  summoner_id: number;
  summoner_name: string;
  skin?: SkinInfo;
}

interface SkinInfo {
  champion_id: number;
  skin_id: number;
  chroma_id?: number;
  skin_name?: string;
  champion_name?: string;
}

const ROOM_KEYS = new Set(['color', 'theme', 'roulette']);
const MAX_EVENT_BYTES = 4096;

export class PartyRoom extends DurableObject {
  private static MAX_MEMBERS = 10;

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('ping', 'pong'),
    );
  }

  async fetch(request: Request): Promise<Response> {
    const sockets = this.ctx.getWebSockets();
    const active = sockets.filter(ws => ws.readyState === WebSocket.READY_STATE_OPEN);

    if (active.length >= PartyRoom.MAX_MEMBERS) {
      return new Response('Room is full', { status: 409 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);

    // Send current member list + room state to the new joiner
    const members = this.getMembers();
    const room = await this.getRoomState();
    server.send(JSON.stringify({ type: 'members', members, room }));

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== 'string') return;
    if (message === 'pong') return;

    let msg: any;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'join': {
        // Member announces themselves
        const info: MemberInfo = {
          summoner_id: msg.summoner_id,
          summoner_name: msg.summoner_name || 'Unknown',
        };
        ws.serializeAttachment(info);
        await this.broadcastMembers();
        break;
      }
      case 'skin': {
        // Member updated their skin selection
        const existing = ws.deserializeAttachment() as MemberInfo | null;
        if (existing) {
          existing.skin = msg.skin || null;
          ws.serializeAttachment(existing);
          await this.broadcastMembers();
        }
        break;
      }
      case 'event': {
        // Relay a social event (challenge, roulette, theme...) to the other members
        const from = ws.deserializeAttachment() as MemberInfo | null;
        if (!from || typeof msg.event !== 'string') break;
        const payload = JSON.stringify({
          type: 'event',
          event: msg.event,
          data: msg.data ?? null,
          to: typeof msg.to === 'number' ? msg.to : null,
          from: { summoner_id: from.summoner_id, summoner_name: from.summoner_name },
          ts: Date.now(),
        });
        if (payload.length > MAX_EVENT_BYTES) break;
        for (const other of this.ctx.getWebSockets()) {
          if (other === ws) continue;
          try {
            if (other.readyState !== WebSocket.READY_STATE_OPEN) continue;
            if (typeof msg.to === 'number') {
              const info = other.deserializeAttachment() as MemberInfo | null;
              if (!info || info.summoner_id !== msg.to) continue;
            }
            other.send(payload);
          } catch {}
        }
        break;
      }
      case 'room_set': {
        // Shared room state (party color, theme...). Persists while the room object lives.
        const from = ws.deserializeAttachment() as MemberInfo | null;
        if (!from || typeof msg.key !== 'string' || !ROOM_KEYS.has(msg.key)) break;
        const value = msg.value;
        if (value === null || value === undefined) {
          await this.ctx.storage.delete(`room:${msg.key}`);
        } else {
          const serialized = JSON.stringify(value);
          if (serialized.length > 512) break;
          await this.ctx.storage.put(`room:${msg.key}`, {
            value,
            by: from.summoner_id,
            by_name: from.summoner_name,
            ts: Date.now(),
          });
        }
        await this.broadcastMembers();
        break;
      }
      case 'leave': {
        ws.close(1000, 'client left');
        break;
      }
    }
  }

  async webSocketClose(ws: WebSocket) {
    // Clear the member info so getMembers() won't include them
    ws.serializeAttachment(null);
    await this.broadcastMembers();
  }

  async webSocketError(ws: WebSocket) {
    ws.serializeAttachment(null);
    await this.broadcastMembers();
  }

  private getMembers(): MemberInfo[] {
    const members: MemberInfo[] = [];
    for (const ws of this.ctx.getWebSockets()) {
      try {
        if (ws.readyState !== WebSocket.READY_STATE_OPEN) continue;
        const info = ws.deserializeAttachment() as MemberInfo | null;
        if (info?.summoner_id) {
          members.push(info);
        }
      } catch {}
    }
    return members;
  }

  private async getRoomState(): Promise<Record<string, any>> {
    const room: Record<string, any> = {};
    try {
      const entries = await this.ctx.storage.list({ prefix: 'room:' });
      for (const [key, value] of entries) {
        room[key.slice('room:'.length)] = value;
      }
    } catch {}
    return room;
  }

  private async broadcastMembers() {
    const members = this.getMembers();
    const room = await this.getRoomState();
    if (members.length === 0) {
      // Last member left: forget the shared state so the next session starts clean
      try { await this.ctx.storage.deleteAll(); } catch {}
      return;
    }
    const payload = JSON.stringify({ type: 'members', members, room });
    for (const ws of this.ctx.getWebSockets()) {
      try {
        if (ws.readyState === WebSocket.READY_STATE_OPEN) {
          ws.send(payload);
        }
      } catch {}
    }
  }
}
