"""
Enhanced Procedural Generator for Articulated Tuku 3D Character (v0.3 Specification).
Builds a complete, expressive joint hierarchy with secondary motion roots and facial details:
- TorsoRoot: Pelvis, lower jacket, longline shirt hem, straps
- HeadRoot: Neck, scarf collar, stylized facial features (expressive eyes, pupils, eyebrows, nose, smirk), hair crown, hair sweep tuft
- ScarfTailRoot: Floating dynamic scarf tail on shoulder for wind flutter
- LeftLegRoot & RightLegRoot: Hip pivots for upper thigh
- LeftKneeRoot & RightKneeRoot: Knee pivots for calf, athletic sneakers, and soles
- LeftArmRoot & RightArmRoot: Shoulder pivots for upper arm
- LeftElbowRoot & RightElbowRoot: Elbow pivots for athletic bent forearm and fists
- SatchelRoot: Hip anchor with inertia bounce

Height: Exactly 1.68m (feet grounded at Y=0.00m).
Palette: Kathmandu Festival Palette (Teal #2F7875, Cream #E8DDCA, Charcoal #2D3438, Maroon #8C414B, Marigold #DEA94B, Warm Skin #C89568).
"""

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
import os

def hex_to_rgba(hex_str):
    h = hex_str.lstrip('#')
    return [int(h[0:2], 16)/255.0, int(h[2:4], 16)/255.0, int(h[4:6], 16)/255.0, 1.0]

# PBR Materials
MAT_TEAL = PBRMaterial(name="Mat_TealJacket", baseColorFactor=hex_to_rgba("#2F7875"), roughnessFactor=0.55, metallicFactor=0.05)
MAT_CREAM = PBRMaterial(name="Mat_CreamShirt", baseColorFactor=hex_to_rgba("#E8DDCA"), roughnessFactor=0.7, metallicFactor=0.0)
MAT_PANTS = PBRMaterial(name="Mat_CharcoalPants", baseColorFactor=hex_to_rgba("#2D3438"), roughnessFactor=0.65, metallicFactor=0.05)
MAT_SCARF = PBRMaterial(name="Mat_MaroonScarf", baseColorFactor=hex_to_rgba("#8C414B"), roughnessFactor=0.65, metallicFactor=0.0)
MAT_BAG = PBRMaterial(name="Mat_CharcoalBag", baseColorFactor=hex_to_rgba("#25292B"), roughnessFactor=0.5, metallicFactor=0.1)
MAT_SOLE = PBRMaterial(name="Mat_CreamSole", baseColorFactor=hex_to_rgba("#D7CDBE"), roughnessFactor=0.8, metallicFactor=0.0)
MAT_MARIGOLD = PBRMaterial(name="Mat_MarigoldAccent", baseColorFactor=hex_to_rgba("#DEA94B"), roughnessFactor=0.4, metallicFactor=0.2)
MAT_SKIN = PBRMaterial(name="Mat_WarmSkin", baseColorFactor=hex_to_rgba("#C89568"), roughnessFactor=0.6, metallicFactor=0.0)
MAT_HAIR = PBRMaterial(name="Mat_DarkHair", baseColorFactor=hex_to_rgba("#222629"), roughnessFactor=0.75, metallicFactor=0.05)

# Expressive Facial Materials
MAT_EYE_WHITE = PBRMaterial(name="Mat_EyeWhite", baseColorFactor=hex_to_rgba("#F8FAFC"), roughnessFactor=0.25, metallicFactor=0.0)
MAT_EYE_PUPIL = PBRMaterial(name="Mat_EyePupil", baseColorFactor=hex_to_rgba("#1C2024"), roughnessFactor=0.15, metallicFactor=0.0)
MAT_EYEBROW = PBRMaterial(name="Mat_Eyebrow", baseColorFactor=hex_to_rgba("#1A1D20"), roughnessFactor=0.8, metallicFactor=0.0)
MAT_LIP = PBRMaterial(name="Mat_LipAccent", baseColorFactor=hex_to_rgba("#A2634B"), roughnessFactor=0.6, metallicFactor=0.0)

