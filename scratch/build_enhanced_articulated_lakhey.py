"""
Procedural 3D Model Generator for Articulated Lakhey Guardian Blockout v0.2 / v0.3.
Converts the reviewed guardian concept into an articulated 3D glTF/GLB model:
- Imposing 2.45m height (1.45x scale relative to Tuku's 1.68m)
- Grounded at exactly Y = 0.00m
- Clean vertical Y-axis limbs (fixing trimesh Z-cylinder alignment bug)
- Articulated Sub-Joint Hierarchy:
    world
      ├── TorsoRoot (Y = 1.15m)
      │     ├── Skirt_Lower, Skirt_Mid, Skirt_Upper, Skirt_Gold_Border
      │     ├── Ceremonial_Belt, Belt_Pendant_Sash
      │     ├── Chest_Tunic, Upper_Chest, Brocade_Yoke
      │     └── Epaulet_L, Epaulet_R
      ├── HeadRoot (Y = 1.88m)
      │     ├── Head_Neck, Head_Mask_Visage
      │     ├── Head_Golden_Crest, Head_Crest_Center_Peak, Head_Crest_Peak_L, Head_Crest_Peak_R
      │     ├── Head_Eyebrow_Left, Head_Eyebrow_Right
      │     ├── Head_Eye_L, Head_Eye_R, Head_Pupil_L, Head_Pupil_R
      │     ├── Head_Mouth, Head_Beard
      │     └── Head_Fang_L, Head_Fang_R
      ├── ManeRoot (Y = 2.00m, Z = 0.10m)
      │     ├── Mane_Crown, Mane_Upper, Mane_Mid, Mane_Lower
      │     └── Mane_Tress_L, Mane_Tress_R
      ├── LeftArmRoot (X = 0.46m, Y = 1.76m)
      │     ├── Arm_Upper_L
      │     └── LeftElbowRoot (Y = -0.34m)
      │           ├── Arm_Forearm_L, Arm_Cuff_L, Arm_Hand_L
      ├── RightArmRoot (X = -0.46m, Y = 1.76m)
      │     ├── Arm_Upper_R
      │     └── RightElbowRoot (Y = -0.34m)
      │           ├── Arm_Forearm_R, Arm_Cuff_R, Arm_Hand_R
      │           └── ChamaraRoot (Y = -0.40m, Z = -0.06m)
      │                 ├── Chamara_Handle, Chamara_Plume
      ├── LeftLegRoot (X = 0.20m, Y = 0.65m)
      │     ├── Thigh_L
      │     └── LeftKneeRoot (Y = -0.28m)
      │           ├── Shin_L, Leg_Cuff_L, Boot_L
      └── RightLegRoot (X = -0.20m, Y = 0.65m)
            ├── Thigh_R
            └── RightKneeRoot (Y = -0.28m)
                  ├── Shin_R, Leg_Cuff_R, Boot_R
"""

import os
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

def hex_to_rgba(hex_str):
    h = hex_str.lstrip('#')
    return [int(h[0:2], 16)/255.0, int(h[2:4], 16)/255.0, int(h[4:6], 16)/255.0, 1.0]

# PBR Materials
MAT_CRIMSON = PBRMaterial(name="Mat_LakheyCrimson", baseColorFactor=hex_to_rgba("#A31D1D"), roughnessFactor=0.6, metallicFactor=0.05)
MAT_GOLD = PBRMaterial(name="Mat_LakheyGold", baseColorFactor=hex_to_rgba("#E5A93C"), roughnessFactor=0.35, metallicFactor=0.45)
MAT_MANE = PBRMaterial(name="Mat_LakheyMane", baseColorFactor=hex_to_rgba("#181414"), roughnessFactor=0.85, metallicFactor=0.0)
MAT_FACE = PBRMaterial(name="Mat_LakheyFace", baseColorFactor=hex_to_rgba("#C2410C"), roughnessFactor=0.6, metallicFactor=0.0)
MAT_SKIN = PBRMaterial(name="Mat_LakheySkin", baseColorFactor=hex_to_rgba("#C89568"), roughnessFactor=0.6, metallicFactor=0.0)
MAT_BOOTS = PBRMaterial(name="Mat_LakheyBoots", baseColorFactor=hex_to_rgba("#1E242B"), roughnessFactor=0.7, metallicFactor=0.05)
MAT_IVORY = PBRMaterial(name="Mat_LakheyFangs", baseColorFactor=hex_to_rgba("#FFFBEB"), roughnessFactor=0.25, metallicFactor=0.0)
MAT_EYES = PBRMaterial(name="Mat_LakheyEyes", baseColorFactor=hex_to_rgba("#FF7A00"), emissiveFactor=[1.0, 0.45, 0.0], roughnessFactor=0.2, metallicFactor=0.1)
MAT_PUPILS = PBRMaterial(name="Mat_LakheyPupils", baseColorFactor=hex_to_rgba("#111113"), roughnessFactor=0.9, metallicFactor=0.0)
MAT_CHAMARA_HANDLE = PBRMaterial(name="Mat_ChamaraHandle", baseColorFactor=hex_to_rgba("#D97706"), roughnessFactor=0.35, metallicFactor=0.4)
MAT_CHAMARA_PLUME = PBRMaterial(name="Mat_ChamaraPlume", baseColorFactor=hex_to_rgba("#F8FAFC"), roughnessFactor=0.75, metallicFactor=0.0)

