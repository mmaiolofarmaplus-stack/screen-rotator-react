"""
SETUP AUTENTICACION GOOGLE DRIVE - correr UNA sola vez
Abre el browser, pedis acceso, guarda token.json para uso futuro.

Necesitas primero:
  1. Ir a https://console.cloud.google.com/
  2. Crear proyecto (o usar uno existente)
  3. Ir a APIs y servicios > Habilitar APIs > habilitar "Google Drive API"
  4. Ir a Credenciales > Crear credenciales > ID de cliente OAuth 2.0
     - Tipo de aplicacion: "Aplicacion de escritorio"
     - Descarga el JSON y guardalo como: input/credentials.json
  5. Correr este script: py setup_google_auth.py
"""

import os, json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDS_PATH = os.path.join(BASE_DIR, "input", "credentials.json")
TOKEN_PATH = os.path.join(BASE_DIR, "input", "token.json")

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

if not os.path.exists(CREDS_PATH):
    print(f"\nERROR: No se encontro: {CREDS_PATH}")
    print("\nGuarda el credentials.json descargado de Google Cloud en: input/credentials.json\n")
else:
    print("OK: credentials.json encontrado. Abriendo browser para autorizar...")
    flow = InstalledAppFlow.from_client_secrets_file(CREDS_PATH, SCOPES)
    creds = flow.run_local_server(port=0)

    with open(TOKEN_PATH, 'w') as f:
        f.write(creds.to_json())

    print(f"\nOK: Token guardado en: {TOKEN_PATH}")
    print("   El script generate_data.py ya puede correr autonomamente.")
