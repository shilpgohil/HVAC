"""
Render Free-Tier Keep-Alive Daemon.
Pings the Render backend health endpoint every 10 minutes (600 seconds)
to prevent the free-tier service from sleeping after 15 minutes of inactivity.
"""

import time
import os
import sys
import urllib.request
import urllib.error

RENDER_URL = os.environ.get("RENDER_BACKEND_URL", "https://hvac-digital-twin-backend.onrender.com")
PING_INTERVAL_SECONDS = 600  # 10 minutes


def ping_render(url: str):
    target_url = f"{url.rstrip('/')}/health"
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Pinging: {target_url} ...")
    try:
        req = urllib.request.Request(
            target_url,
            headers={"User-Agent": "HVAC-Twin-KeepAlive/1.0"}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            status = response.getcode()
            body = response.read().decode("utf-8")
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] OK ({status}): {body}")
            return True
    except urllib.error.HTTPError as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] HTTP Error: {e.code} - {e.reason}")
        return False
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Connection failed: {e}")
        return False


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else RENDER_URL
    print(f"Starting Keep-Alive Daemon for: {target}")
    print(f"Interval: every {PING_INTERVAL_SECONDS // 60} minutes")
    print("Press Ctrl+C to terminate.")
    
    while True:
        ping_render(target)
        time.sleep(PING_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
