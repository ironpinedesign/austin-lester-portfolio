"""Local-only security regression checks. Never accepts a production URL.
Temporarily swaps the local D1 owner fixture to exercise a signed-in non-owner,
then restores it in finally. The real Sites account/runtime is never touched.
"""
import base64, csv, html, http.cookiejar, io, json, pathlib, sqlite3, urllib.error, urllib.request
origin='http://localhost:3000'
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
anon=urllib.request.build_opener(NoRedirect())
owner=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def req(path,method='GET',data=None,auth=False,expected=200,headers=None):
 h={'Origin':origin} if method not in ['GET','HEAD'] else {}
 if isinstance(data,dict) or isinstance(data,list):h['Content-Type']='application/json';data=json.dumps(data).encode()
 h.update(headers or {})
 try:r=(owner if auth else anon).open(urllib.request.Request(origin+path,data=data,headers=h,method=method));status=r.status;raw=r.read();rh=r.headers
 except urllib.error.HTTPError as e:status=e.code;raw=e.read();rh=e.headers
 assert status in ([expected] if isinstance(expected,int) else expected),(path,method,status,expected,raw[:200])
 return raw,rh
req('/signin-with-chatgpt?return_to=/studio',auth=True)
# Find only the local emulator DB, never an arbitrary database.
local_db=None
for p in pathlib.Path('.wrangler/state/v3/d1').rglob('*.sqlite'):
 c=sqlite3.connect(p)
 if c.execute("SELECT name FROM sqlite_master WHERE name='studio_owner'").fetchone():local_db=p;c.close();break
 c.close()
assert local_db,'Start the local site and claim the local test owner first.'
with sqlite3.connect(local_db) as c:
 owner_id=c.execute('SELECT user_id FROM studio_owner WHERE id=1').fetchone()[0]
assert owner_id=='local_seedy','Refusing to alter any non-local owner identity.'
for route in ['/','/work','/about','/contact','/work/kryptek-identity-system']:
 req(route)
for route in ['/studio','/studio/content','/studio/map']:
 _,h=req(route,expected=[302,303,307,308]);assert h['Location'].startswith('/signin-with-chatgpt')
for route in ['/studio','/studio/content','/studio/map']:req(route,auth=True)
mutations=[('/api/studio/media','POST',b'bad'),('/api/studio/media','PATCH',{'id':'none','alt':'bad'}),('/api/studio/media','DELETE',{'id':'none'}),('/api/studio/placements','PUT',{'slot':'home.hero.image','mediaId':None}),('/api/studio/settings','PUT',{'contact_email':'bad'}),('/api/studio/content','POST',{'action':'preview','csv':''}),('/api/studio/content','POST',{'action':'apply','csv':'','revision':0}),('/api/studio/content','POST',{'action':'restore','revision':0}),('/api/studio/claim','POST',{'code':'wrong'})]
reads=['/api/studio/media','/api/studio/content','/api/studio/content?format=csv']
for path in reads:req(path,expected=401)
for path,method,data in mutations:req(path,method,data,expected=401)
# Client-supplied identity headers must not grant privileges at the local dispatcher.
req('/api/studio/media',expected=401,headers={'oai-authenticated-user-id':'local_seedy','oai-authenticated-user-email':'seedy@sites.test'})
req('/api/studio/settings','PUT',{},auth=True,expected=403,headers={'Origin':'https://untrusted.example'})
req('/api/studio/settings','PUT',{},auth=True,expected=403,headers={'Origin':''})
req('/api/studio/settings','PUT',b'{',auth=True,expected=400,headers={'Content-Type':'application/json'})
req('/api/studio/content','POST',[],auth=True,expected=400)
req('/api/studio/placements','PUT',b'{}',auth=True,expected=415,headers={'Content-Type':'text/plain'})
req('/api/studio/settings','PUT',b' '*17000,auth=True,expected=413,headers={'Content-Type':'application/json'})
req('/api/studio/content','POST',b' '*1800001,auth=True,expected=413,headers={'Content-Type':'application/json'})
def state():return json.loads(req('/api/studio/content',auth=True)[0])
def make(changes):
 out=io.StringIO();w=csv.writer(out);w.writerow(['content_id','page','section','field','type','value'])
 for k,v in changes.items():w.writerow([k,'orientation','orientation','orientation','text',v])
 return out.getvalue()
def apply(changes):
 csv_text=make(changes);p=json.loads(req('/api/studio/content','POST',{'action':'preview','csv':csv_text},auth=True)[0]);assert p['canApply'],p
 req('/api/studio/content','POST',{'action':'apply','csv':csv_text,'revision':p['revision']},auth=True)
