"""Artemis III video, Blender v2: textured Earth (albedo, ocean gloss, clouds, night lights, atmosphere) and Moon (albedo + crater relief),
a star-sky environment, nine chapter plates with different camera angles, and rebuilt vehicle models (lathe profiles, tiles, nozzles).
All models and textures are original and stylised (illustrations, not to scale).
usage: python scene3d_v2.py <shot> <f0> <f1> [samples] [scale%]"""
import bpy, bmesh, math, sys, os
from mathutils import Vector, Euler
A = sys.argv[1:]; SHOT = A[0]; F0, F1 = int(A[1]), int(A[2]); SAMPLES = int(A[3]) if len(A) > 3 else 16; PCT = int(A[4]) if len(A) > 4 else 100
HERE = os.path.dirname(os.path.abspath(__file__)); TEX = os.path.join(HERE, "tex")
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 2; sc.cycles.glossy_bounces = 3; sc.cycles.transparent_max_bounces = 16
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"; sc.render.fps = 24
try: sc.view_settings.view_transform = "AgX"
except Exception: sc.view_settings.view_transform = "Filmic"
PLATE = SHOT.startswith("p")
RES = {"dock_lander": (860, 700), "dock_ship": (760, 760), "sls": (520, 900), "ship": (520, 900), "lander": (800, 800), "orion": (800, 800)}
W_, H_ = (1600, 900) if PLATE else RES[SHOT]
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W_, H_, PCT
sc.render.film_transparent = not PLATE

