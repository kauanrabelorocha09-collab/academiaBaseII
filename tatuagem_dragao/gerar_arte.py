#!/usr/bin/env python3
"""Arte planificada (360 graus) - Irezumi full sleeve: Ryu preto e vermelho.
Saida: arte_planificada.png (pele = branco). Coordenadas: x = angulo ao redor do braco,
y = ombro (0) -> punho (H)."""
import math, random, os, sys
import numpy as np
from PIL import Image, ImageDraw

random.seed(11); np.random.seed(11)
W, H = 1400, 3000
S = int(os.environ.get("SS", "2"))
BLACK = (8, 8, 8); RED = (181, 18, 27); SKIN = (240, 236, 230)
OUT = os.path.dirname(os.path.abspath(__file__))

img = Image.new("RGB", (W * S, H * S), BLACK)
D = ImageDraw.Draw(img)
OX = 0.0


def G(v): return (v, v, v)
def T(pts): return [((x + OX) * S, y * S) for x, y in np.asarray(pts, float)]
def poly(pts, fill, outline=None, ow=1):
    D.polygon(T(pts), fill=fill)
    if outline is not None: line(list(pts) + [pts[0]], ow, outline)
def line(pts, w, fill):
    D.line(T(pts), fill=fill, width=max(1, int(round(w * S))), joint="curve")
def disc(c, r, fill):
    x, y = c; D.ellipse([(x + OX - r) * S, (y - r) * S, (x + OX + r) * S, (y + r) * S], fill=fill)
def lerpc(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def catmull(pts, closed=False, n=10):
    p = np.asarray(pts, float)
    p = np.vstack([p[-1], p, p[0], p[1]]) if closed else np.vstack([2 * p[0] - p[1], p, 2 * p[-1] - p[-2]])
    out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2 = t * t; t3 = t2 * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    if not closed: out.append(p[-2])
    return np.array(out)


def resample(c, step):
    d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(c, axis=0), axis=1))]
    s = np.arange(0, d[-1], step)
    return np.stack([np.interp(s, d, c[:, 0]), np.interp(s, d, c[:, 1])], 1)


def frame(c):
    d = np.gradient(c, axis=0); d /= (np.linalg.norm(d, axis=1, keepdims=True) + 1e-9)
    return d, np.stack([-d[:, 1], d[:, 0]], 1)


def ribbon(c, w):
    t, n = frame(c); w = np.broadcast_to(np.asarray(w, float), (len(c),))
    return np.vstack([c + n * (w[:, None] / 2), (c - n * (w[:, None] / 2))[::-1]])


def lens(n, peak, pw=0.8, floor=0.6):
    t = np.linspace(0, 1, n); return np.maximum(floor, peak * np.sin(np.pi * t) ** pw)
def lin(n, a, b): return np.linspace(a, b, n)


def grad_ribbon(c, w, c0, c1):
    t, nn = frame(c); w = np.broadcast_to(np.asarray(w, float), (len(c),))
    l = c + nn * (w[:, None] / 2); r = c - nn * (w[:, None] / 2)
    for i in range(len(c) - 1):
        poly([l[i], l[i + 1], r[i + 1], r[i]], lerpc(c0, c1, i / (len(c) - 1)))


