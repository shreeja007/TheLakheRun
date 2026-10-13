"""
Script to build articulated Lakhey Blockout (v0.2) with joint pivot hierarchy:
- LeftArmRoot & RightArmRoot (shoulder pivots)
- LeftLegRoot & RightLegRoot (hip pivots)
- ManeRoot (neck/hair pivot)
- HeadRoot (neck collar pivot)
- TorsoRoot (pelvis/belt pivot)
"""

import os
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

def hex_to_rgba(hex_str):
    h = hex_str.lstrip('#')
    return [int(h[0:2], 16)/255.0, int(h[2:4], 16)/255.0, int(h[4:6], 16)/255.0, 1.0]

MAT_CRIMSON = PBRMaterial(name="Mat_LakheyCrimson", baseColorFactor=hex_to_rgba("#A31D1D"), roughnessFactor=0.6, metallicFactor=0.05)
MAT_GOLD = PBRMaterial(name="Mat_LakheyGold", baseColorFactor=hex_to_rgba("#E5A93C"), roughnessFactor=0.35, metallicFactor=0.4)
MAT_MANE = PBRMaterial(name="Mat_LakheyMane", baseColorFactor=hex_to_rgba("#1A1412"), roughnessFactor=0.8, metallicFactor=0.0)
MAT_FACE = PBRMaterial(name="Mat_LakheyFace", baseColorFactor=hex_to_rgba("#C2410C"), roughnessFactor=0.65, metallicFactor=0.0)
MAT_SKIN = PBRMaterial(name="Mat_LakheySkin", baseColorFactor=hex_to_rgba("#C89568"), roughnessFactor=0.6, metallicFactor=0.0)
MAT_BOOTS = PBRMaterial(name="Mat_LakheyBoots", baseColorFactor=hex_to_rgba("#1E242B"), roughnessFactor=0.7, metallicFactor=0.05)
MAT_IVORY = PBRMaterial(name="Mat_LakheyFangs", baseColorFactor=hex_to_rgba("#FFFBEB"), roughnessFactor=0.3, metallicFactor=0.0)
MAT_EYES = PBRMaterial(name="Mat_LakheyEyes", baseColorFactor=hex_to_rgba("#FF7A00"), emissiveFactor=[1.0, 0.45, 0.0], roughnessFactor=0.2, metallicFactor=0.1)

def apply_mat(mesh, material):
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh

def build_scene():
    scene = trimesh.Scene()

    # =========================================================================
    # 1. TORSO ROOT (Pivot at [0, 1.15, 0])
    # =========================================================================
    scene.graph.update(frame_to='TorsoRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0, 1.15, 0]))

    # Lower Skirt & Gold Border
    skirt_lower = trimesh.creation.box([1.10, 0.22, 0.65])
    skirt_lower.apply_translation([0, 0.69 - 1.15, 0])
    scene.add_geometry(apply_mat(skirt_lower, MAT_CRIMSON), node_name='Skirt_Lower')
    scene.graph.update(frame_to='Skirt_Lower', frame_from='TorsoRoot')

    skirt_border = trimesh.creation.box([1.14, 0.08, 0.68])
    skirt_border.apply_translation([0, 0.62 - 1.15, 0])
    scene.add_geometry(apply_mat(skirt_border, MAT_GOLD), node_name='Skirt_Gold_Border')
    scene.graph.update(frame_to='Skirt_Gold_Border', frame_from='TorsoRoot')

    # Mid Skirt & Upper Skirt
    skirt_mid = trimesh.creation.box([0.90, 0.24, 0.55])
    skirt_mid.apply_translation([0, 0.88 - 1.15, 0])
    scene.add_geometry(apply_mat(skirt_mid, MAT_CRIMSON), node_name='Skirt_Mid')
    scene.graph.update(frame_to='Skirt_Mid', frame_from='TorsoRoot')

    skirt_upper = trimesh.creation.box([0.72, 0.18, 0.45])
    skirt_upper.apply_translation([0, 1.05 - 1.15, 0])
    scene.add_geometry(apply_mat(skirt_upper, MAT_CRIMSON), node_name='Skirt_Upper')
    scene.graph.update(frame_to='Skirt_Upper', frame_from='TorsoRoot')

    # Ceremonial Belt & Pendant Sash
    belt = trimesh.creation.box([0.76, 0.10, 0.48])
    belt.apply_translation([0, 1.13 - 1.15, 0])
    scene.add_geometry(apply_mat(belt, MAT_GOLD), node_name='Ceremonial_Belt')
    scene.graph.update(frame_to='Ceremonial_Belt', frame_from='TorsoRoot')

    pendant = trimesh.creation.box([0.18, 0.38, 0.04])
    pendant.apply_translation([0, 0.92 - 1.15, -0.24])
    scene.add_geometry(apply_mat(pendant, MAT_GOLD), node_name='Belt_Pendant_Sash')
    scene.graph.update(frame_to='Belt_Pendant_Sash', frame_from='TorsoRoot')

    # Upper Chest & Brocade Yoke
    chest = trimesh.creation.box([0.82, 0.45, 0.42])
    chest.apply_translation([0, 1.40 - 1.15, 0])
    scene.add_geometry(apply_mat(chest, MAT_CRIMSON), node_name='Chest_Tunic')
    scene.graph.update(frame_to='Chest_Tunic', frame_from='TorsoRoot')

    upper_chest = trimesh.creation.box([0.86, 0.32, 0.44])
    upper_chest.apply_translation([0, 1.68 - 1.15, 0])
    scene.add_geometry(apply_mat(upper_chest, MAT_CRIMSON), node_name='Upper_Chest')
    scene.graph.update(frame_to='Upper_Chest', frame_from='TorsoRoot')

    yoke = trimesh.creation.box([0.48, 0.35, 0.04])
    rot_yoke = trimesh.transformations.rotation_matrix(np.radians(45), [0, 0, 1])
    yoke.apply_transform(rot_yoke)
    yoke.apply_translation([0, 1.62 - 1.15, -0.22])
    scene.add_geometry(apply_mat(yoke, MAT_GOLD), node_name='Brocade_Yoke')
    scene.graph.update(frame_to='Brocade_Yoke', frame_from='TorsoRoot')

    # Epaulets
    for side, x in [("L", 0.42), ("R", -0.42)]:
        epaulet = trimesh.creation.box([0.14, 0.12, 0.42])
        epaulet.apply_translation([x, 1.76 - 1.15, 0])
        scene.add_geometry(apply_mat(epaulet, MAT_GOLD), node_name=f'Epaulet_{side}')
        scene.graph.update(frame_to=f'Epaulet_{side}', frame_from='TorsoRoot')

    # =========================================================================
    # 2. HEAD ROOT (Pivot at [0, 1.88, 0])
    # =========================================================================
    scene.graph.update(frame_to='HeadRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0, 1.88, 0]))

    neck = trimesh.creation.cylinder(radius=0.13, height=0.18, sections=12)
    neck.apply_translation([0, 0, 0])
    scene.add_geometry(apply_mat(neck, MAT_SKIN), node_name='Head_Neck')
    scene.graph.update(frame_to='Head_Neck', frame_from='HeadRoot')

    face = trimesh.creation.icosphere(subdivisions=2, radius=0.22)
    face.apply_scale([0.95, 1.18, 0.85])
    face.apply_translation([0, 2.04 - 1.88, -0.16])
    scene.add_geometry(apply_mat(face, MAT_FACE), node_name='Head_Mask_Visage')
    scene.graph.update(frame_to='Head_Mask_Visage', frame_from='HeadRoot')

    crest = trimesh.creation.box([0.34, 0.28, 0.06])
    crest.apply_translation([0, 2.26 - 1.88, -0.18])
    scene.add_geometry(apply_mat(crest, MAT_GOLD), node_name='Head_Golden_Crest')
    scene.graph.update(frame_to='Head_Golden_Crest', frame_from='HeadRoot')

    # Eyebrows
    brow_l = trimesh.creation.box([0.16, 0.05, 0.08])
    rot_b_l = trimesh.transformations.rotation_matrix(np.radians(-15), [0, 0, 1])
    brow_l.apply_transform(rot_b_l)
    brow_l.apply_translation([0.10, 2.14 - 1.88, -0.30])
    scene.add_geometry(apply_mat(brow_l, MAT_MANE), node_name='Head_Eyebrow_Left')
    scene.graph.update(frame_to='Head_Eyebrow_Left', frame_from='HeadRoot')

    brow_r = trimesh.creation.box([0.16, 0.05, 0.08])
    rot_b_r = trimesh.transformations.rotation_matrix(np.radians(15), [0, 0, 1])
    brow_r.apply_transform(rot_b_r)
    brow_r.apply_translation([-0.10, 2.14 - 1.88, -0.30])
    scene.add_geometry(apply_mat(brow_r, MAT_MANE), node_name='Head_Eyebrow_Right')
    scene.graph.update(frame_to='Head_Eyebrow_Right', frame_from='HeadRoot')

    # Almond Glowing Eyes
    for side, x in [("L", 0.10), ("R", -0.10)]:
        eye = trimesh.creation.box([0.08, 0.06, 0.04])
        eye.apply_translation([x, 2.06 - 1.88, -0.32])
        scene.add_geometry(apply_mat(eye, MAT_EYES), node_name=f'Head_Eye_{side}')
        scene.graph.update(frame_to=f'Head_Eye_{side}', frame_from='HeadRoot')

    # Mouth & Fangs
    mouth = trimesh.creation.box([0.26, 0.08, 0.06])
    mouth.apply_translation([0, 1.94 - 1.88, -0.30])
    scene.add_geometry(apply_mat(mouth, MAT_MANE), node_name='Head_Mouth')
    scene.graph.update(frame_to='Head_Mouth', frame_from='HeadRoot')

    for side, x in [("L", 0.08), ("R", -0.08)]:
        fang = trimesh.creation.cone(radius=0.035, height=0.09, sections=8)
        rot_f = trimesh.transformations.rotation_matrix(np.radians(180), [1, 0, 0])
        fang.apply_transform(rot_f)
        fang.apply_translation([x, 1.93 - 1.88, -0.31])
        scene.add_geometry(apply_mat(fang, MAT_IVORY), node_name=f'Head_Fang_{side}')
        scene.graph.update(frame_to=f'Head_Fang_{side}', frame_from='HeadRoot')

    # =========================================================================
    # 3. MANE ROOT (Pivot at [0, 2.00, 0.10])
    # =========================================================================
    scene.graph.update(frame_to='ManeRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0, 2.00, 0.10]))

    mane_top = trimesh.creation.icosphere(subdivisions=2, radius=0.30)
    mane_top.apply_scale([1.12, 1.05, 1.15])
    mane_top.apply_translation([0, 2.22 - 2.00, 0.05 - 0.10])
    scene.add_geometry(apply_mat(mane_top, MAT_MANE), node_name='Mane_Crown')
    scene.graph.update(frame_to='Mane_Crown', frame_from='ManeRoot')

    mane_upper = trimesh.creation.box([0.96, 0.38, 0.38])
    mane_upper.apply_translation([0, 2.10 - 2.00, 0.16 - 0.10])
    scene.add_geometry(apply_mat(mane_upper, MAT_MANE), node_name='Mane_Upper')
    scene.graph.update(frame_to='Mane_Upper', frame_from='ManeRoot')

    mane_mid = trimesh.creation.box([0.86, 0.35, 0.32])
    mane_mid.apply_translation([0, 1.82 - 2.00, 0.20 - 0.10])
    scene.add_geometry(apply_mat(mane_mid, MAT_MANE), node_name='Mane_Mid')
    scene.graph.update(frame_to='Mane_Mid', frame_from='ManeRoot')

    mane_lower = trimesh.creation.box([0.72, 0.30, 0.24])
    mane_lower.apply_translation([0, 1.54 - 2.00, 0.22 - 0.10])
    scene.add_geometry(apply_mat(mane_lower, MAT_MANE), node_name='Mane_Lower')
    scene.graph.update(frame_to='Mane_Lower', frame_from='ManeRoot')

    for side, x in [("L", 0.36), ("R", -0.36)]:
        tress = trimesh.creation.cylinder(radius=0.12, height=0.65, sections=10)
        tress.apply_translation([x, 1.85 - 2.00, -0.05 - 0.10])
        scene.add_geometry(apply_mat(tress, MAT_MANE), node_name=f'Mane_Tress_{side}')
        scene.graph.update(frame_to=f'Mane_Tress_{side}', frame_from='ManeRoot')

    # =========================================================================
    # 4. LEFT ARM ROOT (Shoulder Pivot at [0.42, 1.76, 0])
    # =========================================================================
    scene.graph.update(frame_to='LeftArmRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0.42, 1.76, 0]))

    # Local arm geometry pointing downwards (neutral T/A pose)
    rot_arm_l = trimesh.transformations.rotation_matrix(np.radians(-24), [0, 0, 1])

    arm_up_l = trimesh.creation.cylinder(radius=0.10, height=0.42, sections=12)
    arm_up_l.apply_transform(rot_arm_l)
    arm_up_l.apply_translation([0.45 - 0.42, 1.60 - 1.76, 0])
    scene.add_geometry(apply_mat(arm_up_l, MAT_CRIMSON), node_name='Arm_Upper_L')
    scene.graph.update(frame_to='Arm_Upper_L', frame_from='LeftArmRoot')

    arm_fore_l = trimesh.creation.cylinder(radius=0.085, height=0.38, sections=12)
    arm_fore_l.apply_transform(rot_arm_l)
    arm_fore_l.apply_translation([0.62 - 0.42, 1.28 - 1.76, 0])
    scene.add_geometry(apply_mat(arm_fore_l, MAT_CRIMSON), node_name='Arm_Forearm_L')
    scene.graph.update(frame_to='Arm_Forearm_L', frame_from='LeftArmRoot')

    cuff_l = trimesh.creation.cylinder(radius=0.105, height=0.14, sections=12)
    cuff_l.apply_transform(rot_arm_l)
    cuff_l.apply_translation([0.72 - 0.42, 1.10 - 1.76, 0])
    scene.add_geometry(apply_mat(cuff_l, MAT_GOLD), node_name='Arm_Cuff_L')
    scene.graph.update(frame_to='Arm_Cuff_L', frame_from='LeftArmRoot')

    hand_l = trimesh.creation.box([0.10, 0.16, 0.08])
    hand_l.apply_transform(rot_arm_l)
    hand_l.apply_translation([0.78 - 0.42, 0.98 - 1.76, 0])
    scene.add_geometry(apply_mat(hand_l, MAT_SKIN), node_name='Arm_Hand_L')
    scene.graph.update(frame_to='Arm_Hand_L', frame_from='LeftArmRoot')

    # =========================================================================
    # 5. RIGHT ARM ROOT (Shoulder Pivot at [-0.42, 1.76, 0])
    # =========================================================================
    scene.graph.update(frame_to='RightArmRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([-0.42, 1.76, 0]))

    rot_arm_r = trimesh.transformations.rotation_matrix(np.radians(24), [0, 0, 1])

    arm_up_r = trimesh.creation.cylinder(radius=0.10, height=0.42, sections=12)
    arm_up_r.apply_transform(rot_arm_r)
    arm_up_r.apply_translation([-0.45 - (-0.42), 1.60 - 1.76, 0])
    scene.add_geometry(apply_mat(arm_up_r, MAT_CRIMSON), node_name='Arm_Upper_R')
    scene.graph.update(frame_to='Arm_Upper_R', frame_from='RightArmRoot')

    arm_fore_r = trimesh.creation.cylinder(radius=0.085, height=0.38, sections=12)
    arm_fore_r.apply_transform(rot_arm_r)
    arm_fore_r.apply_translation([-0.62 - (-0.42), 1.28 - 1.76, 0])
    scene.add_geometry(apply_mat(arm_fore_r, MAT_CRIMSON), node_name='Arm_Forearm_R')
    scene.graph.update(frame_to='Arm_Forearm_R', frame_from='RightArmRoot')

    cuff_r = trimesh.creation.cylinder(radius=0.105, height=0.14, sections=12)
    cuff_r.apply_transform(rot_arm_r)
    cuff_r.apply_translation([-0.72 - (-0.42), 1.10 - 1.76, 0])
    scene.add_geometry(apply_mat(cuff_r, MAT_GOLD), node_name='Arm_Cuff_R')
    scene.graph.update(frame_to='Arm_Cuff_R', frame_from='RightArmRoot')

    hand_r = trimesh.creation.box([0.10, 0.16, 0.08])
    hand_r.apply_transform(rot_arm_r)
    hand_r.apply_translation([-0.78 - (-0.42), 0.98 - 1.76, 0])
    scene.add_geometry(apply_mat(hand_r, MAT_SKIN), node_name='Arm_Hand_R')
    scene.graph.update(frame_to='Arm_Hand_R', frame_from='RightArmRoot')

    # =========================================================================
    # 6. LEFT LEG ROOT (Hip Pivot at [0.18, 0.65, 0])
    # =========================================================================
    scene.graph.update(frame_to='LeftLegRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0.18, 0.65, 0]))

    leg_l = trimesh.creation.cylinder(radius=0.10, height=0.45, sections=12)
    leg_l.apply_translation([0, 0.45 - 0.65, 0])
    scene.add_geometry(apply_mat(leg_l, MAT_CRIMSON), node_name='Leg_L')
    scene.graph.update(frame_to='Leg_L', frame_from='LeftLegRoot')

    cuff_leg_l = trimesh.creation.box([0.22, 0.08, 0.26])
    cuff_leg_l.apply_translation([0, 0.22 - 0.65, -0.02])
    scene.add_geometry(apply_mat(cuff_leg_l, MAT_GOLD), node_name='Leg_Cuff_L')
    scene.graph.update(frame_to='Leg_Cuff_L', frame_from='LeftLegRoot')

    boot_l = trimesh.creation.box([0.18, 0.20, 0.34])
    boot_l.apply_translation([0, 0.10 - 0.65, -0.02])
    scene.add_geometry(apply_mat(boot_l, MAT_BOOTS), node_name='Boot_L')
    scene.graph.update(frame_to='Boot_L', frame_from='LeftLegRoot')

    # =========================================================================
    # 7. RIGHT LEG ROOT (Hip Pivot at [-0.18, 0.65, 0])
    # =========================================================================
    scene.graph.update(frame_to='RightLegRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([-0.18, 0.65, 0]))

    leg_r = trimesh.creation.cylinder(radius=0.10, height=0.45, sections=12)
    leg_r.apply_translation([0, 0.45 - 0.65, 0])
    scene.add_geometry(apply_mat(leg_r, MAT_CRIMSON), node_name='Leg_R')
    scene.graph.update(frame_to='Leg_R', frame_from='RightLegRoot')

    cuff_leg_r = trimesh.creation.box([0.22, 0.08, 0.26])
    cuff_leg_r.apply_translation([0, 0.22 - 0.65, -0.02])
    scene.add_geometry(apply_mat(cuff_leg_r, MAT_GOLD), node_name='Leg_Cuff_R')
    scene.graph.update(frame_to='Leg_Cuff_R', frame_from='RightLegRoot')

    boot_r = trimesh.creation.box([0.18, 0.20, 0.34])
    boot_r.apply_translation([0, 0.10 - 0.65, -0.02])
    scene.add_geometry(apply_mat(boot_r, MAT_BOOTS), node_name='Boot_R')
    scene.graph.update(frame_to='Boot_R', frame_from='RightLegRoot')

    return scene

def main():
    print("Building Articulated Lakhey Guardian 3D Blockout (v0.2)...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    art_glb = os.path.join(base_dir, "art-source", "lakhey_blockout_v02.glb")
    pub_glb = os.path.join(base_dir, "public", "models", "lakhey_blockout_v01.glb")
    pub_glb_v2 = os.path.join(base_dir, "public", "models", "lakhey_blockout_v02.glb")

    scene = build_scene()

    total_triangles = sum(len(g.faces) for g in scene.geometry.values())
    total_vertices = sum(len(g.vertices) for g in scene.geometry.values())
    extents = scene.extents

    print(f"Total Geometries: {len(scene.geometry)}")
    print(f"Total Triangles: {total_triangles}")
    print(f"Total Vertices: {total_vertices}")
    print(f"Height: {extents[1]:.3f}m")
    print(f"Dimensions: {extents[0]:.3f}m x {extents[1]:.3f}m x {extents[2]:.3f}m")

    glb_data = scene.export(file_type='glb')
    with open(art_glb, "wb") as f:
        f.write(glb_data)
    with open(pub_glb, "wb") as f:
        f.write(glb_data)
    with open(pub_glb_v2, "wb") as f:
        f.write(glb_data)

    print(f"Saved GLB to {art_glb} and {pub_glb} ({len(glb_data)/1024.0:.1f} KB)")

if __name__ == "__main__":
    main()