# ---------------- materials
def nodes(m): return m.node_tree.nodes, m.node_tree.links
def mat(name, color, metal=0.0, rough=0.5, spec=0.4, bump=0.0, bump_scale=60.0, rough_var=0.0, emit=None, emit_str=3.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; N, L = nodes(m); b = N["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Metallic"].default_value = metal; b.inputs["Roughness"].default_value = rough
    try: b.inputs["Specular IOR Level"].default_value = spec
    except Exception: pass
    if emit: b.inputs["Emission Color"].default_value = (*emit, 1); b.inputs["Emission Strength"].default_value = emit_str
    if bump or rough_var:
        tc = N.new("ShaderNodeTexCoord"); no = N.new("ShaderNodeTexNoise"); no.inputs["Scale"].default_value = bump_scale; no.inputs["Detail"].default_value = 8; no.inputs["Roughness"].default_value = .62
        L.new(tc.outputs["Object"], no.inputs["Vector"])
        if bump:
            bn = N.new("ShaderNodeBump"); bn.inputs["Strength"].default_value = bump; bn.inputs["Distance"].default_value = .05
            L.new(no.outputs["Fac"], bn.inputs["Height"]); L.new(bn.outputs["Normal"], b.inputs["Normal"])
        if rough_var:
            mr = N.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = max(0, rough - rough_var); mr.inputs["To Max"].default_value = min(1, rough + rough_var)
            L.new(no.outputs["Fac"], mr.inputs["Value"]); L.new(mr.outputs["Result"], b.inputs["Roughness"])
    return m
def tiled(name, color, mortar, scale, rough=.7, metal=0.0, bump=.25):
    m = mat(name, color, metal, rough); N, L = nodes(m); b = N["Principled BSDF"]; tc = N.new("ShaderNodeTexCoord")
    br = N.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = scale; br.inputs["Color1"].default_value = (*color, 1); br.inputs["Color2"].default_value = (*[c * .9 for c in color], 1); br.inputs["Mortar"].default_value = (*mortar, 1); br.inputs["Mortar Size"].default_value = .03
    L.new(tc.outputs["Object"], br.inputs["Vector"]); L.new(br.outputs["Color"], b.inputs["Base Color"])
    bn = N.new("ShaderNodeBump"); bn.inputs["Strength"].default_value = bump; L.new(br.outputs["Fac"], bn.inputs["Height"]); L.new(bn.outputs["Normal"], b.inputs["Normal"]); return m
WHITE = mat("white", (.76, .77, .78), 0, .62, .35, .04, 14, .12)
TILES = tiled("tiles", (.70, .71, .72), (.32, .33, .35), 9)
ORANGE = mat("orange", (.62, .28, .08), 0, .9, .2, .22, 70, .05)
ORANGE_D = mat("orange_d", (.48, .22, .07), 0, .9, .2, .2, 60)
GOLD = mat("gold", (.70, .50, .17), 1, .46, .5, .9, 34, .12)
SILVER = mat("silver", (.60, .61, .63), .8, .5, .4, .06, 90, .12)
STEEL = mat("steel", (.52, .53, .55), .9, .5, .4, .05, 120, .15)
DARK = mat("dark", (.05, .055, .065), .3, .62, .3, .06, 40)
NOZ = mat("nozzle", (.18, .17, .17), .85, .45, .4, .1, 30, .1)
BLACK = mat("black", (.015, .015, .018), 0, .6, .2)
HEAT = mat("heatshield", (.10, .08, .07), 0, .85, .2, .25, 25)
PANEL = mat("panel", (.03, .09, .24), .55, .45, .35); N_, L_ = nodes(PANEL)
_tc = N_.new("ShaderNodeTexCoord"); _br = N_.new("ShaderNodeTexBrick"); _br.inputs["Scale"].default_value = 22; _br.inputs["Color1"].default_value = (.03, .10, .26, 1); _br.inputs["Color2"].default_value = (.04, .12, .30, 1); _br.inputs["Mortar"].default_value = (.4, .48, .6, 1); _br.inputs["Mortar Size"].default_value = .02
L_.new(_tc.outputs["UV"], _br.inputs["Vector"]); L_.new(_br.outputs["Color"], N_["Principled BSDF"].inputs["Base Color"])
BLUEBAND = mat("blueband", (.2, .6, .9), .1, .3, emit=(.2, .6, .9), emit_str=2.0)
def ring_mat(name, col, strength=2.5):
    m = bpy.data.materials.new(name); m.use_nodes = True; N, L = nodes(m); N.remove(N["Principled BSDF"]); em = N.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (*col, 1); em.inputs["Strength"].default_value = strength
    L.new(em.outputs["Emission"], N["Material Output"].inputs["Surface"]); return m
# Starship: steel on one side, black hex-ish heat tiles on the other (object-space x < 0)
SHIP = mat("shipsteel", (.55, .56, .58), .9, .48, .4, .05, 120, .15); N_, L_ = nodes(SHIP); b_ = N_["Principled BSDF"]
_tc = N_.new("ShaderNodeTexCoord"); _sx = N_.new("ShaderNodeSeparateXYZ"); L_.new(_tc.outputs["Object"], _sx.inputs["Vector"])
_lt = N_.new("ShaderNodeMath"); _lt.operation = "LESS_THAN"; _lt.inputs[1].default_value = 0.0; L_.new(_sx.outputs["X"], _lt.inputs[0])
_vor = N_.new("ShaderNodeTexVoronoi"); _vor.feature = "DISTANCE_TO_EDGE"; _vor.inputs["Scale"].default_value = 3.2; L_.new(_tc.outputs["Object"], _vor.inputs["Vector"])
_cr = N_.new("ShaderNodeValToRGB"); _cr.color_ramp.elements[0].position = .02; _cr.color_ramp.elements[0].color = (.005, .005, .006, 1); _cr.color_ramp.elements[1].position = .06; _cr.color_ramp.elements[1].color = (.035, .035, .04, 1)
L_.new(_vor.outputs["Distance"], _cr.inputs["Fac"])
_mix = N_.new("ShaderNodeMix"); _mix.data_type = "RGBA"; _mix.inputs["A"].default_value = (.55, .56, .58, 1); L_.new(_lt.outputs["Value"], _mix.inputs["Factor"]); L_.new(_cr.outputs["Color"], _mix.inputs["B"]); L_.new(_mix.outputs["Result"], b_.inputs["Base Color"])
_mm = N_.new("ShaderNodeMapRange"); _mm.inputs["To Min"].default_value = .9; _mm.inputs["To Max"].default_value = .0; L_.new(_lt.outputs["Value"], _mm.inputs["Value"]); L_.new(_mm.outputs["Result"], b_.inputs["Metallic"])

# ---------------- geometry helpers
def assign(o, m): o.data.materials.clear(); o.data.materials.append(m); return o
def link(o): bpy.context.collection.objects.link(o); return o
def lathe(name, prof, m, segs=64, cap0=True, cap1=True, loc=(0, 0, 0), rot=(0, 0, 0)):
    verts, faces = [], []; n = len(prof)
    for (r, z) in prof:
        for j in range(segs): a = 2 * math.pi * j / segs; verts.append((r * math.cos(a), r * math.sin(a), z))
    for i in range(n - 1):
        for j in range(segs): a0 = i * segs + j; a1 = i * segs + (j + 1) % segs; faces.append((a0, a1, a1 + segs, a0 + segs))
    if cap0 and prof[0][0] > 0: verts.append((0, 0, prof[0][1])); c = len(verts) - 1; faces += [(c, (j + 1) % segs, j) for j in range(segs)]
    if cap1 and prof[-1][0] > 0: verts.append((0, 0, prof[-1][1])); c = len(verts) - 1; b0 = (n - 1) * segs; faces += [(c, b0 + j, b0 + (j + 1) % segs) for j in range(segs)]
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update(); o = link(bpy.data.objects.new(name, me)); o.location = loc; o.rotation_euler = rot
    for p in me.polygons: p.use_smooth = True
    return assign(o, m)
def cyl(name, r, h, loc, m, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts); o = bpy.context.object; o.name = name; bpy.ops.object.shade_smooth(); return assign(o, m)
def box(name, sx, sy, sz, loc, m, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.object; o.scale = (sx, sy, sz); o.name = name
    if bevel: md = o.modifiers.new("b", "BEVEL"); md.width = bevel; md.segments = 2
    return assign(o, m)
def sphere(name, r, loc, m, scale=(1, 1, 1), seg=96, rings=48):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=rings); o = bpy.context.object; o.scale = scale; bpy.ops.object.shade_smooth(); o.name = name; return assign(o, m)
def torus(name, R, r, loc, m, rot=(0, 0, 0), seg=160):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=seg, minor_segments=12); o = bpy.context.object; bpy.ops.object.shade_smooth(); o.name = name; return assign(o, m)
def group(name, objs, loc=(0, 0, 0)):
    e = link(bpy.data.objects.new(name, None)); e.location = loc
    for o in objs: o.parent = e; o.matrix_parent_inverse = e.matrix_world.inverted()
    return e