# ---------------------------------------------------------------- ONDAS (NAMI)
def wave(cx, cy, R, flip=1):
    n = 150; t = np.linspace(0, 1, n); kk = max(1.0, R / 125)

    def sp(k, r1=0.33):
        ang = math.pi + (-math.pi * 0.95 - math.pi) * t
        r = R * k * (1 - (1 - r1) * t ** 1.15)
        return np.stack([cx + flip * r * np.cos(ang), cy - r * np.sin(ang)], 1)

    outer = sp(1.0)
    aa = np.linspace(0, 2 * math.pi, 60)
    poly(np.stack([cx + 1.04 * R * np.cos(aa), cy + 1.04 * R * np.sin(aa)], 1), BLACK)
    # sombra cinza difusa ao redor da crista
    for wd, col in ((46 * kk, 20), (32 * kk, 32), (20 * kk, 46)):
        poly(ribbon(outer[: int(n * 0.85)], lens(int(n * 0.85), wd, 0.6)), G(col))
    poly(ribbon(outer, lens(n, 11 * kk, 0.7)), SKIN)
    for k, wd in ((0.78, 5.5 * kk), (0.56, 3.6 * kk), (0.36, 3 * kk)):
        poly(ribbon(sp(k, 0.4), lens(n, wd, 0.8)), SKIN)
    for k in (0.9, 0.71, 0.53):
        line(sp(k, 0.4), 2.2 * kk, G(95))
    # dedos de espuma
    for j in np.linspace(int(n * 0.22), int(n * 0.6), 5).astype(int):
        p = outer[j]; o = (p - np.array([cx, cy])); o /= np.linalg.norm(o) + 1e-9
        tg = outer[min(j + 2, n - 1)] - outer[j - 1]; tg /= np.linalg.norm(tg) + 1e-9
        dr = o * 0.7 + tg * 0.7; dr /= np.linalg.norm(dr)
        pr = np.array([-dr[1], dr[0]]); L = R * (0.24 + 0.12 * random.random())
        c = catmull([p - o * 3, p + dr * L * 0.5 + pr * L * 0.10, p + dr * L + pr * L * 0.06], n=8)
        poly(ribbon(c, lin(len(c), 10 * kk, 3)), SKIN)
        disc(c[-1], 6 * kk, SKIN)
        if random.random() < 0.6: disc(c[-1] + dr * 22, 3.5 + 2 * random.random(), SKIN)
    # ondulacoes de base
    for k in ():
        c = np.array([[cx - flip * R * 1.15 + flip * x, cy + R * k + 7 * math.sin(x / 38)] for x in np.linspace(0, R * 1.2, 24)])
        poly(ribbon(c, lens(24, 4.5)), SKIN)


def current(x0, y0, L, amp, wl, w=3.5, ph=0):
    xs = np.linspace(0, L, max(8, int(L / 12)))
    c = np.stack([x0 + xs, y0 + amp * np.sin(xs / wl * 2 * math.pi + ph)], 1)
    poly(ribbon(c, lens(len(c), w, 0.9, 0.5)), SKIN)


def kaze(x0, y0, L, thick, amp=18, wl=520, gdir=1, curl=True, c0=None):
    xs = np.linspace(0, L, 60)
    c = c0 if c0 is not None else np.stack([x0 + xs, y0 + amp * np.sin(xs / wl * 2 * math.pi)], 1)
    if curl:  # ponta enrolada
        e = c[-1]; a = np.linspace(0, 1.55 * math.pi, 28); r = thick * (1.0 - 0.7 * a / a[-1]) * 1.6
        cu = np.stack([e[0] + thick * 0.0 + r * np.sin(a) - 0, e[1] - thick * 1.6 + r * np.cos(a)], 1)
        c = np.vstack([c, cu[1:]])
    wp = np.r_[lens(60, thick, 0.55, 3), lin(len(c) - 60, thick * 0.35, 3)] if curl else lens(len(c), thick, 0.55, 3)
    poly(ribbon(c, wp + 8), SKIN)
    a, b = (BLACK, G(46)) if gdir > 0 else (G(46), BLACK)
    grad_ribbon(c, wp, a, b)
    for off in (-0.28, 0.0, 0.28):
        t_, n_ = frame(c); cc = c + n_ * (wp[:, None] * off)
        line(cc[6:-8], 1.6, G(110))


# ---------------------------------------------------------------- CABECA DO DRAGAO
HC = (735, 440); HS = 0.96; HA = -0.20
def hx(p):
    p = np.asarray(p, float); c, s = math.cos(HA), math.sin(HA)
    x = p[..., 0] * HS; y = p[..., 1] * HS
    return np.stack([x * c - y * s + HC[0], x * s + y * c + HC[1]], -1)


def hpoly(pts, fill, closed=True, n=10, outline=None, ow=2):
    c = hx(catmull(pts, closed=closed, n=n)); poly(c, fill)
    if outline: line(list(c) + [c[0]], ow, outline)
    return c


