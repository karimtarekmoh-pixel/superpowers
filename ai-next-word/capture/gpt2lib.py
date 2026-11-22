import numpy as np, onnxruntime as ort
from tokenizers import Tokenizer
tok = Tokenizer.from_file('/root/gpt2/tokenizer.json')
sess = ort.InferenceSession('/root/gpt2/onnx/decoder_model_quantized.onnx')
def probs(ids):
    l = sess.run(None, {'input_ids': np.array([ids], dtype=np.int64), 'attention_mask': np.ones((1, len(ids)), dtype=np.int64)})[0][0, -1]
    e = np.exp(l - l.max()); return e / e.sum()
CORAL = '\033[38;5;203m'; DIM = '\033[38;5;245m'; WH = '\033[97m'; B = '\033[1m'; R = '\033[0m'; BLUE = '\033[38;5;111m'
