#!/usr/bin/env python3
"""Enrola arte_planificada.png em um braco (cilindro) e gera as 4 vistas + prancha de decalque."""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
tex = np.asarray(Image.open(os.path.join(HERE, "arte_planificada.png")).convert("RGB")).astype(np.float32)
TH, TW = tex.shape[:2]

PPC = 26          # pixels por cm
SSR = 2           # supersampling
VW_CM, VH_CM = 15.0, 82.0
Y0 = -6.0
ARM_LEN = 60.0    # ombro (y=0) -> punho (y=60)

# perfil de raio (cm): ombro/dome, biceps, cotovelo, antebraco, punho, mao
prof = [(-7.0, 6.0), (-4.0, 6.15), (-1.0, 6.3), (1.5, 6.35), (4.0, 6.25), (8.0, 5.9), (14, 5.45), (21, 5.15), (27, 4.65),
        (33, 4.75), (40, 4.3), (50, 3.35), (57, 2.85), (60.5, 2.75),
        (63, 3.45), (67, 3.9), (72, 4.0), (78, 3.8), (84, 3.5)]
py = np.array([p[0] for p in prof]); pr = np.array([p[1] for p in prof])


def smooth_profile(y):
    # interpolacao suave (cubica Hermite com tangentes de Catmull-Rom)
    m = np.gradient(pr, py)
    i = np.clip(np.searchsorted(py, y) - 1, 0, len(py) - 2)
    h = py[i + 1] - py[i]; t = (y - py[i]) / h
    h00 = 2 * t**3 - 3 * t**2 + 1; h10 = t**3 - 2 * t**2 + t; h01 = -2 * t**3 + 3 * t**2; h11 = t**3 - t**2
    return h00 * pr[i] + h10 * h * m[i] + h01 * pr[i + 1] + h11 * h * m[i + 1]


def render_view(frac_center, light=-0.55):
    w = int(VW_CM * PPC * SSR); h = int((VH_CM) * PPC * SSR)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ycm = yy / (PPC * SSR) + Y0
    xcm = (xx - w / 2) / (PPC * SSR)
    r = smooth_profile(np.clip(ycm, -6.99, 83.9))
    inside = np.abs(xcm) < r - 1e-4
    rs = np.maximum(r, 1e-3)
    u = np.arcsin(np.clip(xcm / rs, -1, 1))
    # textura
    ty = np.clip(ycm / ARM_LEN * TH, 0, TH - 1).astype(np.int32)
    tx = (((frac_center + u / (2 * math.pi)) % 1.0) * TW).astype(np.int32) % TW
    col = tex[ty, tx]
    on_tat = (ycm >= 0) & (ycm <= ARM_LEN)
    skin = np.array([218, 168, 136], np.float32) / 255.0
    cl = np.clip(col / np.array([240.0, 236.0, 230.0], np.float32), 0, 1)
    base = np.where(on_tat[..., None], cl * skin, skin)
    # mao: sem tatuagem, linhas dos dedos
    hand = ycm > 63
    fing = np.zeros_like(xcm, bool)
    base = np.where(fing[..., None], base * 0.62, base)
    # iluminacao cilindrica
    ndl = np.clip(np.cos(u - light), 0, 1)
    shade = 0.20 + 0.80 * ndl ** 1.05
    spec = 0.30 * np.clip(np.cos(u - light - 0.12), 0, 1) ** 28
    out = base * shade[..., None]
    ink = (1 - np.clip(col.min(axis=2) / 255.0, 0, 1)) * on_tat   # 1 = tinta
    out = out + (spec * (0.45 + 0.55 * (1 - ink)))[..., None] * np.where(ink[..., None] > 0.5, 0.35, 1.0)
    # oclusao nas bordas
    out *= (0.55 + 0.45 * np.clip(np.cos(u), 0, 1) ** 0.6)[..., None]
    # musculatura suave (biceps/deltoide/antebraco)
    mus = 1 + 0.06 * np.sin((ycm - 6) / 14 * math.pi) * np.cos(u - 0.3) * (ycm > 2) * (ycm < 34)
    out *= mus[..., None]
    rgb = np.clip(out, 0, 1)
    # fundo: estudio
    bg = np.zeros((h, w, 3), np.float32)
    gy = np.linspace(0, 1, h)[:, None]; gx = np.linspace(-1, 1, w)[None, :]
    base_bg = np.array([36, 37, 44], np.float32) / 255
    vign = 1.0 - 0.35 * (gx ** 2)
    bg[:] = (base_bg * (0.75 + 0.35 * (1 - gy))[..., None] * vign[..., None])
    # dissolve ombro (topo) e mao (base) no fundo
    fade = np.clip((ycm - (-6.0)) / 5.0, 0, 1) * np.clip((74.0 - ycm) / 9.0, 0, 1)
    fade = fade * fade * (3 - 2 * fade)
    rgb = rgb * fade[..., None] + bg * (1 - fade[..., None])
    outimg = np.where(inside[..., None], rgb, bg)
    # sombra projetada suave
    im = Image.fromarray((np.clip(outimg, 0, 1) * 255).astype(np.uint8))
    im = im.resize((int(VW_CM * PPC), int(VH_CM * PPC)), Image.LANCZOS)
    return im