def aim(o, target):
    d = Vector(target) - o.location; o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()

# ---------------- vehicles (v2)
def make_orion(s=1.0, loc=(0, 0, 0), arrays=True):
    p = [lathe("heat", [(0, -.18), (2.2, -.05), (2.52, .05), (2.5, .14)], HEAT, cap1=False),
         lathe("cm", [(2.5, .14), (2.3, .9), (1.7, 2.3), (1.05, 3.3), (.6, 3.45)], TILES, cap0=False, cap1=False),
         lathe("tun", [(.6, 3.45), (.62, 3.95), (.75, 4.0), (.75, 4.25), (0, 4.25)], SILVER, cap0=False),
         lathe("cma", [(2.5, .14), (2.5, -.7)], WHITE, cap0=False, cap1=False),
         lathe("esm", [(2.5, -.7), (2.5, -3.9), (2.2, -4.4), (0, -4.4)], SILVER, cap0=False),
         lathe("mli", [(2.52, -3.2), (2.52, -3.9)], GOLD, cap0=False, cap1=False),
         lathe("bell", [(.35, -4.4), (.55, -4.9), (.85, -5.7), (1.15, -6.4)], NOZ, cap0=False, cap1=False)]
    for k in range(4): a = math.radians(90 * k); p.append(box("rad", .06, 1.3, 2.0, (math.cos(a) * 2.53, math.sin(a) * 2.53, -2.0), WHITE, rot=(0, 0, a)))
    for k in range(8): a = math.radians(45 * k + 22.5); p.append(lathe("aux", [(.08, 0), (.16, -.35)], NOZ, cap0=False, cap1=False, loc=(math.cos(a) * 2.2, math.sin(a) * 2.2, -4.3)))
    for k in range(4): a = math.radians(14 * 0 + 4) * 0 + math.radians(45 + 90 * k); ca, sa = math.cos(a), math.sin(a)
    for k in range(4 if arrays else 0):
        a = math.radians(45 + 90 * k); ca, sa = math.cos(a), math.sin(a)
        p.append(cyl("boom", .07, 1.6, (ca * 3.2, sa * 3.2, -1.6), SILVER, rot=(0, math.radians(90), a)))
        for i in range(3):
            d = 4.1 + i * 2.3; p.append(box("pan", 2.15, .05, 2.0, (ca * (d + 1.0), sa * (d + 1.0), -1.6), PANEL, rot=(0, 0, a)))
    for w in range(4): a = math.radians(90 * w + 30); p.append(box("win", .34, .05, .26, (math.cos(a) * 1.55, math.sin(a) * 1.55, 2.55), BLACK, rot=(math.radians(-28), 0, a + math.pi / 2)))
    e = group("orion", p, loc); e.scale = (s,) * 3; return e
def make_sls(s=1.0, loc=(0, 0, 0)):
    p = [lathe("core", [(4.2, -30), (4.2, 28)], ORANGE, cap0=False, cap1=False), lathe("inter", [(4.21, 6), (4.21, 9)], ORANGE_D, cap0=False, cap1=False),
         lathe("engsec", [(4.2, -30), (4.5, -33), (0, -33)], ORANGE_D, cap0=False),
         lathe("lvsa", [(4.2, 28), (2.6, 33)], SILVER, cap0=False, cap1=False), lathe("icps", [(2.6, 33), (2.6, 40)], WHITE, cap0=False, cap1=False),
         lathe("osa", [(2.6, 40), (2.5, 42)], SILVER, cap0=False, cap1=False)]
    for k in (-1, 1):
        x = k * 6.6
        p.append(lathe("srb", [(1.95, -31), (1.95, 22)], WHITE, cap0=False, cap1=False, loc=(x, 0, 0)))
        p.append(lathe("srbnose", [(1.95, 22), (1.7, 25), (1.1, 28), (.35, 30.2), (0, 30.4)], WHITE, cap0=False, loc=(x, 0, 0)))
        p.append(lathe("skirt", [(1.95, -31), (2.5, -35), (0, -35)], WHITE, cap0=False, loc=(x, 0, 0)))
        p.append(lathe("srbnoz", [(.9, -35), (1.3, -36.5), (1.7, -38)], NOZ, cap0=False, cap1=False, loc=(x, 0, 0)))
        for z in (-18, -6, 6, 15): p.append(torus("joint", 1.97, .06, (x, 0, z), DARK))
        p.append(lathe("band", [(1.97, 17.5), (1.97, 18.6)], BLACK, cap0=False, cap1=False, loc=(x, 0, 0)))
    for i in range(4): a = math.radians(45 + 90 * i); p.append(lathe("rs25", [(.5, -33), (.75, -34), (1.15, -36.6)], NOZ, cap0=False, cap1=False, loc=(math.cos(a) * 2.1, math.sin(a) * 2.1, 0)))
    o = make_orion(.98, (0, 0, 42.2), arrays=False); p.append(o)
    p.append(lathe("fair", [(2.55, 42.0), (2.55, 45.5), (.8, 49.5), (.35, 50)], WHITE, cap0=False, cap1=False))
    p.append(lathe("las", [(.35, 50), (.3, 55), (.5, 56), (.5, 57.5), (0, 59)], WHITE, cap0=False))
    e = group("sls", p, loc); e.scale = (s,) * 3; return e
