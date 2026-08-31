"""Local preview integration tests; preserve existing content and placements."""
import urllib.request,urllib.error,http.cookiejar,json,csv,io
origin='http://localhost:3000'
owner=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def req(path,method='GET',data=None,expected=200,auth=True,origin_header=True):
 headers={}
 if data is not None:headers['Content-Type']='application/json';data=json.dumps(data).encode()
 if method!='GET' and origin_header:headers['Origin']=origin
 try:r=(owner if auth else urllib.request.build_opener()).open(urllib.request.Request(origin+path,data=data,headers=headers,method=method));status=r.status;raw=r.read()
 except urllib.error.HTTPError as e:status=e.code;raw=e.read()
 assert status==expected,(path,status,expected,raw[:350])
 return raw
req('/studio')
def state():return json.loads(req('/api/studio/content'))
def preview(text):return json.loads(req('/api/studio/content','POST',{'action':'preview','csv':text}))
def make(changes):
 out=io.StringIO();w=csv.writer(out);w.writerow(['content_id','page','section','field','type','value'])
 for key,value in changes.items():w.writerow([key,'Ignored orientation','Ignored','Ignored','Ignored',value])
 return out.getvalue()
def apply(changes):
 text=make(changes);p=preview(text);assert p['canApply'],p;req('/api/studio/content','POST',{'action':'apply','csv':text,'revision':p['revision']});return p
initial=state();baseline=req('/api/studio/content?format=csv');initial_values={e['id']:e['value'] for e in initial['entries'] if e['editable'] and not e.get('slot')}
assert len(initial_values)>0
assert len({e['id'] for e in initial['entries']})==len(initial['entries'])
assert len(preview(baseline.decode('utf-8-sig'))['changes'])==0
req('/api/studio/content',auth=False,expected=401)
req('/api/studio/content','POST',{'action':'preview','csv':make({})},origin_header=False,expected=403)
for bad in [make({'unknown.id':'bad'}),make({'home.hero.headline':''}),make({'project.kryptek_identity.settings.published':'maybe'}),'content_id,page,section,field,type,value\nx,y,z,a,b,"unterminated']:
 p=preview(bad);assert not p['canApply'];req('/api/studio/content','POST',{'action':'apply','csv':bad,'revision':p['revision']},expected=400)
assert req('/api/studio/content?format=csv')==baseline
key='home.hero.headline'
try:
 p=apply({key:'Temporary integration headline'});assert len(p['changes'])==1
 after=state();changed=[e['id'] for e in after['entries'] if e['id'] in initial_values and e['value']!=initial_values[e['id']]];assert changed==[key],changed
 assert b'Temporary integration headline' in req('/')
 assert b'Temporary integration headline' in req('/api/studio/content?format=csv')
 assert len(preview(req('/api/studio/content?format=csv').decode('utf-8-sig'))['changes'])==0
 # A second tab must not apply a stale preview.
 req('/api/studio/content','POST',{'action':'apply','csv':make({key:'Stale overwrite'}),'revision':p['revision']},expected=409)
finally:req('/api/studio/content','POST',{'action':'restore','revision':state()['revision']})
assert req('/api/studio/content?format=csv')==baseline
# Shared project copy, publication, related links, filtering, and empty optional values.
try:
 apply({'project.kryptek_identity.settings.published':'false','project.truckvault_configurator.settings.related_project_ids':'kryptek_ecommerce','project.truckvault_configurator.opening.summary':''})
 req('/work/kryptek-identity-system',expected=404)
 assert b'href="/work/kryptek-identity-system"' not in req('/')
 assert b'href="/work/kryptek-identity-system"' not in req('/work')
 page=req('/work/truckvault-3d-configurator');assert b'\xe2\x80\x94 Related' in page
finally:req('/api/studio/content','POST',{'action':'restore','revision':state()['revision']})
try:
 apply({'global.categories.art_direction.label':'Creative & Art Direction'})
 page=req('/work?intent=Creative%20%26%20Art%20Direction');assert b'2024 Big Game Guide' in page
 assert b'Kryptek Merchandise' in page
 assert b'Creative &amp; Art Direction' in page
finally:req('/api/studio/content','POST',{'action':'restore','revision':state()['revision']})
assert req('/api/studio/content?format=csv')==baseline
for route in ['/','/work','/about','/contact','/studio','/studio/content','/studio/map']:
 assert b'<html' in req(route)
assert any(e['id']=='home.hero.image' and e['location']=='Homepage > Hero > Featured image / video' for e in state()['entries'])
assert any(e['status']=='PLACEHOLDER' for e in state()['entries'])
assert any(e['id']=='contact.direct.email' and 'inactive' in e['note'] for e in state()['entries'])
print('PASS: CSV export/current values, identity matching, validation, one-field apply, only-field update, re-export, zero-change round trip, stale-preview conflict, restore, owner/origin controls, unpublished/related projects, renamed category filters, and Content Map statuses.')
