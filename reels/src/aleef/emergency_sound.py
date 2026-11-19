"""شريط صوت ريل الطوارئ: موسيقى بيانو هادية + مؤثرات على أحداث المشاهد.

كل شي مولّد بالكود (بدون حقوق نشر). التوقيتات لازم تطابق SCENES بـ Emergency.tsx.
الاستخدام: python3 emergency_sound.py out.wav
"""
import sys
import wave

import numpy as np

SR = 44100
TOTAL = 25.6
rng = np.random.default_rng(3)
SC = {"hook": 0.0, "list1": 3.2, "list2": 9.4, "slogan": 15.6, "cta": 18.6, "sting": 23.0}


def t_(d):
    return np.arange(int(SR * d)) / SR


def env(n, a, r):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / r)


def lowpass(x, k):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += k * (v - acc); y[i] = acc
    return y


def note(f, d, v):
    t = t_(d)
    s = sum(a * np.sin(2 * np.pi * f * h * t) for h, a in ((1, 1), (2, .35), (3, .12)))
    return s * env(len(t), .005, d * .45) * v


def boom(d=1.2):
    t = t_(d); f = 85 * np.exp(-t * 3) + 40
    return np.tanh(2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .002, .45)) * .8


def whoosh(d=.4):
    t = t_(d); n = rng.normal(0, 1, len(t)); k = .02 + .25 * t / d
    y = np.empty_like(n); acc = 0.0
    for i, v in enumerate(n):
        acc += k[i] * (v - acc); y[i] = acc
    return y * np.sin(np.pi * t / d) ** 2 * .5


def pop(f=700):
    t = t_(.12); fr = f * (1 + .6 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(len(t), .001, .035) * .45


def chime(notes=(1046.5, 1318.5, 1568.0), gap=.09):
    out = np.zeros(int(SR * (gap * len(notes) + 1.2)))
    for i, f in enumerate(notes):
        s = note(f, 1.1, .22); o = int(SR * gap * i); out[o:o + len(s)] += s
    return out


def alarm(n=2, f=880):
    parts = []
    for i in range(n):
        t = t_(.13)
        parts += [np.sign(np.sin(2 * np.pi * (f if i % 2 == 0 else f * .8) * t)) * .18 * env(len(t), .004, .2), np.zeros(int(SR * .07))]
    return np.concatenate(parts)


def ticks(n, gap=.25):
    out = np.zeros(int(SR * (gap * n + .1)))
    for i in range(n):
        s = rng.normal(0, 1, int(SR * .03)) * env(int(SR * .03), .0005, .005) * (.5 if i % 2 else .3)
        o = int(SR * gap * i); out[o:o + len(s)] += s
    return out


out = np.zeros(int(SR * (TOTAL + 2)))


def put(at, s, g=1.0):
    o = int(SR * at); k = min(len(s), len(out) - o)
    if k > 0:
        out[o:o + k] += s[:k] * g


# موسيقى: Am F C G، نبض هادي 96 BPM، بتوطى تحت المشاهد وبتفتح بالختام
beat = 60 / 96
prog = [(110, (220, 261.6, 329.6)), (87.3, (174.6, 220, 261.6)), (130.8, (261.6, 329.6, 392)), (98, (196, 246.9, 293.7))]
b = 0
while b * beat < TOTAL - .5:
    at = b * beat; root, ch = prog[(b // 4) % 4]
    if b % 4 == 0:
        put(at, note(root, 2.4, .22))
    put(at, note(ch[b % 3] * 2, .9, .08))
    b += 1

# مؤثرات
put(0.0, boom(), .9); put(0.05, alarm(), .6)
for k in ("list1", "list2", "slogan", "cta", "sting"):
    put(SC[k] - .18, whoosh(), .7)
for k, base in (("list1", 1), ("list2", 4)):
    for i in range(3):
        put(SC[k] + .55 + i * 1.15, pop(640 + 70 * i), .8)
put(SC["slogan"] + .4, boom(.9), .5); put(SC["slogan"] + .6, ticks(8, .25), .9)
put(SC["cta"] + 1.6, pop(1100), .9); put(SC["cta"] + 1.62, chime((1318.5, 1568.0)), .7)
put(SC["sting"] + .05, chime((784, 1046.5, 1318.5, 1568.0)), .9)

out = out[:int(SR * TOTAL)]
fade = np.minimum((len(out) - np.arange(len(out))) / (SR * 1.2), 1)
out = np.tanh(1.5 * out * fade); out = out / np.abs(out).max() * .7
x = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.repeat(x[:, None], 2, 1).tobytes())