def make_lander(s=1.0, loc=(0, 0, 0)):
    p = [lathe("tank", [(3.6, -4.8), (3.6, 4.0)], WHITE, cap0=False, cap1=False), lathe("tankbot", [(3.6, -4.8), (2.6, -5.8), (0, -6.0)], SILVER, cap0=False),
         lathe("cab", [(3.6, 4.0), (3.4, 6.6), (2.6, 8.2), (1.4, 9.0), (0, 9.2)], WHITE, cap0=False),
         lathe("bell", [(.7, -6.0), (1.1, -6.9), (1.8, -8.0)], NOZ, cap0=False, cap1=False)]
    p.append(lathe("band", [(3.62, .9), (3.62, 1.35)], BLUEBAND, cap0=False, cap1=False))
    for z in (-2.6, 2.8): p.append(torus("seam", 3.62, .05, (0, 0, z), DARK))
    for k in range(3): a = math.radians(-60 + 40 * k); p.append(box("win", .55, .06, .4, (math.cos(a + math.pi / 2) * 0 + math.sin(a) * 3.05, -math.cos(a) * 3.05, 7.1), BLACK, rot=(math.radians(18), 0, a)))
    p.append(cyl("port", .95, 1.4, (4.1, 0, 5.4), DARK, rot=(0, math.radians(90), 0))); p.append(torus("portr", 1.05, .14, (4.85, 0, 5.4), SILVER, rot=(0, math.radians(90), 0)))
    for k in range(2): a = math.radians(90 + 180 * k); p.append(box("radp", .08, 2.6, 5.2, (math.cos(a) * 3.66, math.sin(a) * 3.66, -.8), WHITE, rot=(0, 0, a)))
    for i in range(4):
        a = math.radians(45 + 90 * i); ca, sa = math.cos(a), math.sin(a)
        top = Vector((ca * 3.4, sa * 3.4, -2.0)); foot = Vector((ca * 7.8, sa * 7.8, -9.4)); mid = (top + foot) / 2; d = foot - top
        leg = cyl("leg", .22, d.length, tuple(mid), STEEL); leg.rotation_euler = d.to_track_quat("Z", "Y").to_euler(); p.append(leg)
        top2 = Vector((ca * 3.5, sa * 3.5, -4.7)); d2 = foot - top2; mid2 = (top2 + foot) / 2
        st = cyl("strut", .12, d2.length, tuple(mid2), SILVER); st.rotation_euler = d2.to_track_quat("Z", "Y").to_euler(); p.append(st)
        p.append(lathe("pad", [(0, -9.25), (1.05, -9.35), (1.15, -9.6), (0, -9.65)], DARK, loc=(ca * 7.8, sa * 7.8, 0)))
    e = group("lander", p, loc); e.scale = (s,) * 3; return e
def make_ship(s=1.0, loc=(0, 0, 0)):
    prof = [(4.5, -25), (4.5, 14)] + [(4.5 * (1 - ((z - 14) / 12.6) ** 2) ** .62, z) for z in [14 + i * .9 for i in range(1, 14)]] + [(.9, 26.6)]
    p = [lathe("body", prof, SHIP, cap0=False, cap1=True), lathe("skirt", [(4.5, -25), (4.6, -26.5), (0, -26.6)], DARK, cap0=False), cyl("dock", 1.0, 1.0, (0, 0, 27.0), DARK), torus("dockr", 1.25, .15, (0, 0, 27.5), SILVER)]
    for z in (-12, 0, 8): p.append(torus("weld", 4.52, .045, (0, 0, z), DARK))
    for k in (-1, 1):
        p.append(box("ffl", .35, 3.6, 6.4, (k * 4.3, 0, 17.5), SHIP, rot=(0, k * math.radians(-17), 0), bevel=.15))
        p.append(box("afl", .45, 5.6, 9.0, (k * 5.2, 0, -19.5), SHIP, rot=(0, k * math.radians(-8), 0), bevel=.2))
    for i in range(3): a = math.radians(120 * i); p.append(lathe("rsl", [(.45, -26.5), (.7, -27.4), (.95, -28.2)], NOZ, cap0=False, cap1=False, loc=(math.cos(a) * 1.0, math.sin(a) * 1.0, 0)))
    for i in range(3): a = math.radians(120 * i + 60); p.append(lathe("rvac", [(.5, -26.5), (1.0, -27.6), (1.55, -29.2)], NOZ, cap0=False, cap1=False, loc=(math.cos(a) * 2.9, math.sin(a) * 2.9, 0)))
    e = group("ship", p, loc); e.scale = (s,) * 3; return e

