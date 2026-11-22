"""Blender (bpy) shots for the Artemis III video: original low-detail 3D models of Orion, SLS, a Blue Moon-style lander and a Starship-style vehicle,
turntables and two docking animations, rendered with Cycles on CPU to transparent PNG sequences.
usage: python scene3d.py <shot> <frame_start> <frame_end> [samples] [res]
shots: sls | lander | ship | dock_lander | dock_ship | orion"""
import bpy, math, sys, os
from mathutils import Vector, Euler

SHOT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else sys.argv[1]
args = sys.argv[sys.argv.index("--") + 2:] if "--" in sys.argv else sys.argv[2:]
F0, F1 = int(args[0]), int(args[1]); SAMPLES = int(args[2]) if len(args) > 2 else 24; RES = int(args[3]) if len(args) > 3 else 800
FPS = 24

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
try: sc.cycles.denoiser = "OPENIMAGEDENOISE"
except Exception: pass
sc.render.film_transparent = True; sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
sc.render.fps = FPS; sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 2; sc.cycles.glossy_bounces = 4
sc.view_settings.view_transform = "Filmic" if "Filmic" in [e.identifier for e in bpy.types.ColorManagedViewSettings.bl_rna.properties["view_transform"].enum_items] else "Standard"
W_, H_ = {"dock_lander": (860, 700), "dock_ship": (760, 760), "sls": (520, 900), "ship": (520, 900)}.get(SHOT, (RES, RES))
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W_, H_, 100