def hribbon(pts, w0, w1, fill, halo=0, haloc=SKIN, n=12):
    c = hx(catmull(pts, n=n)); wd = lin(len(c), w0 * HS, w1 * HS)
    if halo: poly(ribbon(c, wd + halo), haloc)
    poly(ribbon(c, wd), fill); return c


def head():
    # juba / chamas atras da cabeca
    for i, (y0, col) in enumerate([(-120, RED), (-60, BLACK), (0, RED), (60, BLACK), (115, RED), (-175, BLACK)]):
        pts = [(-220, y0), (-330, y0 - 25 + 15 * (i % 2)), (-450, y0 + 35), (-580, y0 - 10 + 20 * i % 3), (-690, y0 + 60)]
        hribbon(pts, 82, 3, col, halo=11)
    # chifres
    for pts, w in (([(-110, -170), (-190, -255), (-300, -300), (-420, -285), (-520, -235)], 88),
                   ([(-40, -178), (-80, -270), (-150, -330), (-240, -352)], 66)):
        c = hribbon(pts, w, 3, G(210), halo=10, haloc=SKIN)
        t, n = frame(c)
        for i in range(6, len(c) - 4, 7):
            p = c[i]; ww = lin(len(c), w * HS, 3)[i] / 2
            line([p - n[i] * ww, p + n[i] * ww], 2.2, BLACK)
        line(c[2:-3] + frame(c)[1][2:-3] * 6, 3, BLACK)
    # espinhos de bochecha
    for k, (a, b) in enumerate([((-150, 60), (-300, 130)), ((-190, 20), (-340, 40)), ((-120, 95), (-250, 215))]):
        hribbon([a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 18), b], 46, 2, RED, halo=8)
    # whiskers (bigodes longos) - atras da cabeca
    for pts, w in (([(385, -60), (470, -20), (515, 60), (470, 150), (370, 235), (220, 300), (50, 330), (-130, 300), (-330, 250), (-520, 290)], 24),
                   ([(350, 100), (430, 170), (440, 260), (380, 340), (260, 400), (90, 430), (-100, 410)], 17)):
        hribbon(pts, w, 2, BLACK, halo=8, n=14)
    # barba do queixo
    hribbon([(160, 150), (130, 250), (50, 330), (-60, 360), (-140, 330)], 30, 3, BLACK, halo=8)

    # crânio / focinho
    U = [(-285, -60), (-235, -150), (-125, -195), (-5, -178), (70, -150), (160, -135), (265, -135), (345, -148), (392, -118),
         (408, -72), (390, -38), (342, -22), (300, -10), (200, -14), (100, -10), (20, 0), (-45, 20), (-115, 62), (-195, 74), (-262, 42), (-292, -10)]
    # mandibula inferior
    LJ = [(5, 66), (100, 84), (200, 96), (290, 100), (350, 102), (382, 112), (372, 142), (318, 170), (215, 182), (110, 165), (10, 132), (-70, 98), (-70, 55)]
    # interior da boca
    mouth = [(348, -14), (200, -11), (100, -7), (20, 3), (-42, 22), (-52, 48), (8, 70), (100, 87), (200, 97), (290, 101), (350, 103)]
    hpoly(LJ, SKIN, n=8)           # halo mandibula
    hpoly(U, SKIN, n=8)
    # halo = poligono maior
    def grow(pts, k):
        p = np.asarray(pts, float); c = p.mean(0); return c + (p - c) * k
    hpoly(mouth, RED, n=8)
    # lingua
    hpoly([(70, 70), (160, 58), (255, 64), (335, 80), (250, 90), (150, 90)], BLACK, n=8)
    # corpo da mandibula
    jb = hx(catmull([(5, 70), (100, 88), (200, 99), (290, 103), (350, 105), (382, 114), (372, 142), (318, 170), (215, 182), (110, 165), (10, 132), (-68, 98), (-68, 55)], closed=True, n=8)); line(list(jb) + [jb[0]], 11, SKIN); poly(jb, BLACK)
    hpoly([(-52, 48), (8, 70), (100, 87), (200, 97), (290, 101), (350, 103), (374, 112), (370, 110)], RED, closed=False, n=8) if False else None
    # focinho/cranio preto sobre o halo
    cs = hx(catmull(U, closed=True, n=8)); line(list(cs) + [cs[0]], 11, SKIN); poly(cs, BLACK)
    line(list(cs) + [cs[0]], 1.5, G(20))
    # contorno branco fino pelo labio superior
    lip = hx(catmull([(398, -50), (342, -22), (300, -10), (200, -14), (100, -10), (20, 0), (-45, 20)], n=8)); line(lip, 4, SKIN)
    jl = hx(catmull([(-62, 60), (10, 132), (110, 165), (215, 182), (318, 170), (372, 142), (382, 114)], n=8)); line(jl, 4, SKIN)
    # dentes
    for x, ln, w in ((320, 88, 17), (232, 66, 15), (150, 54, 14), (68, 44, 13)):
        hpoly([(x - w, -12), (x + w, -12), (x + 3, ln)], SKIN, n=2, outline=BLACK, ow=1.5)
    for x, ln, w in ((330, 98, 17), (245, 68, 14), (160, 50, 13)):
        hpoly([(x - w, 100), (x + w, 100), (x - 2, 100 - ln)], SKIN, n=2, outline=BLACK, ow=1.5)
    # sulcos e escamas na testa
    for dy in (14, 30):
        c = hx(catmull([(-215, -95 + dy), (-110, -148 + dy), (20, -135 + dy), (140, -100 + dy), (270, -100 + dy), (350, -105 + dy)], n=8))
        line(c, 2.4, G(190 - dy * 2))
    for gx in np.arange(-190, 120, 34):
        for gy in (-30, 12):
            hr = hx(np.array([gx + (gy % 24), gy]))
            a = np.linspace(-1.2, 1.2, 9)
            line(np.stack([hr[0] + 15 * np.cos(a + HA + math.pi), hr[1] + 15 * np.sin(a + HA + math.pi)], 1), 1.8, G(150))
    # narina
    nr = hx(catmull([(350, -108), (372, -92), (372, -65), (352, -52)], n=6)); line(nr, 4, SKIN)
    hribbon([(338, -140), (385, -112)], 12, 6, SKIN)
    # sobrancelha pesada
    hribbon([(-20, -128), (60, -150), (150, -138), (200, -112)], 8, 40, BLACK, halo=0)
    hribbon([(-30, -135), (60, -165), (170, -150), (215, -118)], 5, 14, SKIN)
    # olho vermelho
    eye = [(10, -76), (55, -112), (115, -108), (158, -80), (112, -58), (50, -56)]
    hpoly(eye, SKIN, n=8); eg = hx(np.array(eye)); c0 = eg.mean(0)
    hpoly([(p[0] * 0.9 + 1, p[1] * 0.9 - 8 * 0.1 + 0) for p in [(10, -76), (55, -112), (115, -108), (158, -80), (112, -58), (50, -56)]], RED, n=8)
    pc = hx(np.array([88, -84])); D.ellipse([(pc[0] + OX - 6) * S, (pc[1] - 15) * S, (pc[0] + OX + 6) * S, (pc[1] + 15) * S], fill=BLACK)
    disc(hx(np.array([72, -100])), 4, SKIN)


