#!/usr/bin/env python3
"""Faz polling do endpoint de token da Vercel com o device_code salvo por
device-start.py. Roda em FOREGROUND (sobrevive ao reap de background deste
ambiente). Ao aprovar no navegador, grava o access_token em
/tmp/spp-vtoken.txt (chmod 600) e imprime OK.

Uso: python3 device-poll.py [max_segundos=540]
"""
import json
import os
import stat
import sys
import time
import urllib.request
import urllib.parse

CLIENT_ID = "cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp"
TOKEN_URL = "https://api.vercel.com/login/oauth/token"
STATE_FILE = "/tmp/spp-device.json"
TOKEN_FILE = "/tmp/spp-vtoken.txt"


def main() -> None:
    max_wait = int(sys.argv[1]) if len(sys.argv) > 1 else 540
    with open(STATE_FILE) as f:
        state = json.load(f)

    deadline = min(state["expires_at"], time.time() + max_wait)
    interval = state["interval"]
    print(f"Polling a cada {interval}s até {int(deadline - time.time())}s…", flush=True)

    while time.time() < deadline:
        body = urllib.parse.urlencode(
            {
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
                "device_code": state["device_code"],
                "client_id": CLIENT_ID,
            }
        ).encode()
        req = urllib.request.Request(
            TOKEN_URL,
            data=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            # 400 = authorization_pending / slow_down (fluxo normal)
            try:
                data = json.loads(e.read().decode())
            except Exception:
                data = {"error": f"http_{e.code}"}
        except Exception as e:
            data = {"error": f"request_failed: {e}"}

        err = data.get("error")
        if "access_token" in data:
            token = data["access_token"]
            refresh = data.get("refresh_token", "")
            fd = os.open(TOKEN_FILE, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
            with os.fdopen(fd, "w") as f:
                f.write(token + ("\n" + refresh if refresh else ""))
            os.chmod(TOKEN_FILE, stat.S_IRUSR | stat.S_IWUSR)
            print("OK — token gravado em", TOKEN_FILE, flush=True)
            return
        if err == "authorization_pending":
            print(".", end="", flush=True)
        elif err == "slow_down":
            interval += 5
        elif err in ("expired_token", "access_denied"):
            print(f"\nFALHA: {err}", flush=True)
            return
        else:
            print(f"\nerro inesperado: {err}", flush=True)
            return
        time.sleep(interval)

    print("\nTIMEOUT local — rode novamente se ainda não aprovou.", flush=True)


if __name__ == "__main__":
    main()