# ---------------- planets and sky
def img(path, noncolor=False):
    im = bpy.data.images.load(path); 
    if noncolor: im.colorspace_settings.name = "Non-Color"
    return im
SUN_DIR = Vector((-.55, .35, .45)).normalized()   # direction TOWARD the sun
def earth(r, loc, rotz=0.0):
    m = bpy.data.materials.new("earth"); m.use_nodes = True; N, L = nodes(m); b = N["Principled BSDF"]
    t_alb = N.new("ShaderNodeTexImage"); t_alb.image = img(os.path.join(TEX, "earth_albedo.png")); L.new(t_alb.outputs["Color"], b.inputs["Base Color"])
    t_oc = N.new("ShaderNodeTexImage"); t_oc.image = img(os.path.join(TEX, "earth_ocean.png"), True)
    mr = N.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = .82; mr.inputs["To Max"].default_value = .32; L.new(t_oc.outputs["Color"], mr.inputs["Value"]); L.new(mr.outputs["Result"], b.inputs["Roughness"])
    t_n = N.new("ShaderNodeTexImage"); t_n.image = img(os.path.join(TEX, "earth_night.png"), True)
    geo = N.new("ShaderNodeNewGeometry"); dot = N.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"; dot.inputs[1].default_value = tuple(SUN_DIR); L.new(geo.outputs["Normal"], dot.inputs[0])
    dark = N.new("ShaderNodeMapRange"); dark.inputs["From Min"].default_value = .05; dark.inputs["From Max"].default_value = -.2; dark.inputs["To Min"].default_value = 0; dark.inputs["To Max"].default_value = 1; L.new(dot.outputs["Value"], dark.inputs["Value"])
    mul = N.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; L.new(t_n.outputs["Color"], mul.inputs[0]); L.new(dark.outputs["Result"], mul.inputs[1])
    b.inputs["Emission Color"].default_value = (1.0, .62, .28, 1); L.new(mul.outputs["Value"], b.inputs["Emission Strength"])
    e = sphere("earth", r, loc, m, seg=128, rings=64); e.rotation_euler = (math.radians(18), 0, rotz)
    # clouds
    cm = bpy.data.materials.new("clouds"); cm.use_nodes = True; N, L = nodes(cm); cb = N["Principled BSDF"]; cb.inputs["Base Color"].default_value = (1, 1, 1, 1); cb.inputs["Roughness"].default_value = .95
    tc = N.new("ShaderNodeTexImage"); tc.image = img(os.path.join(TEX, "earth_clouds.png"), True); tr = N.new("ShaderNodeBsdfTransparent"); mx = N.new("ShaderNodeMixShader")
    cf = N.new("ShaderNodeMath"); cf.operation = "MULTIPLY"; cf.inputs[1].default_value = (.4 if SHOT == "p1" else .72); L.new(tc.outputs["Color"], cf.inputs[0]); L.new(cf.outputs["Value"], mx.inputs["Fac"]); L.new(tr.outputs["BSDF"], mx.inputs[1]); L.new(cb.outputs["BSDF"], mx.inputs[2]); L.new(mx.outputs["Shader"], N["Material Output"].inputs["Surface"])
    try: cm.blend_method = "BLEND"
    except Exception: pass
    c = sphere("clouds", r * 1.012, loc, cm, seg=128, rings=64); c.rotation_euler = (math.radians(18), 0, rotz + .4)
    # atmosphere: fresnel emission, brighter on the sunlit side
    am = bpy.data.materials.new("atmo"); am.use_nodes = True; N, L = nodes(am); N.remove(N["Principled BSDF"])
    lw = N.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = .5; pw = N.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = 5.5; L.new(lw.outputs["Facing"], pw.inputs[0])
    geo = N.new("ShaderNodeNewGeometry"); dot = N.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"; dot.inputs[1].default_value = tuple(SUN_DIR); L.new(geo.outputs["Normal"], dot.inputs[0])
    lit = N.new("ShaderNodeMapRange"); lit.inputs["From Min"].default_value = -.35; lit.inputs["From Max"].default_value = .6; lit.inputs["To Min"].default_value = .05; lit.inputs["To Max"].default_value = 1; L.new(dot.outputs["Value"], lit.inputs["Value"])
    f = N.new("ShaderNodeMath"); f.operation = "MULTIPLY"; L.new(pw.outputs["Value"], f.inputs[0]); L.new(lit.outputs["Result"], f.inputs[1])
    em = N.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (.35, .62, 1, 1); em.inputs["Strength"].default_value = (0.55 if SHOT == "p1" else 1.7); tr = N.new("ShaderNodeBsdfTransparent"); mx = N.new("ShaderNodeMixShader")
    L.new(f.outputs["Value"], mx.inputs["Fac"]); L.new(tr.outputs["BSDF"], mx.inputs[1]); L.new(em.outputs["Emission"], mx.inputs[2]); L.new(mx.outputs["Shader"], N["Material Output"].inputs["Surface"])
    a = sphere("atmo", r * 1.025, loc, am, seg=128, rings=64)
    return e, c, a
