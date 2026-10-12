"""Native desktop shell for J.A.R.V.I.S. with startup checks and clean shutdown."""
import os
import socket
import threading
import time
import urllib.error
import urllib.request

import uvicorn
import webview

from app import app


def free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def wait_for_server(server, url, timeout=20):
    deadline = time.monotonic() + timeout
    last_error = None
    while time.monotonic() < deadline:
        if not server.started and getattr(server, "should_exit", False):
            break
        try:
            with urllib.request.urlopen(url + "/api/status", timeout=1) as response:
                if response.status == 200:
                    return
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_error = exc
        time.sleep(0.2)
    detail = f" Last check: {last_error}" if last_error else ""
    raise RuntimeError("J.A.R.V.I.S. local web service did not become ready. "
                       "Try running setup_jarvis.bat again." + detail)


def main():
    port = free_port()
    url = f"http://127.0.0.1:{port}"
    config = uvicorn.Config(
        app, host="127.0.0.1", port=port, log_level="error", access_log=False,
        log_config=None,
    )
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, name="JarvisLocalServer", daemon=True)
    thread.start()
    try:
        wait_for_server(server, url)
        webview.create_window(
            "J.A.R.V.I.S. Personal Assistant", url,
            width=1280, height=850, min_size=(360, 560),
            background_color="#050b12",
        )
        webview.start(debug=False)
    except Exception as exc:
        message = f"J.A.R.V.I.S. could not start:\n\n{exc}\n\n"
        message += "Run setup_jarvis.bat, then run_desktop.bat."
        try:
            import ctypes
            ctypes.windll.user32.MessageBoxW(None, message, "J.A.R.V.I.S. startup error", 0x10)
        except Exception:
            print(message)
            input("Press Enter to close...")
    finally:
        server.should_exit = True
        thread.join(timeout=5)


if __name__ == "__main__":
    main()
