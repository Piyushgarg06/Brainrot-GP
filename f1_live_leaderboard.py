import time
import json
import logging
import threading
import requests
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from fastf1.livetiming.client import SignalRClient
from signalrcore.hub_connection_builder import HubConnectionBuilder

# Configure logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("F1LiveProxy")

# Global State
live_state = {
    "session": None,
    "positions": [],
    "drivers": {},
    "driverNumberMap": {},
    "fastestLap": None,
    "isLive": False,
    "lastUpdated": 0,
    "error": None
}

state_lock = threading.Lock()

# Temporary local cache
current_positions = {}  # driver_number -> position
current_drivers = {}    # driver_number -> driver_dict
session_info = {}       # session info fields
best_lap_seconds = None # float representation of best lap

def parse_lap_time(lap_str):
    try:
        parts = lap_str.split(':')
        if len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        return float(lap_str)
    except:
        return None

def process_signalr_message(msg):
    global best_lap_seconds
    if not isinstance(msg, list) or len(msg) < 2:
        return

    topic = msg[0]
    try:
        payload = json.loads(msg[1])
    except Exception as e:
        logger.error(f"Failed to parse payload for topic {topic}: {e}")
        return

    with state_lock:
        if topic == "SessionInfo":
            meeting = payload.get("Meeting", {})
            session_info["sessionKey"] = payload.get("Key", 9999)
            session_info["sessionName"] = payload.get("Name", "Live Session")
            session_info["sessionType"] = payload.get("Type", "Race")
            session_info["dateStart"] = payload.get("StartDate", datetime.utcnow().isoformat() + "Z")
            session_info["dateEnd"] = payload.get("EndDate", None)
            session_info["circuitName"] = meeting.get("Circuit", {}).get("ShortName", "Unknown Circuit")
            
        elif topic == "DriverList":
            for num, d in payload.items():
                if num == "_kf":
                    continue
                driver_num = int(num)
                acronym = d.get("Tla", f"DRV{num}")
                current_drivers[num] = {
                    "driverNumber": driver_num,
                    "broadcastName": d.get("BroadcastName", d.get("FullName", acronym)),
                    "nameAcronym": acronym,
                    "teamName": d.get("TeamName", "Unknown Team"),
                    "teamColour": d.get("TeamColour", "FFFFFF")
                }
                
        elif topic == "TimingData":
            lines = payload.get("Lines", {})
            for num, line in lines.items():
                if num == "_kf":
                    continue
                pos = line.get("Position", None)
                if pos:
                    current_positions[num] = int(pos)
                
                # Check for fastest lap in timing stats/lap times
                last_lap = line.get("LastLapTime", {})
                last_lap_val = last_lap.get("Value", None) if isinstance(last_lap, dict) else None
                if last_lap_val:
                    last_lap_sec = parse_lap_time(last_lap_val)
                    if last_lap_sec and (best_lap_seconds is None or last_lap_sec < best_lap_seconds):
                        best_lap_seconds = last_lap_sec
                        acronym = current_drivers.get(num, {}).get("nameAcronym", f"DRV{num}")
                        live_state["fastestLap"] = {
                            "driverCode": acronym,
                            "time": last_lap_val
                        }

        # Build final state object
        live_state["session"] = {
            "sessionKey": session_info.get("sessionKey", 9999),
            "sessionName": session_info.get("sessionName", "Live Race"),
            "sessionType": session_info.get("sessionType", "Race"),
            "dateStart": session_info.get("dateStart", datetime.utcnow().isoformat() + "Z"),
            "dateEnd": session_info.get("dateEnd", None),
            "circuitName": session_info.get("circuitName", "Unknown Circuit")
        } if session_info else None

        live_state["drivers"] = current_drivers
        live_state["driverNumberMap"] = {int(k): v["nameAcronym"] for k, v in current_drivers.items()}
        
        # Format positions array sorted by position
        pos_array = []
        for num, pos_val in current_positions.items():
            pos_array.append({
                "driverNumber": int(num),
                "position": pos_val,
                "date": datetime.utcnow().isoformat() + "Z"
            })
        pos_array.sort(key=lambda x: x["position"])
        live_state["positions"] = pos_array
        
        live_state["isLive"] = len(pos_array) > 0
        live_state["lastUpdated"] = int(time.time() * 1000)
        live_state["error"] = None

# Custom SignalR Client that overrides _run to completely omit access_token_factory
class CustomSignalRClient(SignalRClient):
    def _run(self):
        r = requests.options(self._negotiate_url, headers=self.headers)
        if 'AWSALBCORS' in r.cookies:
            self.headers.update({'Cookie': f'AWSALBCORS={r.cookies["AWSALBCORS"]}'})
        
        options = {
            "verify_ssl": True,
            "headers": self.headers
        }
        self._connection = HubConnectionBuilder() \
            .with_url(self._connection_url, options=options) \
            .configure_logging(logging.WARNING) \
            .build()
        
        self._connection.on_open(self._on_connect)
        self._connection.on_close(self._on_close)
        self._connection.on('feed', self._on_message)
        self._connection.start()
        
        while not self._is_connected:
            time.sleep(0.1)
            
        self._connection.send("Subscribe", [self.topics], on_invocation=self._on_message)

    def _on_message(self, msg: list):
        self._t_last_message = time.time()
        if isinstance(msg, list) and len(msg) >= 2:
            process_signalr_message(msg)

# HTTP API Server
class CORSRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress logging every single request to keep logs clean
        return

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/live':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            with state_lock:
                response_data = json.dumps(live_state)
            self.wfile.write(response_data.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run_http_server():
    server = HTTPServer(('localhost', 8080), CORSRequestHandler)
    logger.info("Local HTTP proxy server running on http://localhost:8080/live")
    server.serve_forever()

def main():
    # Start HTTP Server thread
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()

    logger.info("Initializing F1 SignalR connection...")
    # Start SignalR timing client (runs on main thread, timeout=0 to never exit)
    # We pass a dummy filename since we override _on_message and write to memory instead
    client = CustomSignalRClient(filename='dummy_stream.txt', timeout=0)
    client.start()

if __name__ == "__main__":
    main()