# ---------------------------------------------------------------- CORPO DO DRAGAO
def body_path():
    x0, y0 = 640.0, 500.0
    TX, TY = 1.55 * W, 760.0
    s = np.linspace(0, 1, 2500)
    bx = x0 - TX * s; by = y0 + TY * s
    bt = np.array([-TX, TY]) / math.hypot(TX, TY); bn = np.array([-bt[1], bt[0]])
    amp = 95 * np.minimum(1, s / 0.07) * (1 - 0.35 * s)
    und = amp * np.sin(2 * math.pi * 2.6 * s + 0.4)
    P = np.stack([bx + und * bn[0], by + und * bn[1]], 1)
    P = resample(P, 4.0)
    sn = np.linspace(0, 1, len(P))
    hw = 0.5 * (26 + 250 * (1 - sn) ** 0.85 * np.minimum(1, 0.72 + sn / 0.12 * 0.28))
    return P, hw, sn


P, HW, SN = body_path()
TT, NN = frame(P)
NN = np.where(NN[:, 1:2] < 0, -NN, NN)  # normal sempre para baixo (ventre)
TT = np.stack([NN[:, 1], -NN[:, 0]], 1) * -1
TT = np.where(TT[:, 0:1] > 0, -TT, TT)


def visible(i, pad=260):
    x = P[i, 0] + OX
    return -pad < x < W + pad


