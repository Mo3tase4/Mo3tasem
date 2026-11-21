"""صوت الفيديو التعريفي لمركز أليف: موسيقى دافية + مؤثرات على cues الريل.

كل شي مولّد بالكود (بدون حقوق نشر).
الاستخدام: python3 sound.py silent.cues.json out.wav DURATION
"""
import json
import sys
import wave

import numpy as np

SR = 44100
cues = json.load(open(sys.argv[1]))
TOTAL = float(sys.argv[3])
rng = np.random.default_rng(7)

SCRIPT = [
    "قطيعك محمي من هدول الخمسة؟", "أولاً، المايكوبلازما", "وتطعيمها جاهز عنا", "ثانياً، الباستوريلا", "وتطعيمها جاهز عنا",
    "ثالثاً، التسمم الغذائي", "وتطعيمه جاهز عنا", "رابعاً، التسمم المعوي", "وتطعيمه جاهز عنا", "وخامساً، الكلاميديا",
    "وتطعيمها جاهز عنا", "وكل هالتطعيمات متوفرة بمركز أليف", "اسألنا عن الجدول المناسب لقطيعك", "مركز أليف، رعاية متكاملة لحياة صحية",
]
# نفس حساب R.timing بدون صوت: 2.5 كلمة/ثانية، الكلمة الطويلة أبطأ، فاصل 0.35 بين السطور
T, t = [], .15
for line in SCRIPT:
    T.append(t)
    for w in line.split():
        t += 1 / 2.5 * (1.25 if len(w) > 6 else 1)
    t += .35


def tt(d):
    return np.arange(int(SR * d)) / SR


def env(n, a, r):
    x = np.arange(n) / SR
    return np.minimum(x / a, 1) * np.exp(-x / r)


def tone(f, d, v, harm=((1, 1), (2, .3), (3, .1)), rel=.45):
    x = tt(d)
    s = sum(a * np.sin(2 * np.pi * f * h * x) for h, a in harm)
    return s * env(len(x), .006, d * rel) * v


def noise_sweep(d, k0, k1, v):
    n = rng.normal(0, 1, int(SR * d)); k = np.linspace(k0, k1, len(n))
    y = np.empty_like(n); acc = 0.0
    for i, s in enumerate(n):
        acc += k[i] * (s - acc); y[i] = acc
    return y * np.sin(np.pi * np.arange(len(n)) / len(n)) ** 2 * v


def pop(f=760):
    x = tt(.12); fr = f * (1 + .7 * np.exp(-x * 55))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(len(x), .001, .035) * .4


def land():
    x = tt(.25); f = 140 * np.exp(-x * 12) + 55
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), .002, .06) * .7


def tick():
    s = tone(2400, .08, .08)
    n = int(SR * .025)
    s[:n] += rng.normal(0, 1, n) * env(n, .0005, .004) * .35
    return s


def chime(notes, gap=.08, v=.2):
    out = np.zeros(int(SR * (gap * len(notes) + 1.3)))
    for i, f in enumerate(notes):
        s = tone(f, 1.2, v); o = int(SR * gap * i); out[o:o + len(s)] += s
    return out


def ring():
    out = np.zeros(int(SR * 1.6))
    for i in range(2):
        x = tt(.4)
        s = (np.sin(2 * np.pi * 880 * x) + np.sin(2 * np.pi * 1100 * x)) * .12 * (np.sin(2 * np.pi * 20 * x) > 0)
        o = int(SR * .6 * i); out[o:o + len(s)] += s * np.minimum(1, (len(x) - np.arange(len(x))) / 800)
    return out


out = np.zeros(int(SR * (TOTAL + 2)))


def put(at, s, g=1.0):
    o = int(SR * max(at, 0)); k = min(len(s), len(out) - o)
    if k > 0:
        out[o:o + k] += s[:k] * g


# موسيقى دافية: C G Am F، 100 BPM، باس + أربيجيو. بتهدى بمشهد الليل وبترجع بالختام
beat = 60 / 100
prog = [(130.8, (261.6, 329.6, 392.0)), (98.0, (196.0, 246.9, 293.7)),
        (110.0, (220.0, 261.6, 329.6)), (87.3, (174.6, 220.0, 261.6))]
night0, night1 = 99, 99
b = 0
while b * beat < TOTAL - .3:
    at = b * beat; root, ch = prog[(b // 4) % 4]
    dim = .45 if night0 <= at < night1 else 1.0
    if b % 4 == 0:
        put(at, tone(root, 2.6, .24), dim)
    put(at, tone(ch[b % 3] * 2, .8, .085), dim)
    if b % 2 == 1:
        put(at + beat / 2, tone(ch[(b + 1) % 3] * 4, .4, .03), dim)
    b += 1

# مؤثرات من cues الريل
for c in cues:
    k, at = c["kind"], c["t"]
    if k == "pop":
        put(at, pop(700 + rng.integers(0, 260)), .9)
    elif k == "land":
        put(at, land(), .8)
    elif k == "tick":
        put(at, tick(), .7)
    elif k == "whoosh":
        put(at, noise_sweep(.9, .02, .3, .6), .9)
    elif k == "notify":
        put(at, chime((1318.5, 1568.0)), .9)
    elif k == "germ":
        put(at, np.tanh(2 * np.sin(2 * np.pi * np.cumsum(95 * np.exp(-tt(.9) * 2.5) + 42) / SR) * env(int(SR * .9), .004, .35)) * .6, .9)
    elif k == "shield":
        put(at, chime((1046.5, 1318.5, 1568.0), .07, .22), .9)
    elif k == "ring":
        put(at, ring(), .9)

# ووش على القطعات بين المشاهد
for i in (3, 5, 7, 9, 11, 12):
    put(T[i] - .25, noise_sweep(.4, .03, .25, .5), .8)
# ختام
put(T[13] + .9, chime((784, 1046.5, 1318.5, 1568.0), .09, .24), 1)

out = out[:int(SR * TOTAL)]
fade = np.minimum((len(out) - np.arange(len(out))) / (SR * 1.5), 1)
out = np.tanh(1.4 * out * fade); out = out / np.abs(out).max() * .7
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(np.repeat(pcm[:, None], 2, 1).tobytes())
print("lines", [round(v, 2) for v in T])
