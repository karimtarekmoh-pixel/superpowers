import sys, time
from gpt2lib import *
prompt = "The sun rises in the east and sets in the"
print(f"{DIM}$ python3 gpt2_next_word.py{R}\n"); time.sleep(.8)
print(f"{DIM}model: GPT-2 (small open model, 2019) on this computer{R}\n"); time.sleep(1.0)
print(f"{WH}{B}prompt:{R} ", end='', flush=True)
for ch in prompt: print(f"{WH}{ch}{R}", end='', flush=True); time.sleep(.035)
print("\n"); time.sleep(.7)
print(f"{DIM}most likely next words:{R}\n"); time.sleep(.5)
p = probs(tok.encode(prompt).ids); top = np.argsort(-p)[:5]
for r, i in enumerate(top):
    w = tok.decode([int(i)]).strip(); pc = p[i] * 100; n = max(1, int(round(pc / 65.5 * 30)))
    col = CORAL if r == 0 else BLUE
    print(f"  {col}{B}{w:<8}{R} {col}{'█'*n}{R} {WH}{pc:4.1f}%{R}", flush=True); time.sleep(.45)
print(); time.sleep(1.2)
print(f"{CORAL}{B}→ it picks the most likely one: west{R}", flush=True); time.sleep(2.2)