def body(sc_rng):
    N = len(P)
    # espinhos dorsais vermelhos
    for i in range(10, N - 20, 13):
        if not visible(i): continue
        hw = HW[i]; d = P[i] - NN[i] * hw * 0.88
        h = 22 + 0.31 * hw * 2; b = 22 + 0.1 * hw
        tip = d - NN[i] * h + TT[i] * h * 0.85
        b1 = d - TT[i] * b; b2 = d + TT[i] * b * 0.55
        mid1 = (b1 + tip) / 2 + NN[i] * h * 0.12 - TT[i] * h * 0.08
        mid2 = (b2 + tip) / 2 + TT[i] * h * 0.14 - NN[i] * h * 0.05
        pts = catmull([b1, mid1, tip, mid2, b2], n=5)
        poly(pts, SKIN); 
        inner = catmull([b1 + (d - b1) * 0.15 + NN[i] * 3, mid1 * 0.97 + d * 0.03 + NN[i] * 3, tip - TT[i] * 3 + NN[i] * 3, mid2, b2 + NN[i] * 3], n=5)
        poly(inner, RED)
        line([d - NN[i] * 3, tip - TT[i] * 4], 2, BLACK)
    # halo + corpo
    seg = [i for i in range(N) if visible(i, 330)]
    if not seg: return
    a, b = seg[0], seg[-1] + 1
    c = P[a:b]; poly(ribbon(c, 2 * HW[a:b] + 13), SKIN); poly(ribbon(c, 2 * HW[a:b]), BLACK)
    # sombra cinza (volume) sob o dorso
    line(c - NN[a:b] * HW[a:b, None] * 0.55, 9, G(34))
    # ventre vermelho com placas
    inn = c + NN[a:b] * HW[a:b, None] * 0.34; out = c + NN[a:b] * HW[a:b, None] * 0.96
    poly(np.vstack([inn, out[::-1]]), RED)
    for i in range(a, b, 6):
        p0 = P[i] + NN[i] * HW[i] * 0.34; p1 = P[i] + NN[i] * HW[i] * 0.96
        line([p0, p1], 2.4, G(14))
    line(inn, 3, BLACK)
    # escamas
    ds = 21.0; rows = 9
    for i in range(a - a % 5 + 5, b, 5):
        hw = HW[i]; k = max(0.28, hw / 140.0); r = ds * k * 0.62 + 2.5
        nrow = max(2, int(hw * 1.3 / (ds * k + 3)))
        for j in range(nrow):
            v = -0.9 + (1.22) * (j + 0.5 * ((i // 5) % 2)) / nrow
            if v > 0.3: continue
            q = P[i] + NN[i] * v * hw
            an = np.linspace(-1.25, 1.25, 8)
            pts = np.stack([q[0] + r * (np.cos(an) * TT[i, 0] + np.sin(an) * NN[i, 0]), q[1] + r * (np.cos(an) * TT[i, 1] + np.sin(an) * NN[i, 1])], 1)
            u = sc_rng.random()
            if u < 0.09 + 0.10 * (v > 0): 
                fp = np.vstack([pts, q[None] - TT[i] * r * 0.5]); poly(fp, RED)
            line(pts, 2.2, G(205 if v < -0.35 else 150))
    # brilho dorsal
    line(c - NN[a:b] * HW[a:b, None] * 0.8, 3, G(120))


def leg(i, dirx, lean):
    A = P[i] + NN[i] * HW[i] * 0.55
    pts = [A, A + np.array([dirx * 18, 70]), A + np.array([dirx * 38 + lean * 20, 150]), A + np.array([dirx * 20 + lean * 55, 235])]
    c = catmull(pts, n=12); wd = lin(len(c), 78, 40)
    poly(ribbon(c, wd + 16), SKIN); poly(ribbon(c, wd), BLACK)
    for k in range(4, len(c) - 4, 7):
        t_, n_ = frame(c)
        line([c[k] - n_[k] * wd[k] / 2 * 0.8, c[k] + n_[k] * wd[k] / 2 * 0.8], 2.2, G(180))
    line(c + frame(c)[1] * 12, 6, RED)
    E = c[-1]
    disc(E, 27, SKIN); disc(E, 22, BLACK)
    # garras
    for ang, ln in ((-0.95, 92), (-0.2, 108), (0.65, 92), (1.45, 62)):
        base = E + np.array([math.sin(ang), math.cos(ang)]) * 18
        tip = E + np.array([math.sin(ang + 0.15 * (1 if ang > 0 else -1)), math.cos(ang)]) * ln
        mid = (base + tip) / 2 + np.array([math.cos(ang), -math.sin(ang)]) * 14 * (1 if ang > -0.3 else -1)
        cl = catmull([base, mid, tip], n=8)
        poly(ribbon(cl, lin(len(cl), 24, 1.5)), SKIN)
        poly(ribbon(cl, lin(len(cl), 16, 0.8)), G(205))
        line(cl[: len(cl) // 2], 2, BLACK)


def tail_tuft():
    e = P[-1]; t = TT[-1]
    for i, (ang, ln, col) in enumerate([(-0.55, 150, RED), (0.0, 190, BLACK), (0.55, 150, RED), (-1.0, 110, BLACK), (1.0, 110, BLACK)]):
        d = np.array([t[0] * math.cos(ang) - t[1] * math.sin(ang), t[0] * math.sin(ang) + t[1] * math.cos(ang)])
        c = catmull([e, e + d * ln * 0.5 + np.array([-d[1], d[0]]) * 18, e + d * ln], n=10)
        poly(ribbon(c, lin(len(c), 50, 2) + 9), SKIN); poly(ribbon(c, lin(len(c), 50, 2)), col)


# ---------------------------------------------------------------- COMPOSICAO
def wrap_draw(fn, xmin, xmax):
    global OX
    for n in range(math.floor(xmin / W), math.floor(xmax / W) + 1):
        OX = -n * W; fn()
    OX = 0


PITCH = 620.0; SLOPE = PITCH / W   # duas helices intercaladas -> bandas a cada ~310
def hy(h, u): return -60 + h * PITCH / 2 + SLOPE * u + 26 * math.sin(u / 240 + h * 1.7)
def fscale(y): return 1.0 if y < 1300 else 1.28


def puff(x, y, r):
    steps = 8
    for i in range(steps):
        t = i / (steps - 1)
        disc((x, y - r * 0.36 * t), r * (1 - 0.46 * t), lerpc(G(70), SKIN, t ** 0.95))
    an = np.linspace(math.radians(8), math.radians(172), 14)
    line(np.stack([x + r * 0.97 * np.cos(an), y + r * 0.97 * np.sin(an)], 1), 4.5, BLACK)


def curl(cx, cy, R, flip):
    n = 120; t = np.linspace(0, 1, n); kk = max(1.0, R / 105)
    def sp(k, r1=0.3):
        ang = math.pi + (-math.pi * 1.0 - math.pi) * t
        r = R * k * (1 - (1 - r1) * t ** 1.1)
        return np.stack([cx + flip * r * np.cos(ang), cy - r * np.sin(ang)], 1)
    for k in (0.93, 0.7, 0.5):
        line(sp(k, 0.35), 2.0 * kk, G(70))
    poly(ribbon(sp(1.0), lens(n, 20 * kk, 0.7)), SKIN)
    poly(ribbon(sp(0.74, 0.35), lens(n, 10 * kk, 0.8)), SKIN)
    poly(ribbon(sp(0.5, 0.4), lens(n, 5 * kk, 0.8)), SKIN)
    # gancho final
    e = sp(1.0)[int(n * 0.5)]
    disc(e, 7 * kk, SKIN)


def build():
    global OX
    OX = 0
    rr = random.Random(3)
    helices = []
    for h in (0, 1):
        items = {"curl": [], 0: [], 1: [], 2: []}
        u = -200.0
        while hy(h, u) < 3150:
            y = hy(h, u); f = fscale(y)
            if int(u) % 1 == 0:
                pass
            u += 1e9 if False else 0
            u += 40
        # curvas
        u = -300.0
        while hy(h, u) < 3100:
            y = hy(h, u); f = fscale(y)
            items["curl"].append((u, y + rr.uniform(105, 135) * f, rr.uniform(85, 115) * f, 1 if rr.random() < 0.8 else -1))
            u += rr.uniform(300, 360) * f
        for row, (off, (ra, rb), step) in enumerate(((-46, (16, 24), 38), (-12, (26, 36), 52), (18, (30, 42), 58))):
            u = -300.0 + rr.uniform(0, 40)
            while hy(h, u) < 3150:
                y = hy(h, u); f = fscale(y)
                items[row].append((u + rr.uniform(-8, 8), y + (off + rr.uniform(-12, 12)) * f, rr.uniform(ra, rb) * f))
                u += step * f
        helices.append(items)
    # fumaca cinza (transicoes)
    from PIL import ImageFilter, ImageChops
    sc = S / 4
    sh = Image.new("L", (int(W * sc), int(H * sc)), 0); sd = ImageDraw.Draw(sh)
    def ell(cx, cy, rx, ry, v):
        for dx in (-W, 0, W):
            sd.ellipse([(cx + dx - rx) * sc, (cy - ry) * sc, (cx + dx + rx) * sc, (cy + ry) * sc], fill=v)
    for it in helices:
        for (u, y, R, fl) in it["curl"]:
            ell(u % W, y + 0.1 * R, 1.3 * R, 1.1 * R, 34)
        for (u, y, r) in it[0]:
            ell(u % W, y - 25, 1.4 * r, 1.2 * r, 40)
        for (u, y, r) in it[2][::2]:
            ell(u % W, y + r * 1.5, 1.7 * r, 1.0 * r, 58)
    sh = sh.filter(ImageFilter.GaussianBlur(9)).resize(img.size, Image.BICUBIC)
    img.paste(Image.merge("RGB", (sh, sh, sh)))
    # ondas: curvas e espuma
    for it in helices:
        for (u, cy, R, fl) in it["curl"]:
            wrap_draw(lambda: curl(u, cy, R, fl), u - R * 1.1, u + R * 1.1)
    # espuma: massa unica de pele, borda de bolhas, sombra cinza nas bordas
    from PIL import ImageFilter, ImageChops
    M = Image.new("L", img.size, 0); md = ImageDraw.Draw(M)
    for it in helices:
        for row in (0, 1, 2):
            for (u, y, r) in it[row]:
                for dx in (-W, 0, W):
                    md.ellipse([(u % W + dx - r) * S, (y - r) * S, (u % W + dx + r) * S, (y + r) * S], fill=255)
    Ms = ImageChops.offset(M, 0, -int(16 * S))
    mb = np.asarray(M.filter(ImageFilter.GaussianBlur(15 * S)), np.float32) / 255.0
    mbs = np.asarray(Ms.filter(ImageFilter.GaussianBlur(15 * S)), np.float32) / 255.0
    tt = np.clip((0.4 * mb + 0.6 * mbs - 0.5) / 0.46, 0, 1) ** 1.25
    base = np.array(G(80), np.float32); sk = np.array(SKIN, np.float32)
    fimg = Image.fromarray((base + (sk - base) * tt[..., None]).astype(np.uint8))
    img.paste(fimg, mask=M)
    for it in helices:
        for row in (1, 2):
            for (u, y, r) in it[row]:
                def arc(u=u, y=y, r=r):
                    an = np.linspace(math.radians(5), math.radians(175), 16)
                    line(np.stack([u + r * 0.96 * np.cos(an), y + r * 0.96 * np.sin(an)], 1), 4.2, BLACK)
                wrap_draw(arc, u - r, u + r)
    # barras de vento em helice no antebraco
    for u0 in (3000, 4100, 5100):
        for h in (0,):
            def seg(u0=u0, h=h):
                us = np.linspace(u0, u0 + 840, 60)
                c = np.stack([us, [hy(h, v) + 155 + 20 * math.sin(v / 130) for v in us]], 1)
                kaze(0, 0, 0, 58, gdir=1 if u0 % 2000 else -1, curl=True, c0=c)
            if 1400 < hy(h, u0) < 2800: wrap_draw(seg, u0 - 100, u0 + 1100)
    # cotovelo: barras acompanhando a articulacao
    for r in range(3):
        for k in range(2):
            for ox in (-W, 0, W):
                OX = ox
                kaze(k * 700 - 160 + r * 130, 1300 + r * 64, 880, 56, amp=14, wl=620, gdir=1 if r % 2 == 0 else -1, curl=(r % 2 == 0))
    OX = 0
    for r in range(3):
        for k in range(2):
            for ox in (-W, 0, W):
                OX = ox
                kaze(k * 700 - 100 + r * 190, 2800 + r * 52, 880, 52, amp=10, wl=700, gdir=-1 if r % 2 == 0 else 1, curl=(r % 2 == 1))
    OX = 0
    # dragao (ombro e biceps)
    for ox in range(0, int(2.6 * W) + 1, W):
        OX = ox
        body(random.Random(5))
    for i, dx, ln in ((int(len(P) * 0.2), -1, -1), (int(len(P) * 0.55), 1, 1)):
        for ox in range(0, int(2.6 * W) + 1, W):
            OX = ox
            if visible(i, 150): leg(i, dx, ln)
    for ox in range(0, int(2.6 * W) + 1, W):
        OX = ox
        if visible(len(P) - 1, 260): tail_tuft()
    for ox in (-W, 0, W):
        OX = ox; head()
    OX = 0


def borders():
    # bordas superior (ombro) e inferior (punho) em escamas de onda
    d = ImageDraw.Draw(img)
    top = lambda x: 62 + 42 * (1 - abs(math.cos(math.pi * x / 170)))
    bot = lambda x: 2955 + 30 * abs(math.cos(math.pi * x / 170))
    pts_t = [(0, 0)] + [(x * S, top(x) * S) for x in np.arange(0, W + 1, 2)] + [(W * S, 0)]
    pts_b = [(0, H * S)] + [(x * S, bot(x) * S) for x in np.arange(0, W + 1, 2)] + [(W * S, H * S)]
    d.polygon(pts_t, fill=SKIN); d.polygon(pts_b, fill=SKIN)
    d.line([(x * S, (top(x) + 14) * S) for x in np.arange(0, W + 1, 2)], fill=SKIN, width=5 * S)
    d.line([(x * S, (bot(x) - 14) * S) for x in np.arange(0, W + 1, 2)], fill=SKIN, width=5 * S)
    # faixa preta solida logo apos as bordas
    d.polygon([(x * S, (top(x) + 20) * S) for x in np.arange(0, W + 1, 2)] + [(x * S, (top(x) + 60) * S) for x in np.arange(W, -1, -2)], fill=BLACK) if False else None


if __name__ == "__main__":
    build(); borders()
    out = img.resize((W, H), Image.LANCZOS)
    out.save(os.path.join(OUT, "arte_planificada.png"))
    a = np.asarray(out).astype(int)
    lum = a.min(axis=2)
    ink = a[(a.min(axis=2) < 230).any() if False else slice(None)]
    mask = np.ones((H, W), bool)
    dark = (a.max(axis=2) < 70)
    red = (a[..., 0] > 120) & (a[..., 1] < 70)
    print("preto %.1f%%  vermelho %.1f%%  pele %.1f%%" % (100 * dark.mean(), 100 * red.mean(), 100 * (a.min(axis=2) > 200).mean()))
