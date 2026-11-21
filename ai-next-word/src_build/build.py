import json
W = json.load(open('../audio/words.json'))
t = {i: w['s'] for i, w in enumerate(W)}
tpl = open('template.html').read().replace('__WT__', json.dumps(t))
open('../hf/index.html', 'w').write(tpl)
print('built', len(tpl))