def apply_mat(mesh, material):
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh

def make_vert_cylinder(radius, height, sections=12):
    """Creates a cylinder aligned with the vertical Y axis (trimesh defaults to Z)."""
    c = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    rot = trimesh.transformations.rotation_matrix(np.radians(90), [1, 0, 0])
    c.apply_transform(rot)
    return c

def make_vert_cone(radius, height, sections=10, point_up=True):
    """Creates a cone aligned with the vertical Y axis pointing up or down."""
    c = trimesh.creation.cone(radius=radius, height=height, sections=sections)
    angle = -90 if point_up else 90
    rot = trimesh.transformations.rotation_matrix(np.radians(angle), [1, 0, 0])
    c.apply_transform(rot)
    return c

def build_lakhey_model():
    scene = trimesh.Scene()

    # =========================================================================
    # 1. TORSO ROOT (World Pivot at [0, 1.15, 0])
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

    skirt_upper = trimesh.creation.box([0.74, 0.18, 0.46])
    skirt_upper.apply_translation([0, 1.05 - 1.15, 0])
    scene.add_geometry(apply_mat(skirt_upper, MAT_CRIMSON), node_name='Skirt_Upper')
    scene.graph.update(frame_to='Skirt_Upper', frame_from='TorsoRoot')

    # Ceremonial Belt & Pendant Sash
    belt = trimesh.creation.box([0.78, 0.10, 0.49])
    belt.apply_translation([0, 1.13 - 1.15, 0])
    scene.add_geometry(apply_mat(belt, MAT_GOLD), node_name='Ceremonial_Belt')
    scene.graph.update(frame_to='Ceremonial_Belt', frame_from='TorsoRoot')

    pendant = trimesh.creation.box([0.18, 0.38, 0.04])
    pendant.apply_translation([0, 0.92 - 1.15, -0.25])
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
    for side, x in [("L", 0.44), ("R", -0.44)]:
        epaulet = trimesh.creation.box([0.16, 0.12, 0.42])
        epaulet.apply_translation([x, 1.76 - 1.15, 0])
        scene.add_geometry(apply_mat(epaulet, MAT_GOLD), node_name=f'Epaulet_{side}')
        scene.graph.update(frame_to=f'Epaulet_{side}', frame_from='TorsoRoot')

    # =========================================================================
    # 2. HEAD ROOT (World Pivot at [0, 1.88, 0])
    # =========================================================================
    scene.graph.update(frame_to='HeadRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0, 1.88, 0]))

    # Neck (Vertical Cylinder)
    neck = make_vert_cylinder(radius=0.13, height=0.18, sections=12)
    neck.apply_translation([0, -0.06, 0])
    scene.add_geometry(apply_mat(neck, MAT_SKIN), node_name='Head_Neck')
    scene.graph.update(frame_to='Head_Neck', frame_from='HeadRoot')

    # Theatrical Terracotta Visage
    face = trimesh.creation.icosphere(subdivisions=2, radius=0.22)
    face.apply_scale([0.96, 1.18, 0.88])
    face.apply_translation([0, 0.17, -0.16])
    scene.add_geometry(apply_mat(face, MAT_FACE), node_name='Head_Mask_Visage')
    scene.graph.update(frame_to='Head_Mask_Visage', frame_from='HeadRoot')

    # 3-Peaked Golden Diadem Crest
    crest_base = trimesh.creation.box([0.38, 0.16, 0.06])
    crest_base.apply_translation([0, 0.38, -0.18])
    scene.add_geometry(apply_mat(crest_base, MAT_GOLD), node_name='Head_Golden_Crest')
    scene.graph.update(frame_to='Head_Golden_Crest', frame_from='HeadRoot')

    crest_center_peak = make_vert_cone(radius=0.06, height=0.14, sections=8, point_up=True)
    crest_center_peak.apply_translation([0, 0.52, -0.18])
    scene.add_geometry(apply_mat(crest_center_peak, MAT_GOLD), node_name='Head_Crest_Center_Peak')
    scene.graph.update(frame_to='Head_Crest_Center_Peak', frame_from='HeadRoot')

    for side, x in [("L", 0.12), ("R", -0.12)]:
        crest_side_peak = make_vert_cone(radius=0.045, height=0.10, sections=8, point_up=True)
        crest_side_peak.apply_translation([x, 0.48, -0.18])
        scene.add_geometry(apply_mat(crest_side_peak, MAT_GOLD), node_name=f'Head_Crest_Peak_{side}')
        scene.graph.update(frame_to=f'Head_Crest_Peak_{side}', frame_from='HeadRoot')

    # Dramatic Bold Eyebrows
    brow_l = trimesh.creation.box([0.16, 0.05, 0.08])
    rot_b_l = trimesh.transformations.rotation_matrix(np.radians(-16), [0, 0, 1])
    brow_l.apply_transform(rot_b_l)
    brow_l.apply_translation([0.10, 0.26, -0.30])
    scene.add_geometry(apply_mat(brow_l, MAT_MANE), node_name='Head_Eyebrow_Left')
    scene.graph.update(frame_to='Head_Eyebrow_Left', frame_from='HeadRoot')

    brow_r = trimesh.creation.box([0.16, 0.05, 0.08])
    rot_b_r = trimesh.transformations.rotation_matrix(np.radians(16), [0, 0, 1])
    brow_r.apply_transform(rot_b_r)
    brow_r.apply_translation([-0.10, 0.26, -0.30])
    scene.add_geometry(apply_mat(brow_r, MAT_MANE), node_name='Head_Eyebrow_Right')
    scene.graph.update(frame_to='Head_Eyebrow_Right', frame_from='HeadRoot')

    # Almond Glowing Amber Eyes & Focused Pupils
    for side, x in [("L", 0.10), ("R", -0.10)]:
        eye = trimesh.creation.box([0.08, 0.06, 0.04])
        eye.apply_translation([x, 0.18, -0.32])
        scene.add_geometry(apply_mat(eye, MAT_EYES), node_name=f'Head_Eye_{side}')
        scene.graph.update(frame_to=f'Head_Eye_{side}', frame_from='HeadRoot')

        pupil = trimesh.creation.box([0.035, 0.04, 0.02])
        pupil.apply_translation([x, 0.18, -0.34])
        scene.add_geometry(apply_mat(pupil, MAT_PUPILS), node_name=f'Head_Pupil_{side}')
        scene.graph.update(frame_to=f'Head_Pupil_{side}', frame_from='HeadRoot')

    # Wide Mask Mouth & Beard Fringe
    mouth = trimesh.creation.box([0.26, 0.08, 0.06])
    mouth.apply_translation([0, 0.06, -0.30])
    scene.add_geometry(apply_mat(mouth, MAT_MANE), node_name='Head_Mouth')
    scene.graph.update(frame_to='Head_Mouth', frame_from='HeadRoot')

    beard = trimesh.creation.box([0.28, 0.06, 0.08])
    beard.apply_translation([0, 0.00, -0.28])
    scene.add_geometry(apply_mat(beard, MAT_MANE), node_name='Head_Beard')
    scene.graph.update(frame_to='Head_Beard', frame_from='HeadRoot')

    # Ceremonial Guardian Fangs
    for side, x in [("L", 0.085), ("R", -0.085)]:
        fang = make_vert_cone(radius=0.032, height=0.09, sections=8, point_up=False)
        fang.apply_translation([x, 0.02, -0.31])
        scene.add_geometry(apply_mat(fang, MAT_IVORY), node_name=f'Head_Fang_{side}')
        scene.graph.update(frame_to=f'Head_Fang_{side}', frame_from='HeadRoot')

    # =========================================================================
    # 3. MANE ROOT (World Pivot at [0, 2.00, 0.10])
    # =========================================================================
    scene.graph.update(frame_to='ManeRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0, 2.00, 0.10]))

    mane_top = trimesh.creation.icosphere(subdivisions=2, radius=0.32)
    mane_top.apply_scale([1.14, 1.05, 1.15])
    mane_top.apply_translation([0, 0.22, -0.05])
    scene.add_geometry(apply_mat(mane_top, MAT_MANE), node_name='Mane_Crown')
    scene.graph.update(frame_to='Mane_Crown', frame_from='ManeRoot')

    mane_upper = trimesh.creation.box([0.96, 0.38, 0.38])
    mane_upper.apply_translation([0, 0.10, 0.06])
    scene.add_geometry(apply_mat(mane_upper, MAT_MANE), node_name='Mane_Upper')
    scene.graph.update(frame_to='Mane_Upper', frame_from='ManeRoot')

    mane_mid = trimesh.creation.box([0.86, 0.35, 0.32])
    mane_mid.apply_translation([0, -0.18, 0.10])
    scene.add_geometry(apply_mat(mane_mid, MAT_MANE), node_name='Mane_Mid')
    scene.graph.update(frame_to='Mane_Mid', frame_from='ManeRoot')

    mane_lower = trimesh.creation.box([0.74, 0.30, 0.24])
    mane_lower.apply_translation([0, -0.46, 0.12])
    scene.add_geometry(apply_mat(mane_lower, MAT_MANE), node_name='Mane_Lower')
    scene.graph.update(frame_to='Mane_Lower', frame_from='ManeRoot')

    # Vertical side tresses cascading past shoulders
    for side, x in [("L", 0.38), ("R", -0.38)]:
        tress = make_vert_cylinder(radius=0.11, height=0.62, sections=10)
        tress.apply_translation([x, -0.14, -0.14])
        scene.add_geometry(apply_mat(tress, MAT_MANE), node_name=f'Mane_Tress_{side}')
        scene.graph.update(frame_to=f'Mane_Tress_{side}', frame_from='ManeRoot')

    # =========================================================================
    # 4. LEFT ARM HIERARCHY (LeftArmRoot -> LeftElbowRoot)
    # =========================================================================
    scene.graph.update(frame_to='LeftArmRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0.46, 1.76, 0]))

    # Upper Arm: Vertical cylinder connecting shoulder (0.0) down to elbow (-0.34)
    arm_up_l = make_vert_cylinder(radius=0.105, height=0.34, sections=12)
    arm_up_l.apply_translation([0, -0.17, 0])
    scene.add_geometry(apply_mat(arm_up_l, MAT_CRIMSON), node_name='Arm_Upper_L')
    scene.graph.update(frame_to='Arm_Upper_L', frame_from='LeftArmRoot')

    # Left Elbow Root (Pivot at [0, -0.34, 0] relative to LeftArmRoot)
    scene.graph.update(frame_to='LeftElbowRoot', frame_from='LeftArmRoot',
                       matrix=trimesh.transformations.translation_matrix([0, -0.34, 0]))

    # Forearm: Vertical cylinder connecting elbow (0.0) down to wrist (-0.32)
    arm_fore_l = make_vert_cylinder(radius=0.09, height=0.32, sections=12)
    arm_fore_l.apply_translation([0, -0.16, 0])
    scene.add_geometry(apply_mat(arm_fore_l, MAT_CRIMSON), node_name='Arm_Forearm_L')
    scene.graph.update(frame_to='Arm_Forearm_L', frame_from='LeftElbowRoot')

    # Gold Wrist Cuff
    cuff_l = make_vert_cylinder(radius=0.105, height=0.10, sections=12)
    cuff_l.apply_translation([0, -0.30, 0])
    scene.add_geometry(apply_mat(cuff_l, MAT_GOLD), node_name='Arm_Cuff_L')
    scene.graph.update(frame_to='Arm_Cuff_L', frame_from='LeftElbowRoot')

    # Guardian Hand
    hand_l = trimesh.creation.box([0.11, 0.15, 0.08])
    hand_l.apply_translation([0, -0.40, 0])
    scene.add_geometry(apply_mat(hand_l, MAT_SKIN), node_name='Arm_Hand_L')
    scene.graph.update(frame_to='Arm_Hand_L', frame_from='LeftElbowRoot')

    # =========================================================================
    # 5. RIGHT ARM HIERARCHY (RightArmRoot -> RightElbowRoot -> ChamaraRoot)
    # =========================================================================
    scene.graph.update(frame_to='RightArmRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([-0.46, 1.76, 0]))

    # Upper Arm: Vertical cylinder connecting shoulder (0.0) down to elbow (-0.34)
    arm_up_r = make_vert_cylinder(radius=0.105, height=0.34, sections=12)
    arm_up_r.apply_translation([0, -0.17, 0])
    scene.add_geometry(apply_mat(arm_up_r, MAT_CRIMSON), node_name='Arm_Upper_R')
    scene.graph.update(frame_to='Arm_Upper_R', frame_from='RightArmRoot')

    # Right Elbow Root (Pivot at [0, -0.34, 0] relative to RightArmRoot)
    scene.graph.update(frame_to='RightElbowRoot', frame_from='RightArmRoot',
                       matrix=trimesh.transformations.translation_matrix([0, -0.34, 0]))

    # Forearm: Vertical cylinder connecting elbow (0.0) down to wrist (-0.32)
    arm_fore_r = make_vert_cylinder(radius=0.09, height=0.32, sections=12)
    arm_fore_r.apply_translation([0, -0.16, 0])
    scene.add_geometry(apply_mat(arm_fore_r, MAT_CRIMSON), node_name='Arm_Forearm_R')
    scene.graph.update(frame_to='Arm_Forearm_R', frame_from='RightElbowRoot')

    # Gold Wrist Cuff
    cuff_r = make_vert_cylinder(radius=0.105, height=0.10, sections=12)
    cuff_r.apply_translation([0, -0.30, 0])
    scene.add_geometry(apply_mat(cuff_r, MAT_GOLD), node_name='Arm_Cuff_R')
    scene.graph.update(frame_to='Arm_Cuff_R', frame_from='RightElbowRoot')

    # Guardian Hand
    hand_r = trimesh.creation.box([0.11, 0.15, 0.08])
    hand_r.apply_translation([0, -0.40, 0])
    scene.add_geometry(apply_mat(hand_r, MAT_SKIN), node_name='Arm_Hand_R')
    scene.graph.update(frame_to='Arm_Hand_R', frame_from='RightElbowRoot')

    # Chamara (Yak-Tail Fly-Whisk) in Right Hand
    scene.graph.update(frame_to='ChamaraRoot', frame_from='RightElbowRoot',
                       matrix=trimesh.transformations.translation_matrix([0, -0.40, -0.06]))

    chamara_handle = make_vert_cylinder(radius=0.022, height=0.36, sections=8)
    chamara_handle.apply_translation([0, 0.08, 0])
    scene.add_geometry(apply_mat(chamara_handle, MAT_CHAMARA_HANDLE), node_name='Chamara_Handle')
    scene.graph.update(frame_to='Chamara_Handle', frame_from='ChamaraRoot')

    chamara_plume = make_vert_cone(radius=0.10, height=0.42, sections=10, point_up=True)
    chamara_plume.apply_translation([0, 0.32, 0])
    scene.add_geometry(apply_mat(chamara_plume, MAT_CHAMARA_PLUME), node_name='Chamara_Plume')
    scene.graph.update(frame_to='Chamara_Plume', frame_from='ChamaraRoot')

    # =========================================================================
    # 6. LEFT LEG HIERARCHY (LeftLegRoot -> LeftKneeRoot)
    # =========================================================================
    scene.graph.update(frame_to='LeftLegRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([0.20, 0.65, 0]))

    # Thigh: Vertical cylinder from hip (0.0) down to knee (-0.28)
    thigh_l = make_vert_cylinder(radius=0.10, height=0.28, sections=12)
    thigh_l.apply_translation([0, -0.14, 0])
    scene.add_geometry(apply_mat(thigh_l, MAT_CRIMSON), node_name='Thigh_L')
    scene.graph.update(frame_to='Thigh_L', frame_from='LeftLegRoot')

    # Knee Pivot at [0, -0.28, 0] relative to LeftLegRoot (World Y = 0.37m)
    scene.graph.update(frame_to='LeftKneeRoot', frame_from='LeftLegRoot',
                       matrix=trimesh.transformations.translation_matrix([0, -0.28, 0]))

    # Shin: Vertical cylinder from knee (0.0) down to ankle (-0.24)
    shin_l = make_vert_cylinder(radius=0.09, height=0.24, sections=12)
    shin_l.apply_translation([0, -0.12, 0])
    scene.add_geometry(apply_mat(shin_l, MAT_CRIMSON), node_name='Shin_L')
    scene.graph.update(frame_to='Shin_L', frame_from='LeftKneeRoot')

    # Ankle Cuff / Bells
    cuff_leg_l = trimesh.creation.box([0.22, 0.08, 0.24])
    cuff_leg_l.apply_translation([0, -0.24, -0.01])
    scene.add_geometry(apply_mat(cuff_leg_l, MAT_GOLD), node_name='Leg_Cuff_L')
    scene.graph.update(frame_to='Leg_Cuff_L', frame_from='LeftKneeRoot')

    # Boot (grounded cleanly at World Y = 0.00m)
    boot_l = trimesh.creation.box([0.18, 0.14, 0.32])
    boot_l.apply_translation([0, -0.30, -0.02])
    scene.add_geometry(apply_mat(boot_l, MAT_BOOTS), node_name='Boot_L')
    scene.graph.update(frame_to='Boot_L', frame_from='LeftKneeRoot')

    # =========================================================================
    # 7. RIGHT LEG HIERARCHY (RightLegRoot -> RightKneeRoot)
    # =========================================================================
    scene.graph.update(frame_to='RightLegRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix([-0.20, 0.65, 0]))

    # Thigh: Vertical cylinder from hip (0.0) down to knee (-0.28)
    thigh_r = make_vert_cylinder(radius=0.10, height=0.28, sections=12)
    thigh_r.apply_translation([0, -0.14, 0])
    scene.add_geometry(apply_mat(thigh_r, MAT_CRIMSON), node_name='Thigh_R')
    scene.graph.update(frame_to='Thigh_R', frame_from='RightLegRoot')

    # Knee Pivot at [0, -0.28, 0] relative to RightLegRoot (World Y = 0.37m)
    scene.graph.update(frame_to='RightKneeRoot', frame_from='RightLegRoot',
                       matrix=trimesh.transformations.translation_matrix([0, -0.28, 0]))

    # Shin: Vertical cylinder from knee (0.0) down to ankle (-0.24)
    shin_r = make_vert_cylinder(radius=0.09, height=0.24, sections=12)
    shin_r.apply_translation([0, -0.12, 0])
    scene.add_geometry(apply_mat(shin_r, MAT_CRIMSON), node_name='Shin_R')
    scene.graph.update(frame_to='Shin_R', frame_from='RightKneeRoot')

    # Ankle Cuff / Bells
    cuff_leg_r = trimesh.creation.box([0.22, 0.08, 0.24])
    cuff_leg_r.apply_translation([0, -0.24, -0.01])
    scene.add_geometry(apply_mat(cuff_leg_r, MAT_GOLD), node_name='Leg_Cuff_R')
    scene.graph.update(frame_to='Leg_Cuff_R', frame_from='RightKneeRoot')

    # Boot (grounded cleanly at World Y = 0.00m)
    boot_r = trimesh.creation.box([0.18, 0.14, 0.32])
    boot_r.apply_translation([0, -0.30, -0.02])
    scene.add_geometry(apply_mat(boot_r, MAT_BOOTS), node_name='Boot_R')
    scene.graph.update(frame_to='Boot_R', frame_from='RightKneeRoot')

    return scene

def main():
    print("Building Enhanced Articulated Lakhey Guardian 3D Model (v0.2/v0.3)...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    art_glb = os.path.join(base_dir, "art-source", "lakhey_blockout_v02.glb")
    pub_glb = os.path.join(base_dir, "public", "models", "lakhey_blockout_v02.glb")
    pub_v01_glb = os.path.join(base_dir, "public", "models", "lakhey_blockout_v01.glb")

    scene = build_lakhey_model()

    total_triangles = sum(len(g.faces) for g in scene.geometry.values())
    total_vertices = sum(len(g.vertices) for g in scene.geometry.values())
    extents = scene.extents
    bounds = scene.bounds

    print(f"Total Geometries: {len(scene.geometry)}")
    print(f"Total Triangles: {total_triangles}")
    print(f"Total Vertices: {total_vertices}")
    print(f"Dimensions: {extents[0]:.3f}m x {extents[1]:.3f}m x {extents[2]:.3f}m")
    print(f"Bounds Min: {bounds[0]}")
    print(f"Bounds Max: {bounds[1]}")

    glb_data = scene.export(file_type='glb')
    with open(art_glb, "wb") as f:
        f.write(glb_data)
    with open(pub_glb, "wb") as f:
        f.write(glb_data)
    # Also write to v01 for backward compatibility
    with open(pub_v01_glb, "wb") as f:
        f.write(glb_data)

    print(f"Saved Articulated Lakhey GLB to {art_glb}, {pub_glb}, and {pub_v01_glb} ({len(glb_data)/1024.0:.1f} KB)")

if __name__ == "__main__":
    main()
