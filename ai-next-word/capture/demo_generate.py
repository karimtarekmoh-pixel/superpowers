import sys, time
from gpt2lib import *
prompt = "The capital of Australia is the city of"
print(f"{DIM}$ python3 gpt2_write.py{R}\n"); time.sleep(.8)
print(f"{DIM}model: GPT-2 (small open model, 2019) on this computer{R}\n"); time.sleep(.9)
print(f"{WH}{B}question:{R} {WH}{prompt} ...{R}\n"); time.sleep(.9)
print(f"{DIM}the model writes one small piece at a time:{R}\n"); time.sleep(.6)
ids = tok.encode(prompt).ids; print(f"  {WH}{prompt}{R}", end='', flush=True)
out = ''
for k in range(5):
    p = probs(ids); i = int(np.argmax(p)); ids.append(i); w = tok.decode([i]); out += w
    print(f"{CORAL}{B}{w}{R}", end='', flush=True); time.sleep(.42 if k else .9)
print("\n"); time.sleep(1.0)
print(f"{DIM}# its answer sounds sure. is it right?{R}", flush=True); time.sleep(1.1)
print(f"{WH}# the capital of Australia is Canberra.{R}", flush=True); time.sleep(2.0)