def mat(name, color, metal=0.0, rough=0.5, emit=None, spec=0.4, bump=0.0, bump_scale=60.0, rough_var=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Metallic"].default_value = metal; b.inputs["Roughness"].default_value = rough
    try: b.inputs["Specular IOR Level"].default_value = spec
    except Exception: pass
    if emit: b.inputs["Emission Color"].default_value = (*emit, 1); b.inputs["Emission Strength"].default_value = 3.0
    if bump or rough_var:
        tc = nt.nodes.new("ShaderNodeTexCoord"); no = nt.nodes.new("ShaderNodeTexNoise"); no.inputs["Scale"].default_value = bump_scale; no.inputs["Detail"].default_value = 8; no.inputs["Roughness"].default_value = .62
        nt.links.new(tc.outputs["Object"], no.inputs["Vector"])
        if bump:
            bn = nt.nodes.new("ShaderNodeBump"); bn.inputs["Strength"].default_value = bump; bn.inputs["Distance"].default_value = .05
            nt.links.new(no.outputs["Fac"], bn.inputs["Height"]); nt.links.new(bn.outputs["Normal"], b.inputs["Normal"])
        if rough_var:
            mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = max(0, rough - rough_var); mr.inputs["To Max"].default_value = min(1, rough + rough_var)
            nt.links.new(no.outputs["Fac"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])
    return m
# matte, realistic: painted white (soft sheen + faint dirt/streak variation), crinkled foil, brushed stainless, rough foam
WHITE = mat("white", (.78, .79, .80), 0.0, .62, spec=.35, bump=.04, bump_scale=14, rough_var=.12)
ORANGE = mat("orange", (.66, .30, .09), 0.0, .88, spec=.2, bump=.18, bump_scale=70, rough_var=.06)
GOLD = mat("gold", (.72, .52, .18), 1.0, .46, spec=.5, bump=.9, bump_scale=34, rough_var=.12)
STEEL = mat("steel", (.52, .53, .55), .9, .52, spec=.4, bump=.05, bump_scale=120, rough_var=.15)
DARK = mat("dark", (.05, .055, .065), .3, .62, spec=.3, bump=.06, bump_scale=40)
BLACK = mat("black", (.015, .015, .018), .0, .6, spec=.2)
PANEL = mat("panel", (.03, .09, .24), .55, .5, spec=.35)
GLOW = mat("glow", (1, .6, .2), 0, .5, emit=(1, .6, .2))

# grid lines on solar panels
pm = PANEL.node_tree; tc = pm.nodes.new("ShaderNodeTexCoord"); br = pm.nodes.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = 18; br.inputs["Color1"].default_value = (.03, .10, .26, 1); br.inputs["Color2"].default_value = (.04, .12, .30, 1); br.inputs["Mortar"].default_value = (.45, .55, .7, 1); br.inputs["Mortar Size"].default_value = .02
pm.links.new(tc.outputs["UV"], br.inputs["Vector"]); pm.links.new(br.outputs["Color"], pm.nodes["Principled BSDF"].inputs["Base Color"])

def assign(o, m): o.data.materials.clear(); o.data.materials.append(m); return o
def cyl(name, r, h, loc, m, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts); o = bpy.context.object; o.name = name; bpy.ops.object.shade_smooth(); return assign(o, m)
def cone(name, r1, r2, h, loc, m, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, location=loc, rotation=rot, vertices=verts); o = bpy.context.object; o.name = name; bpy.ops.object.shade_smooth(); return assign(o, m)
def box(name, sx, sy, sz, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.object; o.scale = (sx, sy, sz); o.name = name; return assign(o, m)
def sphere(name, r, loc, m, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24); o = bpy.context.object; o.scale = scale; bpy.ops.object.shade_smooth(); o.name = name; return assign(o, m)
def torus(name, R, r, loc, m):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, major_segments=48, minor_segments=10); o = bpy.context.object; bpy.ops.object.shade_smooth(); o.name = name; return assign(o, m)
def group(name, objs, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(e); e.location = loc
    for o in objs: o.parent = e; o.matrix_parent_inverse = e.matrix_world.inverted()
    return e

def make_orion(scale=1.0, loc=(0, 0, 0)):
    p = []
    p.append(cone("cm", 2.5, 0.5, 3.3, (0, 0, 3.55), WHITE)); p.append(cyl("hs", 2.55, .25, (0, 0, 1.85), DARK))
    p.append(cyl("sm", 2.5, 4.0, (0, 0, -.25), GOLD))
    for z in (-1.6, -.5, .6): p.append(torus("rib", 2.52, .06, (0, 0, z), ORANGE))
    p.append(cone("eng", .55, 1.3, 1.6, (0, 0, -3.05), DARK))
    for a in range(4):
        ang = math.radians(45 + 90 * a); ca, sa = math.cos(ang), math.sin(ang)
        for i in range(3):
            d = 3.6 + i * 2.55
            p.append(box("pan", 2.3, .06, 5.2, (ca * (d + 1.25), sa * (d + 1.25), -.2), PANEL, rot=(0, 0, ang) if False else (0, 0, ang)))
        p.append(cyl("strut", .08, 3.8, (ca * 3.0, sa * 3.0, -.2), DARK, rot=(0, math.radians(90), ang)))
    for w in range(2): p.append(box("win", .5, .05, .35, (0, -1.2 + w * 0, 3.3), BLACK))
    e = group("orion", p, loc); e.scale = (scale,) * 3; return e
def make_sls(scale=1.0, loc=(0, 0, 0)):
    p = [cyl("core", 4.2, 58, (0, 0, 0), ORANGE), cyl("inter", 2.6, 6, (0, 0, 32), WHITE), cyl("icps", 2.5, 8, (0, 0, 39), WHITE), cone("cone", 2.5, 0.6, 3, (0, 0, 44.5), WHITE)]
    for k in (-1, 1):
        p.append(cyl("srb", 1.95, 50, (k * 6.6, 0, -4), WHITE)); p.append(cone("nose", 1.95, .5, 6, (k * 6.6, 0, 24), WHITE)); p.append(cyl("band", 1.97, 1.2, (k * 6.6, 0, -4), BLACK)); p.append(cone("noz", 1.1, 2.0, 3.5, (k * 6.6, 0, -31.5), DARK))
    for i in range(4): a = math.radians(45 + 90 * i); p.append(cone("rs", .55, 1.4, 2.4, (math.cos(a) * 1.9, math.sin(a) * 1.9, -30.5), DARK))
    for z in (-14, 3, 20): p.append(torus("ring", 4.22, .07, (0, 0, z), BLACK))
    e = group("sls", p, loc); e.scale = (scale,) * 3; return e
def make_lander(scale=1.0, loc=(0, 0, 0)):
    p = [cyl("body", 3.6, 9.5, (0, 0, 0), WHITE), sphere("dome", 3.6, (0, 0, 4.7), STEEL, (1, 1, .72)), cyl("band", 3.62, .5, (0, 0, 1.2), mat("blueband", (.2, .6, .9), .1, .3, emit=(.2, .6, .9))), cyl("band2", 3.62, .15, (0, 0, -2.5), DARK)]
    p.append(sphere("win", .8, (0, -3.0, 5.6), BLACK, (1, .35, 1)))
    p.append(cyl("port", .9, 1.4, (4.0, 0, 5.0), DARK, rot=(0, math.radians(90), 0))); p.append(cyl("ring", 1.15, .25, (4.8, 0, 5.0), STEEL, rot=(0, math.radians(90), 0)))
    p.append(cone("eng", .9, 1.9, 2.0, (0, 0, -5.9), DARK))
    for i in range(4):
        a = math.radians(45 + 90 * i); ca, sa = math.cos(a), math.sin(a)
        p.append(cyl("leg", .22, 8.2, (ca * 5.4, sa * 5.4, -4.6), STEEL, rot=(sa * .4 * -1 * 0, 0, 0)))
        L = p[-1]; L.rotation_euler = Euler((math.radians(-24) * sa, math.radians(24) * ca, 0)); p.append(cyl("pad", .8, .22, (ca * 7.2, sa * 7.2, -8.6), DARK))
    e = group("lander", p, loc); e.scale = (scale,) * 3; return e
def make_ship(scale=1.0, loc=(0, 0, 0)):
    p = [cyl("body", 4.5, 40, (0, 0, 0), STEEL, verts=64), sphere("nose", 4.5, (0, 0, 20), STEEL, (1, 1, 1.55)), cyl("skirt", 4.55, 3.5, (0, 0, -21.5), DARK), cyl("dock", 1.2, 1.0, (0, 0, 26.7), DARK), cyl("dockr", 1.5, .25, (0, 0, 27.3), BLACK)]
    for z in (-8, 6, 14): p.append(torus("weld", 4.52, .07, (0, 0, z), DARK))
    for s in (-1, 1):
        p.append(box("ffl", .3, 4.4, 8, (s * 5.1, 0, 15.5), STEEL, rot=(0, s * math.radians(-14), 0))); p.append(box("afl", .4, 6.2, 12, (s * 5.8, 0, -13), STEEL, rot=(0, s * math.radians(-10), 0)))
    for i in range(6): a = math.radians(60 * i); p.append(cone("raptor", .5, .9, 1.4, (math.cos(a) * 2.2, math.sin(a) * 2.2, -24.2), DARK))
    e = group("ship", p, loc); e.scale = (scale,) * 3; return e

def lights():
    def area(name, loc, energy, size, color=(1, 1, 1), target=(0, 0, 0)):
        bpy.ops.object.light_add(type="AREA", location=loc); o = bpy.context.object; o.data.energy = energy; o.data.size = size; o.data.color = color
        d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler(); return o
    area("key", (-28, -24, 22), 30000, 44, (1, .96, .9)); area("rim", (26, 20, 14), 16000, 36, (.55, .75, 1)); area("fill", (0, -34, -6), 5000, 50, (.7, .8, 1)); area("top", (0, 0, 40), 6000, 40, (1, 1, 1))
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (.01, .012, .02, 1); bg.inputs["Strength"].default_value = 0.35

def camera(loc, target, lens=50, ortho=None):
    bpy.ops.object.camera_add(location=loc); c = bpy.context.object; c.data.lens = lens; sc.camera = c
    d = Vector(target) - Vector(loc); c.rotation_euler = d.to_track_quat("-Z", "Y").to_euler(); return c

lights()
N = F1 + 1
sc.frame_start, sc.frame_end = F0, F1
def ease(t): return t * t * (3 - 2 * t)

if SHOT in ("sls", "lander", "ship", "orion"):
    mk = {"sls": (make_sls, .62), "lander": (make_lander, 1.65), "ship": (make_ship, .66), "orion": (make_orion, 1.4)}[SHOT]
    obj = mk[0](mk[1], (0, 0, 0)); bpy.context.view_layer.update()
    pts = []
    for ch in obj.children:
        for c in ch.bound_box: pts.append(ch.matrix_world @ Vector(c))
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    ctr = (lo + hi) / 2; ext = hi - lo; lens = 50
    fw = ext.z if W_ < H_ else max(ext.z, ext.x)
    rad = max(ext.x, ext.y) * .5
    d = max(ext.z, ext.x, ext.y) * 1.18 * (lens / 36) + rad
    # rotate the object about its own centre (turntable)
    pivot = bpy.data.objects.new("pivot", None); bpy.context.collection.objects.link(pivot); pivot.location = ctr
    obj.parent = pivot; obj.location = obj.location - ctr
    camera((ctr.x, ctr.y - d, ctr.z + d * .10), tuple(ctr), lens=lens)
    LOOP = 96
    for f in range(1, LOOP + 2):   # gentle sway (period = LOOP frames) so the clip loops seamlessly
        pivot.rotation_euler = (math.radians(-6), 0, math.radians(38 * math.sin(2 * math.pi * (f - 1) / LOOP))); pivot.keyframe_insert("rotation_euler", frame=f)
elif SHOT == "dock_lander":
    lan = make_lander(1.0, (0, 0, 0)); ori = make_orion(.55, (0, 0, 0))
    camera((0, -34, 6), (4, 0, 3), lens=42)
    # lander slowly turns; Orion approaches the side port (x=+5.8, z=5) with its nose pointing toward the port (-x)
    for f in range(1, 97):
        t = f / 96.0; k = ease(min(1, t / .82))
        ori.location = (5.0 + 2.9 + 17 * (1 - k), -2.0 * (1 - k), 5.0 + 3.0 * (1 - k)); ori.rotation_euler = (math.radians(-90 * 0), math.radians(90), 0)
        ori.keyframe_insert("location", frame=f); ori.keyframe_insert("rotation_euler", frame=f)
        lan.rotation_euler = (0, 0, math.radians(-8 + 10 * t)); lan.keyframe_insert("rotation_euler", frame=f)
elif SHOT == "dock_ship":
    sh = make_ship(.55, (0, 0, 0)); ori = make_orion(.5, (0, 0, 0))
    camera((0, -38, 14), (0, 0, 12), lens=46)
    for f in range(1, 97):
        t = f / 96.0; k = ease(min(1, t / .82))
        ori.location = (0, 0, 27.3 * .55 + 3.0 + 15 * (1 - k)); ori.rotation_euler = (math.radians(180), 0, 0)
        ori.keyframe_insert("location", frame=f); ori.keyframe_insert("rotation_euler", frame=f)
        sh.rotation_euler = (0, 0, math.radians(-10 + 14 * t)); sh.keyframe_insert("rotation_euler", frame=f)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frames2", SHOT)
os.makedirs(out, exist_ok=True)
sc.render.filepath = os.path.join(out, "f_")
if F0 == F1:
    sc.frame_set(F0); sc.render.filepath = os.path.join(out, f"f_{F0:04d}.png"); bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
print("rendered", SHOT, F0, F1)
