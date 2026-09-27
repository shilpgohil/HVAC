import json
from typing import List, Dict, Any
from fastapi import WebSocket


class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, data: Dict[str, Any]) -> None:
        disconnected: List[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(data))
            except Exception:
                disconnected.append(connection)
        for dead in disconnected:
            self.disconnect(dead)


ws_manager = WebSocketManager()
