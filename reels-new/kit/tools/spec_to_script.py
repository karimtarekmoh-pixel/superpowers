import json
S=json.load(open("src/spec.json"))
json.dump({"handle":"@axiomallai","accentWords":S.get("accentWords",[]),"sections":[{"id":s["id"],"text":s["text"],"chunks":[99]} for s in S["sections"]]},open("src/script.json","w"),indent=1)
print("script.json:", len(S["sections"]), "sections")