def font(sz, bold=False):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
              "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def sheet_views():
    views = [("1 · VISTA FRONTAL", 0.75), ("2 · LATERAL EXTERNA", 0.50), ("3 · POSTERIOR", 0.25), ("4 · INTERNA", 0.0)]
    ims = [render_view(f) for _, f in views]
    vw, vh = ims[0].size
    pad = 30; top = 150; bot = 90
    Wd = pad + len(ims) * (vw + pad); Hd = top + vh + bot
    sh = Image.new("RGB", (Wd, Hd), (30, 31, 37))
    d = ImageDraw.Draw(sh)
    d.text((pad, 34), "IREZUMI FULL SLEEVE  ·  RYŪ PRETO E VERMELHO", font=font(46, True), fill=(235, 232, 226))
    d.text((pad, 98), "Um único dragão em espiral, ombro → punho  ·  ondas Nami, barras Kaze e preto sólido  ·  paleta: #080808 / #B5121B + pele", font=font(24), fill=(170, 168, 165))
    for k, ((name, _), im) in enumerate(zip(views, ims)):
        x = pad + k * (vw + pad)
        sh.paste(im, (x, top))
        d.text((x + vw // 2, top + vh + 38), name, font=font(28, True), fill=(235, 232, 226), anchor="mm")
        # marcadores de zona
    zones = [("OMBRO · cabeça", 2.5), ("BÍCEPS / TRÍCEPS", 16), ("COTOVELO", 27.5), ("ANTEBRAÇO", 42), ("PUNHO", 58)]
    for nm, ycm in zones:
        yy = top + int((ycm - Y0) * PPC)
        d.line([(6, yy), (pad - 6, yy)], fill=(181, 18, 27), width=3)
    sh.save(os.path.join(HERE, "tatuagem_vistas_braco.png"))
    for (name, _), im in zip(views, ims):
        slug = name.split("· ")[1].lower().replace("vista ", "").replace(" ", "_")
        im.save(os.path.join(HERE, "vista_%s.png" % slug))
    return sh


def sheet_flat():
    m = 170; tw, th = TW, TH
    Wd = tw + 2 * m + 120; Hd = th + 330
    sh = Image.new("RGB", (Wd, Hd), (255, 255, 255))
    d = ImageDraw.Draw(sh)
    sh.paste(Image.fromarray(tex.astype(np.uint8)), (m + 60, 220))
    x0, y0 = m + 60, 220
    d.rectangle([x0, y0, x0 + tw, y0 + th], outline=(120, 120, 120), width=3)
    d.text((Wd // 2, 50), "ARTE PLANIFICADA 360° · REFERÊNCIA PARA DECALQUE", font=font(52, True), fill=(10, 10, 10), anchor="mm")
    d.text((Wd // 2, 120), "Ryū preto e vermelho · ombro (topo) → punho (base) · as bordas esquerda e direita se encontram (continuidade 360°)", font=font(26), fill=(70, 70, 70), anchor="mm")
    for name, fr in (("INTERNA", 0.0), ("POSTERIOR", 0.25), ("EXTERNA", 0.50), ("FRONTAL", 0.75), ("INTERNA", 1.0)):
        x = x0 + int(fr * tw)
        d.line([(x, y0 - 26), (x, y0)], fill=(181, 18, 27), width=4)
        d.text((x, y0 - 62), name + " (%d°)" % int(fr * 360), font=font(24, True), fill=(30, 30, 30), anchor="mm")
    for nm, fr in (("OMBRO", 0.03), ("BÍCEPS /\nTRÍCEPS", 0.2), ("COTOVELO", 0.46), ("ANTEBRAÇO", 0.72), ("PUNHO", 0.975)):
        y = y0 + int(fr * th)
        d.line([(x0 - 40, y), (x0, y)], fill=(181, 18, 27), width=4)
        d.multiline_text((x0 - 50, y), nm, font=font(22, True), fill=(30, 30, 30), anchor="rm", align="right")
    d.text((Wd // 2, y0 + th + 55), "Preto #080808  ·  Vermelho #B5121B  ·  Cinza apenas para transições  ·  Pele = espaço negativo", font=font(26), fill=(60, 60, 60), anchor="mm")
    sh.save(os.path.join(HERE, "tatuagem_arte_planificada_branco.png"))


if __name__ == "__main__":
    sheet_views(); sheet_flat()
    print("ok")
