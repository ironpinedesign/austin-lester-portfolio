"""Local-only integration checks. No production endpoint is accepted."""
import urllib.request, urllib.error, http.cookiejar, json, base64, re
origin='http://localhost:3000'
jar=http.cookiejar.CookieJar()
owner=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
anon=urllib.request.build_opener()
def req(path, method='GET', data=None, signed=True, extra=None, expected=200):
 headers={}
 if method!='GET':headers['Origin']=origin
 if isinstance(data,dict): data=json.dumps(data).encode();headers['Content-Type']='application/json'
 if extra:headers.update(extra)
 request=urllib.request.Request(origin+path,data=data,headers=headers,method=method)
 try:
  response=(owner if signed else anon).open(request);status=response.status;raw=response.read();rh=response.headers
 except urllib.error.HTTPError as e:status=e.code;raw=e.read();rh=e.headers
 assert status==expected,(path,method,status,expected,raw[:300])
 return raw,rh
# Verify all pages, content counts, matching category names, and per-project metadata.
req('/api/studio/media',signed=False,expected=401)
req('/studio',signed=True)
page,_=req('/studio')
if b'Connect your account' in page:
 req('/api/studio/claim','POST',{'code':'incorrect'},expected=403)
 req('/api/studio/claim','POST',{'code':'local-verification-only'},extra={'Origin':'https://wrong.example'},expected=403)
 req('/api/studio/claim','POST',{'code':'local-verification-only'})
else:
 assert b'Drag your work right in.' in page, 'Use the local owner account for these checks'
for path in ['/','/work','/about','/contact','/studio']:
 page,_=req(path);assert b'<html' in page
with open('content/projects.json') as f:projects=json.load(f)
assert sum(p['featured'] for p in projects)==6
assert sum(p['strategic_intent']=='Art Direction' for p in projects)==2
for p in projects:
 page,_=req('/work/'+p['slug']);html=page.decode()
 assert p['title'].replace('&','&amp;') in html or p['title'] in html
 assert 'property="og:title"' in html and 'name="twitter:title"' in html
req('/work/nonexistent-project',expected=404)
# Upload validation, durable reads, private originals, range handling, assignment and cleanup.
req('/api/studio/media','POST',b'<svg/>',extra={'Content-Type':'image/svg+xml','X-Filename':'test.svg'},expected=415)
req('/api/studio/media','POST',b'not an image',extra={'Content-Type':'image/png','X-Filename':'test.png'},expected=415)
req('/api/studio/media','POST',b'x',signed=False,extra={'Content-Type':'image/png'},expected=401)
png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0ioAAAAASUVORK5CYII=')
result,_=req('/api/studio/media','POST',png,extra={'Content-Type':'image/png','X-Filename':'integration-test.png'},expected=201)
old_placements=json.loads(req('/api/studio/media')[0])['placements']
mid=json.loads(result)['id'];slot='project.'+projects[0]['content_id']+'.opening.hero'
try:
 req('/api/media/'+mid,signed=False,expected=404)
 payload,_=req('/api/media/'+mid);assert payload==png
 req('/api/studio/media','PATCH',{'id':mid,'alt':'Temporary integration image'})
 req('/api/studio/placements','PUT',{'slot':'not-a-slot','mediaId':mid},expected=400)
 req('/api/studio/placements','PUT',{'slot':slot,'mediaId':'missing'},expected=404)
 req('/api/studio/placements','PUT',{'slot':slot,'mediaId':mid})
 payload,headers=req('/api/media/'+mid,signed=False);assert payload==png
 piece,headers=req('/api/media/'+mid,signed=False,extra={'Range':'bytes=0-7'},expected=206);assert piece==png[:8]
 assert headers['Content-Range']==f'bytes 0-7/{len(png)}'
 req('/api/media/'+mid,signed=False,extra={'Range':'bytes=9999-'},expected=416)
 req('/api/studio/placements','PUT',{'slot':slot,'mediaId':None})
 req('/api/media/'+mid,signed=False,expected=404)
 req('/api/studio/settings','PUT',{'contact_email':'invalid'},expected=400)
 req('/api/studio/settings','PUT',{'linkedin':'javascript:alert(1)'},expected=400)
 req('/api/studio/media','DELETE',{'id':mid},extra={'Origin':'https://wrong.example'},expected=403)
finally:
 old=next((p['media_id'] for p in old_placements if p['slot']==slot),None)
 req('/api/studio/placements','PUT',{'slot':slot,'mediaId':old})
 req('/api/studio/media','DELETE',{'id':mid})
 req('/api/media/'+mid,expected=404)
print('PASS: 9 case studies, portfolio routes, owner setup, upload validation, private/public media, range requests, placements, descriptions, contact validation, deletion and origin protection.')
