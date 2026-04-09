import urllib.request

url_mes = 'https://docs.google.com/spreadsheets/d/1wf3hR0gX28TspJQqeaRNOMP1p4vU8ln9YSF37It9s8k/export?format=csv&gid=1168579076'
url_obj = 'https://docs.google.com/spreadsheets/d/1wf3hR0gX28TspJQqeaRNOMP1p4vU8ln9YSF37It9s8k/export?format=csv&gid=1915087423'

print("--- Facturacion Mes ---")
req = urllib.request.Request(url_mes, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    lines = response.read().decode('utf-8').split('\n')
    for line in lines[:5]:
        print(line)

print("\n--- Objetivos ---")
req = urllib.request.Request(url_obj, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    lines = response.read().decode('utf-8').split('\n')
    for line in lines[:5]:
        print(line)