def moon(r, loc, rotz=0.0):
    m = bpy.data.materials.new("moon"); m.use_nodes = True; N, L = nodes(m); b = N["Principled BSDF"]; b.inputs["Roughness"].default_value = .96
    try: b.inputs["Specular IOR Level"].default_value = .15
    except Exception: pass
    ta = N.new("ShaderNodeTexImage"); ta.image = img(os.path.join(TEX, "moon_albedo.png")); L.new(ta.outputs["Color"], b.inputs["Base Color"])
    th = N.new("ShaderNodeTexImage"); th.image = img(os.path.join(TEX, "moon_height.png"), True); bn = N.new("ShaderNodeBump"); bn.inputs["Strength"].default_value = .55; bn.inputs["Distance"].default_value = r * .02
    L.new(th.outputs["Color"], bn.inputs["Height"]); L.new(bn.outputs["Normal"], b.inputs["Normal"])
    o = sphere("moon", r, loc, m, seg=128, rings=64); o.rotation_euler = (0, 0, rotz); return o
def world(strength=1.0):
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; N, L = nodes(w); bg = N["Background"]
    te = N.new("ShaderNodeTexEnvironment"); te.image = img(os.path.join(TEX, "stars_env.png")); L.new(te.outputs["Color"], bg.inputs["Color"]); bg.inputs["Strength"].default_value = strength
def sun(strength=4.5):
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 0)); o = bpy.context.object; o.data.energy = strength; o.data.angle = math.radians(.6)
    o.rotation_euler = (-SUN_DIR).to_track_quat("-Z", "Y").to_euler(); return o
def cam(loc, target, lens=35, ortho=None):
    c = link(bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))); c.location = loc; c.data.lens = lens; c.data.clip_end = 5000; c.data.sensor_width = 36
    if ortho: c.data.type = "ORTHO"; c.data.ortho_scale = ortho
    aim(c, target); sc.camera = c; return c
def key_cam(c, a, b, target_a, target_b, frames):
    for f in range(1, frames + 1):
        t = (f - 1) / (frames - 1); k = t * t * (3 - 2 * t); c.location = Vector(a).lerp(Vector(b), k); aim(c, Vector(target_a).lerp(Vector(target_b), k))
        c.keyframe_insert("location", frame=f); c.keyframe_insert("rotation_euler", frame=f)
def spin(o, z0, z1, frames):
    for f in (1, frames): o.rotation_euler[2] = z0 + (z1 - z0) * (f - 1) / (frames - 1); o.keyframe_insert("rotation_euler", frame=f)
    if o.animation_data and o.animation_data.action:
        for fc in o.animation_data.action.fcurves:
            for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
def studio_lights():
    def area(loc, energy, size, color):
        bpy.ops.object.light_add(type="AREA", location=loc); o = bpy.context.object; o.data.energy = energy; o.data.size = size; o.data.color = color; aim(o, (0, 0, 0))
    area((-28, -24, 22), 30000, 44, (1, .96, .9)); area((26, 20, 14), 16000, 36, (.55, .75, 1)); area((0, -34, -6), 5000, 50, (.7, .8, 1)); area((0, 0, 40), 6000, 40, (1, 1, 1))
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (.01, .012, .02, 1); bg.inputs["Strength"].default_value = .35