def apply_mat(mesh, material):
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh

def make_vert_cylinder(radius, height, sections=14):
    c = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    # Trimesh cylinders are created along Z by default; rotate 90 deg around X to align with Y:
    rot = trimesh.transformations.rotation_matrix(np.radians(90), [1, 0, 0])
    c.apply_transform(rot)
    return c

def build_scene():
    scene = trimesh.Scene()

    # =========================================================================
    # 1. TORSO & PELVIS ROOT (Pivot at [0, 0.86, 0])
    # =========================================================================
    torso_pivot = [0.0, 0.86, 0.0]
    scene.graph.update(frame_to='TorsoRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(torso_pivot))

    # Pelvis
    pelvis = trimesh.creation.box([0.32, 0.16, 0.18])
    pelvis.apply_translation([0, -0.06, 0])
    scene.add_geometry(apply_mat(pelvis, MAT_PANTS), node_name='Torso_Pelvis')
    scene.graph.update(frame_to='Torso_Pelvis', frame_from='TorsoRoot')

    # Shirt Longline Hem (extends 10cm below cropped jacket)
    shirt_hem = trimesh.creation.box([0.33, 0.10, 0.19])
    shirt_hem.apply_translation([0, 0.05, 0])
    scene.add_geometry(apply_mat(shirt_hem, MAT_CREAM), node_name='Torso_ShirtHem')
    scene.graph.update(frame_to='Torso_ShirtHem', frame_from='TorsoRoot')

    # Lower Cropped Jacket
    j_low = trimesh.creation.box([0.34, 0.18, 0.20])
    j_low.apply_translation([0, 0.19, 0])
    scene.add_geometry(apply_mat(j_low, MAT_TEAL), node_name='Torso_JacketLower')
    scene.graph.update(frame_to='Torso_JacketLower', frame_from='TorsoRoot')

    # Jacket Hem Ribbing
    j_rib = trimesh.creation.box([0.35, 0.04, 0.21])
    j_rib.apply_translation([0, 0.10, 0])
    scene.add_geometry(apply_mat(j_rib, MAT_TEAL), node_name='Torso_JacketRibbing')
    scene.graph.update(frame_to='Torso_JacketRibbing', frame_from='TorsoRoot')

    # Jacket Upper Chest
    chest = trimesh.creation.box([0.38, 0.28, 0.22])
    chest.apply_translation([0, 0.42, 0])
    scene.add_geometry(apply_mat(chest, MAT_TEAL), node_name='Torso_Chest')
    scene.graph.update(frame_to='Torso_Chest', frame_from='TorsoRoot')

    # Exposed Cream Shirt Placket
    shirt_front = trimesh.creation.box([0.10, 0.32, 0.02])
    shirt_front.apply_translation([0, 0.26, -0.11])
    scene.add_geometry(apply_mat(shirt_front, MAT_CREAM), node_name='Torso_ShirtFront')
    scene.graph.update(frame_to='Torso_ShirtFront', frame_from='TorsoRoot')

    # Diagonal Crossbody Straps
    front_strap = trimesh.creation.box([0.045, 0.44, 0.015])
    rot_strap = trimesh.transformations.rotation_matrix(np.radians(38), [0, 0, 1])
    front_strap.apply_transform(rot_strap)
    front_strap.apply_translation([0.02, 0.32, -0.115])
    scene.add_geometry(apply_mat(front_strap, MAT_BAG), node_name='Torso_FrontStrap')
    scene.graph.update(frame_to='Torso_FrontStrap', frame_from='TorsoRoot')

    back_strap = trimesh.creation.box([0.045, 0.44, 0.015])
    rot_back_strap = trimesh.transformations.rotation_matrix(np.radians(-38), [0, 0, 1])
    back_strap.apply_transform(rot_back_strap)
    back_strap.apply_translation([0.02, 0.32, 0.115])
    scene.add_geometry(apply_mat(back_strap, MAT_BAG), node_name='Torso_BackStrap')
    scene.graph.update(frame_to='Torso_BackStrap', frame_from='TorsoRoot')

    # =========================================================================
    # 2. HEAD ROOT (Pivot at [0, 1.43, 0])
    # =========================================================================
    head_pivot = [0.0, 1.43, 0.0]
    scene.graph.update(frame_to='HeadRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(head_pivot))

    # Neck
    neck = make_vert_cylinder(radius=0.065, height=0.08, sections=14)
    scene.add_geometry(apply_mat(neck, MAT_SKIN), node_name='Head_Neck')
    scene.graph.update(frame_to='Head_Neck', frame_from='HeadRoot')

    # Scarf Ring Wrap
    scarf_ring = trimesh.creation.torus(major_radius=0.10, minor_radius=0.04, major_sections=18, minor_sections=10)
    scarf_ring.apply_scale([1.1, 1.0, 1.0])
    scene.add_geometry(apply_mat(scarf_ring, MAT_SCARF), node_name='Head_Scarf')
    scene.graph.update(frame_to='Head_Scarf', frame_from='HeadRoot')

    # Scarf Knot
    scarf_knot = trimesh.creation.box([0.05, 0.08, 0.04])
    scarf_knot.apply_translation([0.06, -0.04, -0.11])
    scene.add_geometry(apply_mat(scarf_knot, MAT_SCARF), node_name='Head_ScarfKnot')
    scene.graph.update(frame_to='Head_ScarfKnot', frame_from='HeadRoot')

    # Face Oval (young adult stylized proportion)
    head_mesh = trimesh.creation.icosphere(subdivisions=2, radius=0.105)
    head_mesh.apply_scale([0.92, 1.15, 0.98])
    head_mesh.apply_translation([0, 0.12, -0.01])
    scene.add_geometry(apply_mat(head_mesh, MAT_SKIN), node_name='Head_Face')
    scene.graph.update(frame_to='Head_Face', frame_from='HeadRoot')

    # Expressive Stylized Eyes & Eyebrows (Facing -Z)
    # Left Eye (Wearer's Left = +X)
    eye_l_white = trimesh.creation.box([0.034, 0.024, 0.012])
    eye_l_white.apply_translation([0.038, 0.132, -0.098])
    scene.add_geometry(apply_mat(eye_l_white, MAT_EYE_WHITE), node_name='Eye_L_White')
    scene.graph.update(frame_to='Eye_L_White', frame_from='HeadRoot')

    eye_l_pupil = trimesh.creation.box([0.018, 0.020, 0.014])
    eye_l_pupil.apply_translation([0.038, 0.132, -0.104])
    scene.add_geometry(apply_mat(eye_l_pupil, MAT_EYE_PUPIL), node_name='Eye_L_Pupil')
    scene.graph.update(frame_to='Eye_L_Pupil', frame_from='HeadRoot')

    # Right Eye (Wearer's Right = -X)
    eye_r_white = trimesh.creation.box([0.034, 0.024, 0.012])
    eye_r_white.apply_translation([-0.038, 0.132, -0.098])
    scene.add_geometry(apply_mat(eye_r_white, MAT_EYE_WHITE), node_name='Eye_R_White')
    scene.graph.update(frame_to='Eye_R_White', frame_from='HeadRoot')

    eye_r_pupil = trimesh.creation.box([0.018, 0.020, 0.014])
    eye_r_pupil.apply_translation([-0.038, 0.132, -0.104])
    scene.add_geometry(apply_mat(eye_r_pupil, MAT_EYE_PUPIL), node_name='Eye_R_Pupil')
    scene.graph.update(frame_to='Eye_R_Pupil', frame_from='HeadRoot')

    # Determined Athletic Eyebrows
    brow_l = trimesh.creation.box([0.038, 0.010, 0.015])
    rot_brow_l = trimesh.transformations.rotation_matrix(np.radians(-8), [0, 0, 1])
    brow_l.apply_transform(rot_brow_l)
    brow_l.apply_translation([0.040, 0.154, -0.099])
    scene.add_geometry(apply_mat(brow_l, MAT_EYEBROW), node_name='Brow_L')
    scene.graph.update(frame_to='Brow_L', frame_from='HeadRoot')

    brow_r = trimesh.creation.box([0.038, 0.010, 0.015])
    rot_brow_r = trimesh.transformations.rotation_matrix(np.radians(8), [0, 0, 1])
    brow_r.apply_transform(rot_brow_r)
    brow_r.apply_translation([-0.040, 0.154, -0.099])
    scene.add_geometry(apply_mat(brow_r, MAT_EYEBROW), node_name='Brow_R')
    scene.graph.update(frame_to='Brow_R', frame_from='HeadRoot')

    # Stylized Nose Bridge
    nose = trimesh.creation.box([0.014, 0.028, 0.020])
    nose.apply_translation([0.0, 0.114, -0.108])
    scene.add_geometry(apply_mat(nose, MAT_SKIN), node_name='Head_Nose')
    scene.graph.update(frame_to='Head_Nose', frame_from='HeadRoot')

    # Playful Trickster Smirk
    mouth = trimesh.creation.box([0.030, 0.008, 0.012])
    rot_mouth = trimesh.transformations.rotation_matrix(np.radians(5), [0, 0, 1])
    mouth.apply_transform(rot_mouth)
    mouth.apply_translation([0.006, 0.076, -0.101])
    scene.add_geometry(apply_mat(mouth, MAT_LIP), node_name='Head_Mouth')
    scene.graph.update(frame_to='Head_Mouth', frame_from='HeadRoot')

    # Hair Crown & Tuft Sweep
    hair_cap = trimesh.creation.icosphere(subdivisions=2, radius=0.118)
    hair_cap.apply_scale([1.02, 1.05, 1.08])
    hair_cap.apply_translation([0, 0.15, 0.02])
    scene.add_geometry(apply_mat(hair_cap, MAT_HAIR), node_name='Head_HairCrown')
    scene.graph.update(frame_to='Head_HairCrown', frame_from='HeadRoot')

    hair_tuft = trimesh.creation.cone(radius=0.055, height=0.14, sections=10)
    rot_tuft = trimesh.transformations.rotation_matrix(np.radians(65), [1, 0, 0])
    hair_tuft.apply_transform(rot_tuft)
    hair_tuft.apply_translation([-0.04, 0.19, 0.10])
    scene.add_geometry(apply_mat(hair_tuft, MAT_HAIR), node_name='Head_HairTuft')
    scene.graph.update(frame_to='Head_HairTuft', frame_from='HeadRoot')

    bangs = trimesh.creation.box([0.12, 0.05, 0.06])
    rot_b = trimesh.transformations.rotation_matrix(np.radians(-25), [1, 0, 0])
    bangs.apply_transform(rot_b)
    bangs.apply_translation([0.02, 0.20, -0.10])
    scene.add_geometry(apply_mat(bangs, MAT_HAIR), node_name='Head_HairBangs')
    scene.graph.update(frame_to='Head_HairBangs', frame_from='HeadRoot')

    # =========================================================================
    # 2b. SCARF TAIL ROOT (Secondary wind flutter, anchored at shoulder)
    # =========================================================================
    scarf_tail_pivot = [0.07, -0.02, 0.08]
    scene.graph.update(frame_to='ScarfTailRoot', frame_from='HeadRoot',
                       matrix=trimesh.transformations.translation_matrix(scarf_tail_pivot))

    scarf_ribbon = trimesh.creation.box([0.045, 0.18, 0.018])
    scarf_ribbon.apply_translation([0, -0.08, 0.02])
    scene.add_geometry(apply_mat(scarf_ribbon, MAT_SCARF), node_name='Scarf_Ribbon')
    scene.graph.update(frame_to='Scarf_Ribbon', frame_from='ScarfTailRoot')

    # =========================================================================
    # 3. LEFT LEG (Hip Pivot at [0.10, 0.72, 0]) & LEFT KNEE
    # =========================================================================
    left_hip_pivot = [0.10, 0.72, 0.0]
    scene.graph.update(frame_to='LeftLegRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(left_hip_pivot))

    # Upper Thigh (from hip Y=0 down to -0.26)
    l_thigh = make_vert_cylinder(radius=0.072, height=0.26, sections=14)
    l_thigh.apply_translation([0, -0.13, 0])
    scene.add_geometry(apply_mat(l_thigh, MAT_PANTS), node_name='LeftLeg_Thigh')
    scene.graph.update(frame_to='LeftLeg_Thigh', frame_from='LeftLegRoot')

    # Left Knee Joint (Pivot at Y = -0.26 from hip)
    left_knee_pivot = [0.0, -0.26, 0.0]
    scene.graph.update(frame_to='LeftKneeRoot', frame_from='LeftLegRoot',
                       matrix=trimesh.transformations.translation_matrix(left_knee_pivot))

    # Calf (from knee Y=0 down to -0.32)
    l_calf = make_vert_cylinder(radius=0.058, height=0.32, sections=14)
    l_calf.apply_translation([0, -0.16, 0])
    scene.add_geometry(apply_mat(l_calf, MAT_PANTS), node_name='LeftLeg_Calf')
    scene.graph.update(frame_to='LeftLeg_Calf', frame_from='LeftKneeRoot')

    # Sneaker Upper
    l_shoe = trimesh.creation.box([0.10, 0.08, 0.22])
    l_shoe.apply_translation([0, -0.39, -0.01])
    scene.add_geometry(apply_mat(l_shoe, MAT_BAG), node_name='LeftLeg_ShoeUpper')
    scene.graph.update(frame_to='LeftLeg_ShoeUpper', frame_from='LeftKneeRoot')

    # Sneaker Sole (Grounded at world Y = 0.72 - 0.26 - 0.46 = 0.00m)
    l_sole = trimesh.creation.box([0.106, 0.035, 0.23])
    l_sole.apply_translation([0, -0.4425, -0.01])
    scene.add_geometry(apply_mat(l_sole, MAT_SOLE), node_name='LeftLeg_Sole')
    scene.graph.update(frame_to='LeftLeg_Sole', frame_from='LeftKneeRoot')

    # Marigold Heel Tab
    l_tab = trimesh.creation.box([0.03, 0.04, 0.015])
    l_tab.apply_translation([0, -0.39, 0.102])
    scene.add_geometry(apply_mat(l_tab, MAT_MARIGOLD), node_name='LeftLeg_HeelTab')
    scene.graph.update(frame_to='LeftLeg_HeelTab', frame_from='LeftKneeRoot')

    # =========================================================================
    # 4. RIGHT LEG (Hip Pivot at [-0.10, 0.72, 0]) & RIGHT KNEE
    # =========================================================================
    right_hip_pivot = [-0.10, 0.72, 0.0]
    scene.graph.update(frame_to='RightLegRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(right_hip_pivot))

    # Upper Thigh
    r_thigh = make_vert_cylinder(radius=0.072, height=0.26, sections=14)
    r_thigh.apply_translation([0, -0.13, 0])
    scene.add_geometry(apply_mat(r_thigh, MAT_PANTS), node_name='RightLeg_Thigh')
    scene.graph.update(frame_to='RightLeg_Thigh', frame_from='RightLegRoot')

    # Right Knee Joint
    right_knee_pivot = [0.0, -0.26, 0.0]
    scene.graph.update(frame_to='RightKneeRoot', frame_from='RightLegRoot',
                       matrix=trimesh.transformations.translation_matrix(right_knee_pivot))

    # Calf
    r_calf = make_vert_cylinder(radius=0.058, height=0.32, sections=14)
    r_calf.apply_translation([0, -0.16, 0])
    scene.add_geometry(apply_mat(r_calf, MAT_PANTS), node_name='RightLeg_Calf')
    scene.graph.update(frame_to='RightLeg_Calf', frame_from='RightKneeRoot')

    # Sneaker Upper
    r_shoe = trimesh.creation.box([0.10, 0.08, 0.22])
    r_shoe.apply_translation([0, -0.39, -0.01])
    scene.add_geometry(apply_mat(r_shoe, MAT_BAG), node_name='RightLeg_ShoeUpper')
    scene.graph.update(frame_to='RightLeg_ShoeUpper', frame_from='RightKneeRoot')

    # Sneaker Sole
    r_sole = trimesh.creation.box([0.106, 0.035, 0.23])
    r_sole.apply_translation([0, -0.4425, -0.01])
    scene.add_geometry(apply_mat(r_sole, MAT_SOLE), node_name='RightLeg_Sole')
    scene.graph.update(frame_to='RightLeg_Sole', frame_from='RightKneeRoot')

    # Marigold Heel Tab
    r_tab = trimesh.creation.box([0.03, 0.04, 0.015])
    r_tab.apply_translation([0, -0.39, 0.102])
    scene.add_geometry(apply_mat(r_tab, MAT_MARIGOLD), node_name='RightLeg_HeelTab')
    scene.graph.update(frame_to='RightLeg_HeelTab', frame_from='RightKneeRoot')

    # =========================================================================
    # 5. LEFT ARM (Shoulder Pivot at [0.22, 1.34, 0]) & LEFT ELBOW
    # =========================================================================
    left_shoulder_pivot = [0.22, 1.34, 0.0]
    scene.graph.update(frame_to='LeftArmRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(left_shoulder_pivot))

    l_arm_up = make_vert_cylinder(radius=0.052, height=0.22, sections=12)
    l_arm_up.apply_translation([0.03, -0.11, 0])
    scene.add_geometry(apply_mat(l_arm_up, MAT_TEAL), node_name='LeftArm_Upper')
    scene.graph.update(frame_to='LeftArm_Upper', frame_from='LeftArmRoot')

    # Left Elbow Pivot (at Y = -0.22)
    left_elbow_pivot = [0.03, -0.22, 0.0]
    scene.graph.update(frame_to='LeftElbowRoot', frame_from='LeftArmRoot',
                       matrix=trimesh.transformations.translation_matrix(left_elbow_pivot))

    l_arm_fore = make_vert_cylinder(radius=0.044, height=0.20, sections=12)
    l_arm_fore.apply_translation([0.02, -0.10, 0])
    scene.add_geometry(apply_mat(l_arm_fore, MAT_TEAL), node_name='LeftArm_Forearm')
    scene.graph.update(frame_to='LeftArm_Forearm', frame_from='LeftElbowRoot')

    l_hand = trimesh.creation.box([0.052, 0.075, 0.050])
    l_hand.apply_translation([0.02, -0.23, 0])
    scene.add_geometry(apply_mat(l_hand, MAT_SKIN), node_name='LeftArm_Hand')
    scene.graph.update(frame_to='LeftArm_Hand', frame_from='LeftElbowRoot')

    # =========================================================================
    # 6. RIGHT ARM (Shoulder Pivot at [-0.22, 1.34, 0]) & RIGHT ELBOW
    # =========================================================================
    right_shoulder_pivot = [-0.22, 1.34, 0.0]
    scene.graph.update(frame_to='RightArmRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(right_shoulder_pivot))

    r_arm_up = make_vert_cylinder(radius=0.052, height=0.22, sections=12)
    r_arm_up.apply_translation([-0.03, -0.11, 0])
    scene.add_geometry(apply_mat(r_arm_up, MAT_TEAL), node_name='RightArm_Upper')
    scene.graph.update(frame_to='RightArm_Upper', frame_from='RightArmRoot')

    # Right Elbow Pivot (at Y = -0.22)
    right_elbow_pivot = [-0.03, -0.22, 0.0]
    scene.graph.update(frame_to='RightElbowRoot', frame_from='RightArmRoot',
                       matrix=trimesh.transformations.translation_matrix(right_elbow_pivot))

    r_arm_fore = make_vert_cylinder(radius=0.044, height=0.20, sections=12)
    r_arm_fore.apply_translation([-0.02, -0.10, 0])
    scene.add_geometry(apply_mat(r_arm_fore, MAT_TEAL), node_name='RightArm_Forearm')
    scene.graph.update(frame_to='RightArm_Forearm', frame_from='RightElbowRoot')
    scene.graph.update(frame_to='RightArm_Forearm', frame_from='RightElbowRoot')

    r_hand = trimesh.creation.box([0.052, 0.075, 0.050])
    r_hand.apply_translation([-0.02, -0.23, 0])
    scene.add_geometry(apply_mat(r_hand, MAT_SKIN), node_name='RightArm_Hand')
    scene.graph.update(frame_to='RightArm_Hand', frame_from='RightElbowRoot')

    # =========================================================================
    # 7. SATCHEL ROOT (Hip Anchor Pivot at [-0.18, 0.95, 0.12])
    # =========================================================================
    satchel_pivot = [-0.18, 0.95, 0.12]
    scene.graph.update(frame_to='SatchelRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(satchel_pivot))

    satchel_body = trimesh.creation.box([0.16, 0.14, 0.09])
    rot_bag = trimesh.transformations.rotation_matrix(np.radians(-8), [0, 1, 0])
    satchel_body.apply_transform(rot_bag)
    scene.add_geometry(apply_mat(satchel_body, MAT_BAG), node_name='Satchel_Body')
    scene.graph.update(frame_to='Satchel_Body', frame_from='SatchelRoot')

    satchel_flap = trimesh.creation.box([0.165, 0.08, 0.095])
    satchel_flap.apply_transform(rot_bag)
    satchel_flap.apply_translation([0, 0.04, 0])
    scene.add_geometry(apply_mat(satchel_flap, MAT_BAG), node_name='Satchel_Flap')
    scene.graph.update(frame_to='Satchel_Flap', frame_from='SatchelRoot')

    return scene

def main():
    print("Building Enhanced Articulated Tuku (v0.3)...")
    scene = build_scene()

    total_triangles = sum(len(g.faces) for g in scene.geometry.values())
    total_vertices = sum(len(g.vertices) for g in scene.geometry.values())
    bounds = scene.bounds
    extents = scene.extents

    print(f"Total Geometries: {len(scene.geometry)}")
    print(f"Total Triangles: {total_triangles}")
    print(f"Total Vertices: {total_vertices}")
    print(f"Dimensions: {extents[0]:.3f}m x {extents[1]:.3f}m x {extents[2]:.3f}m")
    print(f"Bounds Min: {bounds[0]}")
    print(f"Bounds Max: {bounds[1]}")

    glb_data = scene.export(file_type='glb')

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    art_glb = os.path.join(base_dir, "art-source", "tuku_blockout_v02.glb")
    pub_glb = os.path.join(base_dir, "public", "models", "tuku_blockout_v02.glb")

    with open(art_glb, "wb") as f:
        f.write(glb_data)
    with open(pub_glb, "wb") as f:
        f.write(glb_data)

    print(f"Saved Enhanced Articulated GLB to {art_glb} and {pub_glb} ({len(glb_data)} bytes)")

if __name__ == "__main__":
    main()
