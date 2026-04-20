"""
GENERADOR DE DATOS - DASHBOARD FARMAPLUS

Lee todas las hojas directamente desde Google Sheets (generadas por EasyMorph).
No hace calculos — solo descarga y guarda los CSVs.
"""

import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SHEET_ID = '1rTow4rq7UJL4Kuts-JdMLBS6AUqXcHXUrYOgEWj_fI4'

SHEETS = {
    'base_conocimiento':     '1016914412',
    'horas_hoy':             '1209004727',
    'horas_semana_anterior': '2088265702',
    'clientes':              '1855567166',
    'nominados':             '1235412273',
}

def fetch_sheet(name: str, gid: str) -> pd.DataFrame:
    url = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={gid}'
    try:
        df = pd.read_csv(url)
        print(f"  OK: {name} → {len(df)} filas")
        return df
    except Exception as e:
        print(f"  ERROR: {name} → {e}")
        return pd.DataFrame()

print("Descargando hojas desde Google Sheets...")
df_base = fetch_sheet('base_conocimiento',     SHEETS['base_conocimiento'])
df_hoy  = fetch_sheet('horas_hoy',             SHEETS['horas_hoy'])
df_sem  = fetch_sheet('horas_semana_anterior',  SHEETS['horas_semana_anterior'])
df_cli  = fetch_sheet('clientes',              SHEETS['clientes'])
df_nom  = fetch_sheet('nominados',             SHEETS['nominados'])

print("\nGuardando CSVs...")

df_base.to_csv(os.path.join(BASE_DIR, 'public', 'data', 'base_conocimiento.csv'),    index=False, encoding='utf-8-sig')
df_hoy.to_csv( os.path.join(BASE_DIR, 'public', 'data', 'horas_hoy.csv'),            index=False, encoding='utf-8-sig')
df_sem.to_csv( os.path.join(BASE_DIR, 'public', 'data', 'horas_semana_anterior.csv'),index=False, encoding='utf-8-sig')

# Beneficios — fila unica
ctx        = df_base.iloc[0] if not df_base.empty else {}
dia_actual = int(ctx.get('Ctx_Dia_Del_Mes', 1))

alta_clientes = int(df_cli['TotalClientes'].iloc[0])                                      if not df_cli.empty else 0
pct_nominados = float(str(df_nom['PctNominados'].iloc[0]).replace(',', '.'))              if not df_nom.empty else 0
tickets_nom   = int(df_nom['TicketsNominados'].iloc[0])                                   if not df_nom.empty else 0
tickets_base  = int(df_nom['TotalTickets'].iloc[0])                                       if not df_nom.empty else 0

pd.DataFrame([{
    'Alta_Clientes':            alta_clientes,
    'Pct_Nominados':            pct_nominados,
    'Tickets_Nominados':        tickets_nom,
    'Total_Tickets':            tickets_base,
    'Promedio_Diario_Clientes': round(alta_clientes / dia_actual, 0) if dia_actual else 0,
    'Meta_Pct_Nominados':       35.0,
}]).to_csv(os.path.join(BASE_DIR, 'public', 'data', 'beneficios.csv'), index=False, encoding='utf-8-sig')

print("  OK: beneficios.csv")
print(f"\nLISTO — fecha: {ctx.get('Ctx_Fecha_Hoy', '?')} · franja: {ctx.get('Ctx_Ultima_Franja_Hora', '?')}hs")