FR = 96
sc.frame_start, sc.frame_end = F0, F1
STEP = int(A[5]) if len(A) > 5 else 1
sc.frame_step = STEP
if PLATE:
    world(1.0); sun(4.2)
    if SHOT == "p3": SUN_DIR = Vector((0, 1, .03)).normalized()
    if SHOT == "p7": SUN_DIR = Vector((-1, .2, .08)).normalized()
    for o in sc.objects:
        if o.type == "LIGHT" and o.data.type == "SUN": o.rotation_euler = (-SUN_DIR).to_track_quat("-Z", "Y").to_euler()
    if SHOT == "p1":   # hook: low orbit over Earth, Moon far away
        E = earth(10, (0, 6, -10.7), 1.2); moon(2.6, (42, 150, 24), .5)
        for o in E[:2]: o.rotation_euler[0] = math.radians(95)
        c = cam((0, -3, .9), (0, 30, -.6), 30); key_cam(c, (0, -3, .9), (0, -1.4, 1.0), (0, 30, -.6), (1.5, 30, -.4), FR); spin(E[0], 1.2, 1.215, FR); spin(E[1], 1.6, 1.625, FR)
        for o in E[:2]: o.rotation_euler[0] = math.radians(95)
    elif SHOT == "p2":   # bird's eye of the Earth-Moon system with the Moon's orbit
        E = earth(10, (0, 0, 0), .4); moon(2.7, (56, 22, 0), 1.0); torus("orbit", 60.2, .07, (0, 0, 0), ring_mat("orb", (.35, .75, 1), 1.6), seg=256)
        c = cam((24, -48, 92), (26, 10, 0), 32); key_cam(c, (24, -48, 92), (30, -44, 90), (26, 10, 0), (30, 12, 0), FR); spin(E[0], .4, .45, FR); spin(E[1], .8, .86, FR)
    elif SHOT == "p3":   # Earth limb at sunrise behind the vehicle line-up
        E = earth(10, (0, 14, -11.3), 2.4)
        c = cam((0, -10, .4), (0, 20, -1.2), 28); key_cam(c, (-.8, -10, .4), (.8, -10, .5), (0, 20, -1.2), (0, 20, -1.1), FR); spin(E[0], 2.4, 2.41, FR); spin(E[1], 2.8, 2.815, FR)
    elif SHOT == "p4":   # straight-down bird's eye of Earth with the three orbits (orthographic, matches the HTML layout)
        E = earth(10, (0, 0, 0), .9); E[0].rotation_euler = (math.radians(62), 0, .9); E[1].rotation_euler = (math.radians(62), 0, 1.3)
        torus("r_bm", 13.5, .06, (0, 0, 0), ring_mat("c1", (.36, .78, 1), 2.2)); torus("r_or", 15.0, .06, (0, 0, 0), ring_mat("c2", (1, .71, .28), 2.2)); torus("r_ss", 12.2, .06, (0, 0, 0), ring_mat("c3", (.42, .89, .64), 2.2))
        c = cam((17.4, 0, 80), (17.4, 0, 0), 50, ortho=68); c.rotation_euler = (0, 0, 0); spin(E[0], .9, 1.0, FR); spin(E[1], 1.3, 1.42, FR); E[0].rotation_euler[0] = math.radians(62); E[1].rotation_euler[0] = math.radians(62)
    elif SHOT == "p5":   # docking space: Earth limb low-left, Moon far
        E = earth(10, (-16, 26, -12), 3.0); moon(2.0, (40, 160, 34), 2)
        c = cam((0, -8, 2), (0, 30, 1), 32); key_cam(c, (0, -8, 2), (1.2, -7, 2.4), (0, 30, 1), (0, 30, 1.6), FR); spin(E[0], 3.0, 3.015, FR); spin(E[1], 3.3, 3.32, FR)
    elif SHOT == "p6":   # Moon horizon with Earth hanging in the sky
        M = moon(10, (0, 8, -10.35), .3); M.rotation_euler = (math.radians(90), 0, .3); E = earth(4.0, (-22, 160, 14), 1.0)
        c = cam((0, -3, .55), (0, 30, .6), 30); key_cam(c, (0, -3, .55), (0, -1.6, .62), (0, 30, .6), (1.0, 30, .9), FR)
    elif SHOT == "p7":   # bird's eye of the Moon's south pole
        M = moon(10, (0, 0, 0), 0); M.rotation_euler = (math.radians(180 - 28), 0, 0)
        c = cam((0, -1, 24), (0, 0, 0), 40); key_cam(c, (0, -1, 24), (0, -1, 22.5), (0, 0, 0), (0, 0, 0), FR); M.rotation_euler = (math.radians(180 - 28), 0, 0)
        for f in (1, FR): M.rotation_euler[1] = math.radians(3 * (f - 1) / (FR - 1)); M.keyframe_insert("rotation_euler", frame=f)
    elif SHOT == "p8":   # Earth to Moon transfer with a trajectory arc
        E = earth(10, (-34, 0, 0), .7); moon(3.2, (38, 12, 4), 1.1)
        cu = bpy.data.curves.new("traj", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = .12; sp = cu.splines.new("BEZIER"); sp.bezier_points.add(2)
        for bp, co, h in zip(sp.bezier_points, [(-22, -6, 1), (4, -22, 6), (35, 8, 4.4)], [(8, -8, 1), (14, 0, 1), (4, 6, 0)]):
            bp.co = co; bp.handle_left = tuple(Vector(co) - Vector(h)); bp.handle_right = tuple(Vector(co) + Vector(h))
        tj = link(bpy.data.objects.new("traj", cu)); tj.data.materials.append(ring_mat("tj", (1, .71, .28), 3.0))
        c = cam((2, -88, 34), (2, 2, 0), 30); key_cam(c, (-2, -88, 34), (6, -86, 36), (2, 2, 0), (3, 3, 0), FR); spin(E[0], .7, .76, FR); spin(E[1], 1.1, 1.17, FR)
    elif SHOT == "p9":   # slow push toward the Moon, Earth behind
        moon(3.4, (0, 30, 0), .8); E = earth(10, (-46, 190, 12), 2.0)
        c = cam((0, -4, .6), (0, 40, 0), 34); key_cam(c, (0, -4, .6), (0, 6, .4), (0, 30, 0), (0, 30, 0), FR)
    # re-aim the sun if a shot changed SUN_DIR (shaders took the default at build time; sun lamp follows)
    for o in sc.objects:
        if o.type == "LIGHT" and o.data.type == "SUN": o.rotation_euler = (-SUN_DIR).to_track_quat("-Z", "Y").to_euler()
else:
    studio_lights()
    if SHOT in ("sls", "lander", "ship", "orion"):
        mk = {"sls": (make_sls, .62), "lander": (make_lander, 1.55), "ship": (make_ship, .66), "orion": (make_orion, 1.35)}[SHOT]
        obj = mk[0](mk[1]); bpy.context.view_layer.update(); pts = []
        def walk(o):
            for ch in o.children:
                if ch.type == "MESH":
                    for cc in ch.bound_box: pts.append(ch.matrix_world @ Vector(cc))
                walk(ch)
        walk(obj)
        lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
        ctr = (lo + hi) / 2; ext = hi - lo; rad = max(ext.x, ext.y) * .5; d = max(ext.z, ext.x, ext.y) * 1.18 * (50 / 36) + rad
        pivot = link(bpy.data.objects.new("pivot", None)); pivot.location = ctr; obj.parent = pivot; obj.location = obj.location - ctr
        c = cam((ctr.x, ctr.y - d, ctr.z + d * .10), tuple(ctr), 50)
        for f in range(1, FR + 2): pivot.rotation_euler = (math.radians(-6), 0, math.radians(38 * math.sin(2 * math.pi * (f - 1) / FR))); pivot.keyframe_insert("rotation_euler", frame=f)
    elif SHOT == "dock_lander":
        lan = make_lander(1.0); ori = make_orion(.55); c = cam((0, -36, 5), (4, 0, 2.5), 42)
        for f in range(1, FR + 1):
            t = f / FR; k = min(1, t / .82); k = k * k * (3 - 2 * k)
            ori.location = (4.98 + 4.25 * .55 + 17 * (1 - k), -2.0 * (1 - k), 5.4 + 3.0 * (1 - k)); ori.rotation_euler = (0, math.radians(-90), 0)
            ori.keyframe_insert("location", frame=f); ori.keyframe_insert("rotation_euler", frame=f); lan.rotation_euler = (0, 0, math.radians(-8 + 10 * t)); lan.keyframe_insert("rotation_euler", frame=f)
    elif SHOT == "dock_ship":
        sh = make_ship(.55); ori = make_orion(.5); c = cam((0, -40, 12), (0, 0, 11), 46)
        for f in range(1, FR + 1):
            t = f / FR; k = min(1, t / .82); k = k * k * (3 - 2 * k)
            ori.location = (0, 0, 27.65 * .55 + 4.25 * .5 + 15 * (1 - k)); ori.rotation_euler = (math.radians(180), 0, 0)
            ori.keyframe_insert("location", frame=f); ori.keyframe_insert("rotation_euler", frame=f); sh.rotation_euler = (0, 0, math.radians(-10 + 14 * t)); sh.keyframe_insert("rotation_euler", frame=f)

MASK = bool(os.environ.get("MASK"))
if MASK:   # silhouette pass: planets, rings and arcs white, sky black, atmosphere glow left to the luma key
    wm = bpy.data.materials.new("maskw"); wm.use_nodes = True; N, L = nodes(wm); N.remove(N["Principled BSDF"]); em = N.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 1.0
    L.new(em.outputs["Emission"], N["Material Output"].inputs["Surface"])
    for o in list(sc.objects):
        if o.type == "LIGHT": o.hide_render = True
        elif o.name.startswith("atmo"): o.hide_render = True
        elif o.type in ("MESH", "CURVE"):
            o.data.materials.clear(); o.data.materials.append(wm)
    sc.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.0
    sc.view_settings.view_transform = "Standard"; sc.cycles.samples = 4; sc.cycles.use_denoising = False; sc.cycles.max_bounces = 0
    sc.render.image_settings.color_mode = "BW"
out = os.path.join(HERE, "frames3", SHOT + ("_mask" if MASK else "")); os.makedirs(out, exist_ok=True)
if F0 == F1:
    sc.frame_set(F0); sc.render.filepath = os.path.join(out, f"f_{F0:04d}.png"); bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = os.path.join(out, "f_"); bpy.ops.render.render(animation=True)
print("rendered", SHOT, F0, F1)
