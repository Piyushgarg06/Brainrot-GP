import os
import time
import json
import logging
import threading
import requests
from datetime import datetime, timezone
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from fastf1.livetiming.client import SignalRClient
from signalrcore.hub_connection_builder import HubConnectionBuilder
from signalrcore.messages.completion_message import CompletionMessage

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
current_drivers = {
    "1": {"driverNumber": 1, "broadcastName": "L NORRIS", "nameAcronym": "NOR", "teamName": "McLaren", "teamColour": "F47600"},
    "3": {"driverNumber": 3, "broadcastName": "M VERSTAPPEN", "nameAcronym": "VER", "teamName": "Red Bull Racing", "teamColour": "4781D7"},
    "5": {"driverNumber": 5, "broadcastName": "G BORTOLETO", "nameAcronym": "BOR", "teamName": "Audi", "teamColour": "F50537"},
    "6": {"driverNumber": 6, "broadcastName": "I HADJAR", "nameAcronym": "HAD", "teamName": "Red Bull Racing", "teamColour": "4781D7"},
    "10": {"driverNumber": 10, "broadcastName": "P GASLY", "nameAcronym": "GAS", "teamName": "Alpine", "teamColour": "00A1E8"},
    "11": {"driverNumber": 11, "broadcastName": "S PEREZ", "nameAcronym": "PER", "teamName": "Cadillac", "teamColour": "909090"},
    "12": {"driverNumber": 12, "broadcastName": "K ANTONELLI", "nameAcronym": "ANT", "teamName": "Mercedes", "teamColour": "00D7B6"},
    "14": {"driverNumber": 14, "broadcastName": "F ALONSO", "nameAcronym": "ALO", "teamName": "Aston Martin", "teamColour": "229971"},
    "16": {"driverNumber": 16, "broadcastName": "C LECLERC", "nameAcronym": "LEC", "teamName": "Ferrari", "teamColour": "ED1131"},
    "18": {"driverNumber": 18, "broadcastName": "L STROLL", "nameAcronym": "STR", "teamName": "Aston Martin", "teamColour": "229971"},
    "23": {"driverNumber": 23, "broadcastName": "A ALBON", "nameAcronym": "ALB", "teamName": "Williams", "teamColour": "1868DB"},
    "27": {"driverNumber": 27, "broadcastName": "N HULKENBERG", "nameAcronym": "HUL", "teamName": "Audi", "teamColour": "F50537"},
    "30": {"driverNumber": 30, "broadcastName": "L LAWSON", "nameAcronym": "LAW", "teamName": "Racing Bulls", "teamColour": "6C98FF"},
    "31": {"driverNumber": 31, "broadcastName": "E OCON", "nameAcronym": "OCO", "teamName": "Haas F1 Team", "teamColour": "9C9FA2"},
    "41": {"driverNumber": 41, "broadcastName": "A LINDBLAD", "nameAcronym": "LIN", "teamName": "Racing Bulls", "teamColour": "6C98FF"},
    "43": {"driverNumber": 43, "broadcastName": "F COLAPINTO", "nameAcronym": "COL", "teamName": "Alpine", "teamColour": "00A1E8"},
    "44": {"driverNumber": 44, "broadcastName": "L HAMILTON", "nameAcronym": "HAM", "teamName": "Ferrari", "teamColour": "ED1131"},
    "55": {"driverNumber": 55, "broadcastName": "C SAINZ", "nameAcronym": "SAI", "teamName": "Williams", "teamColour": "1868DB"},
    "63": {"driverNumber": 63, "broadcastName": "G RUSSELL", "nameAcronym": "RUS", "teamName": "Mercedes", "teamColour": "00D7B6"},
    "77": {"driverNumber": 77, "broadcastName": "V BOTTAS", "nameAcronym": "BOT", "teamName": "Cadillac", "teamColour": "909090"},
    "81": {"driverNumber": 81, "broadcastName": "O PIASTRI", "nameAcronym": "PIA", "teamName": "McLaren", "teamColour": "F47600"},
    "87": {"driverNumber": 87, "broadcastName": "O BEARMAN", "nameAcronym": "BEA", "teamName": "Haas F1 Team", "teamColour": "9C9FA2"}
}
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
    payload = msg[1]
    
    if isinstance(payload, str):
        try:
            payload = json.loads(payload)
        except Exception as e:
            logger.error(f"Failed to parse payload for topic {topic}: {e}")
            return

    with state_lock:
        if topic == "SessionInfo":
            meeting = payload.get("Meeting", {})
            session_info["sessionKey"] = payload.get("Key", 9999)
            session_info["sessionName"] = payload.get("Name", "Live Session")
            session_info["sessionType"] = payload.get("Type", "Race")
            session_info["dateStart"] = payload.get("StartDate", datetime.now(timezone.utc).isoformat() + "Z")
            session_info["dateEnd"] = payload.get("EndDate", None)
            session_info["circuitName"] = meeting.get("Circuit", {}).get("ShortName", "Unknown Circuit")
            
        elif topic == "DriverList":
            for num, d in payload.items():
                if num == "_kf":
                    continue
                
                # If d is not a dictionary (unexpected), skip it
                if not isinstance(d, dict):
                    continue
                    
                driver_num = int(num)
                existing = current_drivers.get(num, {
                    "driverNumber": driver_num,
                    "broadcastName": f"DRV{num}",
                    "nameAcronym": f"DRV{num}",
                    "teamName": "Unknown Team",
                    "teamColour": "FFFFFF"
                })
                
                if "Tla" in d:
                    existing["nameAcronym"] = d["Tla"]
                if "BroadcastName" in d:
                    existing["broadcastName"] = d["BroadcastName"]
                elif "FullName" in d:
                    existing["broadcastName"] = d["FullName"]
                if "TeamName" in d:
                    existing["teamName"] = d["TeamName"]
                if "TeamColour" in d:
                    existing["teamColour"] = d["TeamColour"]
                    
                current_drivers[num] = existing
                
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
                        
        elif topic == "TopThree":
            lines = payload.get("Lines", [])
            if isinstance(lines, dict):
                for pos_str, val in lines.items():
                    if isinstance(val, dict):
                        num = val.get("RacingNumber", None)
                        if num:
                            # pos_str is the dict key ("0", "1", "2" representing the 0-indexed position)
                            current_positions[num] = int(pos_str) + 1
            elif isinstance(lines, list):
                for idx, line in enumerate(lines):
                    if isinstance(line, dict):
                        num = line.get("RacingNumber", None)
                        if num:
                            current_positions[num] = idx + 1
                    elif isinstance(line, (str, int)):
                        current_positions[str(line)] = idx + 1

        # Build final state object
        live_state["session"] = {
            "sessionKey": session_info.get("sessionKey", 9999),
            "sessionName": session_info.get("sessionName", "Live Race"),
            "sessionType": session_info.get("sessionType", "Race"),
            "dateStart": session_info.get("dateStart", datetime.now(timezone.utc).isoformat() + "Z"),
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
                "date": datetime.now(timezone.utc).isoformat() + "Z"
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

    def _on_message(self, msg):
        self._t_last_message = time.time()
        if isinstance(msg, CompletionMessage):
            if msg.result and isinstance(msg.result, dict):
                for topic, payload in msg.result.items():
                    process_signalr_message([topic, payload])
        elif isinstance(msg, list) and len(msg) >= 2:
            process_signalr_message(msg)

    def _supervise(self):
        # Monitor the connection state and auto-reconnect if it falls offline
        self._t_last_message = time.time()
        was_connected = False
        while True:
            if self._is_connected:
                was_connected = True
            elif was_connected:
                logger.warning("WebSocket connection lost! Attempting to reconnect...")
                was_connected = False
                try:
                    self._connection.stop()
                except Exception as e:
                    logger.error(f"Error stopping connection: {e}")
                
                # Reconnection retry loop
                reconnect_delay = 2
                while not self._is_connected:
                    try:
                        logger.info("Retrying WebSocket connection...")
                        self._run()
                        logger.info("Reconnection successful!")
                    except Exception as e:
                        logger.error(f"Reconnection attempt failed: {e}")
                        time.sleep(reconnect_delay)
                        reconnect_delay = min(reconnect_delay * 2, 30) # exponential backoff
            time.sleep(1)

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    pass

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
    port = int(os.environ.get('PORT', 8080))
    server = ThreadingHTTPServer(('0.0.0.0', port), CORSRequestHandler)
    logger.info(f"HTTP proxy server running on http://0.0.0.0:{port}/live")
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