def restore():req('/api/studio/content','POST',{'action':'restore','revision':state()['revision']},auth=True)
baseline=req('/api/studio/content?format=csv',auth=True)[0]
for changes in [{'__proto__':'bad'},{'home.hero.primary_cta.destination':'javascript:alert(1)'},{'home.hero.headline':''}]:
 text=make(changes);p=json.loads(req('/api/studio/content','POST',{'action':'preview','csv':text},auth=True)[0]);assert not p['canApply']
 req('/api/studio/content','POST',{'action':'apply','csv':text,'revision':p['revision']},auth=True,expected=400)
attack='</script><script>alert("portfolio-security-test")</script><img src=x onerror=alert(1)>'
apply({'home.hero.headline':attack})
try:
 page=req('/')[0].decode();assert '<script>alert("portfolio-security-test")' not in page;assert '&lt;/script&gt;&lt;script&gt;' in page
finally:restore()
png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0ioAAAAASUVORK5CYII=')
for mime,payload in [('image/svg+xml',b'<svg onload="alert(1)"/>'),('image/png',b'<html>bad</html>'),('video/mp4',b'\x00\x00\x00\x10ftypevil\x00\x00\x00\x00')]:
 req('/api/studio/media','POST',payload,auth=True,expected=415,headers={'Content-Type':mime,'X-Filename':'bad-file'})
ids=[];slot='project.kryptek_identity.opening.hero';old=next((p['media_id'] for p in json.loads(req('/api/studio/media',auth=True)[0])['placements'] if p['slot']==slot),None)
try:
 for name in ['private-security-fixture.png','replacement-security-fixture.png']:
  result=req('/api/studio/media','POST',png,auth=True,expected=201,headers={'Content-Type':'image/png','X-Filename':name})[0];ids.append(json.loads(result)['id'])
 first,second=ids
 req('/api/media/'+first,expected=404);req('/api/media/'+first,auth=True)
 req('/api/studio/placements','PUT',{'slot':slot,'mediaId':first},auth=True)
 assert req('/api/media/'+first)[0]==png
 req('/api/media/'+first,'HEAD');assert req('/api/media/'+first,expected=206,headers={'Range':'bytes=0-7'})[0]==png[:8]
 page=req('/')[0];assert b'object_key' not in page and b'private-security-fixture.png' not in page
 apply({'project.kryptek_identity.settings.published':'false','project.kryptek_identity.opening.title':'PRIVATE DRAFT SECURITY SENTINEL'})
 try:
  req('/work/kryptek-identity-system',expected=404)
  req('/api/media/'+first,expected=404);req('/api/media/'+first,'HEAD',expected=404);req('/api/media/'+first,auth=True)
  for path in ['/','/work']:assert b'PRIVATE DRAFT SECURITY SENTINEL' not in req(path)[0] and first.encode() not in req(path)[0]
  # Only the emulator fixture changes: signed-in local Seedy now is not the owner.
  with sqlite3.connect(local_db) as c:c.execute("UPDATE studio_owner SET user_id='local_security_other' WHERE id=1")
  try:
   restricted=req('/studio',auth=True)[0];assert b'This studio belongs to another account' in restricted
   assert b'PRIVATE DRAFT SECURITY SENTINEL' not in restricted and b'project.kryptek_identity.opening.hero' not in restricted
   for path in reads:req(path,auth=True,expected=403)
   for path,method,data in mutations:req(path,method,data,auth=True,expected=403)
   for path in ['/studio/content','/studio/map']:assert b'This studio belongs to another account' in req(path,auth=True)[0]
  finally:
   with sqlite3.connect(local_db) as c:c.execute('UPDATE studio_owner SET user_id=? WHERE id=1',(owner_id,))
 finally:restore()
 req('/api/media/'+first)
 req('/api/studio/placements','PUT',{'slot':slot,'mediaId':second},auth=True)
 req('/api/media/'+first,expected=404);req('/api/media/'+second)
 library=json.loads(req('/api/studio/media',auth=True)[0]);assert all(mid in [m['id'] for m in library['media']] for mid in ids)
 req('/api/studio/media','PATCH',{'id':second,'alt':'Safe description'},auth=True)
finally:
 req('/api/studio/placements','PUT',{'slot':slot,'mediaId':old},auth=True)
 for mid in ids:req('/api/studio/media','DELETE',{'id':mid},auth=True);req('/api/media/'+mid,expected=404)
assert req('/api/studio/content?format=csv',auth=True)[0]==baseline
print('PASS: anonymous public pages/media; all admin routes and direct mutations denied; forged headers denied locally; signed-in non-owner denied without private RSC data; owner CSV preview/apply/restore and media upload/swap/delete; hidden-project assets private; bounded JSON; XSS escaped; malformed/unsupported uploads denied. Local fixtures cleaned up.')
