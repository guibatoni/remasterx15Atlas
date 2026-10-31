#!/usr/bin/env python3
"""Importa artes por nome exato; grava localmente; NÃO associa imagens apenas pelo ID.

Fontes consultadas:
  - rodrigoazlima/ygofm-app (fotos históricas de FMR, por slug do nome)
  - YGOPRODeck API (busca exata pelo nome, imagens baixadas uma só vez)

As artes têm direitos de terceiros. Confira permissão de uso antes de hospedar publicamente.
"""
import argparse, csv, json, re, sys, time, unicodedata, urllib.error, urllib.parse, urllib.request
from pathlib import Path
BASE=Path(__file__).resolve().parent
CARDS=BASE/'data'/'dados.json'
OUT=BASE/'images'
PREFIX='https://raw.githubusercontent.com/rodrigoazlima/ygofm-app/main/'
MANIFEST=PREFIX+'src/data/localImages.json'
API='https://db.ygoprodeck.com/api/v7/cardinfo.php?name='
AGENT='AtlasX15-UserCardArtImporter/1.0 (personal offline use)'

def normalize(t):
 t=unicodedata.normalize('NFKD',str(t)).lower()
 return ''.join(c for c in t if c.isalnum() and c.isascii())

def fetch(url,attempts=3):
 req=urllib.request.Request(url,headers={'User-Agent':AGENT,'Accept':'application/json,image/jpeg,image/png,image/webp,*/*'})
 for tries in range(attempts):
  try:
   with urllib.request.urlopen(req,timeout=20) as r:
    if int(r.status)!=200:return b''
    blob=r.read(4_000_000)
    if len(blob)>=4_000_000:return b''
    return blob
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as e:
   if isinstance(e,urllib.error.HTTPError) and e.code in (400,403,404):return b''
   time.sleep(2*(tries+1))
 return b''

def image_kind(blob):
 if blob.startswith(b'\xff\xd8\xff'):return 'jpg'
 if blob.startswith(b'\x89PNG\r\n\x1a\n'):return 'png'
 if blob[:4]==b'RIFF' and blob[8:12]==b'WEBP':return 'webp'
 return None

def main():
 p=argparse.ArgumentParser(description='Baixar imagens verificadas pelo nome da carta do X15')
 p.add_argument('--limit',type=int,default=722,help='Quantidade máxima de cartas a tentar (padrão: 722)')
 p.add_argument('--start',type=int,default=1,help='ID inicial')
 p.add_argument('--sem-ygoprodeck',action='store_true',help='Usar apenas coleção Forbidden Memories')
 args=p.parse_args()
 OUT.mkdir(exist_ok=True)
 data=json.loads(CARDS.read_text('utf-8'))
 entries=data['cards']
 print('Consultando manifesto das artes originais ...')
 manifest={}
 raw=fetch(MANIFEST)
 try:
  imgmap=json.loads(raw.decode('utf-8'))
  for k,v in imgmap.items():
   f=Path(v).name
   if not re.search(r'\.(?:webp|jpg|jpeg|png)$',f,re.I):continue
   slug=re.sub(r'(?i)-FMR-EN-VG.*$','',f).rsplit('.',1)[0]
   if slug.isdigit():continue
   manifest[normalize(slug)]=v.lstrip('/')
  print('Manifesto carregado:',len(manifest),'artes por nome')
 except Exception:
  print('Não foi possível acessar o manifesto. Continuando com a API alternativa.')
 made,exists,missing=0,0,[]
 for id,name,*_ in [c for c in entries if c[0]>=args.start][:args.limit]:
  if any((OUT/f'{id}.{e}').is_file() for e in ('jpg','png','webp')):
   exists+=1;continue
  data=None;source=''
  pth=manifest.get(normalize(name))
  if pth:
   url=PREFIX+urllib.parse.quote(pth,safe='/')
   image=fetch(url)
   if image_kind(image):data=image;source=url
  if data is None and not args.sem_ygoprodeck:
   try:
    result=fetch(API+urllib.parse.quote(name))
    if result:
     obj=json.loads(result.decode('utf-8'))
     matches=[x for x in obj.get('data',[]) if normalize(x.get('name',''))==normalize(name)]
     if matches and matches[0].get('card_images'):
      url=matches[0]['card_images'][0]['image_url']
      if url.startswith('https://images.ygoprodeck.com/'):
       image=fetch(url)
       if image_kind(image):data=image;source=url
   except (ValueError,KeyError,UnicodeDecodeError):pass
   time.sleep(.32) # Abaixo do limite publicado da API; sem hotlinking.
  if data:
   ext=image_kind(data)
   (OUT/f'{id}.{ext}').write_bytes(data)
   made+=1
   print(f'[{id:03d}] {name} -> {ext} ({len(data)//1024} KiB)')
  else:
   missing.append((id,name))
   print(f'[{id:03d}] {name} -> arte não encontrada com correspondência exata')
 print(f'\nConcluído. Baixadas: {made}; já existentes: {exists}; não encontradas: {len(missing)}')
 if missing:
  (BASE/'imagens_nao_encontradas.csv').write_text('ID,Nome\n'+''.join(f'{i},"{n.replace(chr(34),chr(34)*2)}"\n' for i,n in missing),encoding='utf-8')
 print('Confira se a arte da fonte é a mesma da versão modificada X15 antes de publicar.')

if __name__=='__main__':main()
