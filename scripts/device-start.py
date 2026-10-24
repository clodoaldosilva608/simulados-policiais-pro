#!/usr/bin/env python3
"""Inicia o fluxo OAuth Device da Vercel manualmente (contornando o processo
da CLI, que morre em background neste sandbox).

Salva o device_code em /tmp/spp-device.json e imprime o link de aprovação
que o dono da conta deve abrir e confirmar no navegador.
"""
import json
import time
import urllib.request
import urllib.parse

CLIENT_ID = "cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp"  # client_id público da CLI oficial
DEVICE_AUTH_URL = "https://api.vercel.com/login/oauth/device-authorization"
STATE_FILE = "/tmp/spp-device.json"


def main() -> None:
    body = urllib.parse.urlencode(
        {"client_id": CLIENT_ID, "scope": "openid offline_access"}
    ).encode()
    req = urllib.request.Request(
        DEVICE_AUTH_URL,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())

    state = {
        "device_code": data["device_code"],
        "user_code": data["user_code"],
        "verification_uri": data.get("verification_uri", "https://vercel.com/oauth/device"),
        "verification_uri_complete": data.get("verification_uri_complete", ""),
        "expires_at": time.time() + int(data.get("expires_in", 600)),
        "interval": max(3, int(data.get("interval", 5))),
    }
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)

    print("USER_CODE:", state["user_code"])
    print("LINK:", state["verification_uri_complete"] or state["verification_uri"])
    print("EXPIRA_EM_S:", int(state["expires_at"] - time.time()))


if __name__ == "__main__":
    main()
