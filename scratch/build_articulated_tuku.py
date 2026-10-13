"""
Procedural generator for Articulated Tuku 3D Blockout (v0.2 specification).
Builds a hierarchical glTF node structure with true joint pivots for procedural running animation:
- LeftLegRoot (hip pivot at [0.10, 0.72, 0])
- RightLegRoot (hip pivot at [-0.10, 0.72, 0])
- LeftArmRoot (shoulder pivot at [0.22, 1.34, 0])
- RightArmRoot (shoulder pivot at [-0.22, 1.34, 0])
- HeadRoot (neck collar pivot at [0, 1.43, 0])
- TorsoRoot (pelvis/spine pivot at [0, 0.86, 0])
- SatchelRoot (hip anchor pivot at [-0.18, 0.95, 0.12])
Outputs standard glTF binary (.glb) with PBR materials and clean scene graph.
"""

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
import os

def hex_to_rgba(hex_str):
    h = hex_str.lstrip('#')
    return [int(h[0:2], 16)/255.0, int(h[2:4], 16)/255.0, int(h[4:6], 16)/255.0, 1.0]

# Materials matching v0.2 spec
MAT_TEAL = PBRMaterial(name="Mat_TealJacket", baseColorFactor=hex_to_rgba("#2F7875"), roughnessFactor=0.6, metallicFactor=0.05)
MAT_CREAM = PBRMaterial(name="Mat_CreamShirt", baseColorFactor=hex_to_rgba("#E8DDCA"), roughnessFactor=0.7, metallicFactor=0.0)
MAT_PANTS = PBRMaterial(name="Mat_CharcoalPants", baseColorFactor=hex_to_rgba("#2D3438"), roughnessFactor=0.65, metallicFactor=0.05)
MAT_SCARF = PBRMaterial(name="Mat_MaroonScarf", baseColorFactor=hex_to_rgba("#8C414B"), roughnessFactor=0.7, metallicFactor=0.0)
MAT_BAG = PBRMaterial(name="Mat_CharcoalBag", baseColorFactor=hex_to_rgba("#25292B"), roughnessFactor=0.5, metallicFactor=0.1)
MAT_SOLE = PBRMaterial(name="Mat_CreamSole", baseColorFactor=hex_to_rgba("#D7CDBE"), roughnessFactor=0.8, metallicFactor=0.0)
MAT_MARIGOLD = PBRMaterial(name="Mat_MarigoldAccent", baseColorFactor=hex_to_rgba("#DEA94B"), roughnessFactor=0.4, metallicFactor=0.2)
MAT_SKIN = PBRMaterial(name="Mat_WarmSkin", baseColorFactor=hex_to_rgba("#C89568"), roughnessFactor=0.6, metallicFactor=0.0)
MAT_HAIR = PBRMaterial(name="Mat_DarkHair", baseColorFactor=hex_to_rgba("#25292B"), roughnessFactor=0.75, metallicFactor=0.05)

def apply_mat(mesh, material):
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh

def build_scene():
    scene = trimesh.Scene()

    # =========================================================================
    # 1. TORSO & PELVIS ROOT (Pivot at [0, 0.86, 0])
    # =========================================================================
    torso_pivot = [0.0, 0.86, 0.0]
    scene.graph.update(frame_to='TorsoRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(torso_pivot))

    # Pelvis (local Y = 0.80 - 0.86 = -0.06)
    pelvis = trimesh.creation.box([0.32, 0.16, 0.18])
    pelvis.apply_translation([0, -0.06, 0])
    scene.add_geometry(apply_mat(pelvis, MAT_PANTS), node_name='Torso_Pelvis')
    scene.graph.update(frame_to='Torso_Pelvis', frame_from='TorsoRoot')

    # Shirt Longline Hem (local Y = 0.91 - 0.86 = +0.05)
    shirt_hem = trimesh.creation.box([0.33, 0.10, 0.19])
    shirt_hem.apply_translation([0, 0.05, 0])
    scene.add_geometry(apply_mat(shirt_hem, MAT_CREAM), node_name='Torso_ShirtHem')
    scene.graph.update(frame_to='Torso_ShirtHem', frame_from='TorsoRoot')

    # Jacket Lower (local Y = 1.05 - 0.86 = +0.19)
    j_low = trimesh.creation.box([0.34, 0.18, 0.20])
    j_low.apply_translation([0, 0.19, 0])
    scene.add_geometry(apply_mat(j_low, MAT_TEAL), node_name='Torso_JacketLower')
    scene.graph.update(frame_to='Torso_JacketLower', frame_from='TorsoRoot')

    # Jacket Ribbing (local Y = 0.96 - 0.86 = +0.10)
    j_rib = trimesh.creation.box([0.35, 0.04, 0.21])
    j_rib.apply_translation([0, 0.10, 0])
    scene.add_geometry(apply_mat(j_rib, MAT_TEAL), node_name='Torso_JacketRibbing')
    scene.graph.update(frame_to='Torso_JacketRibbing', frame_from='TorsoRoot')

    # Jacket Chest (local Y = 1.28 - 0.86 = +0.42)
    chest = trimesh.creation.box([0.38, 0.28, 0.22])
    chest.apply_translation([0, 0.42, 0])
    scene.add_geometry(apply_mat(chest, MAT_TEAL), node_name='Torso_Chest')
    scene.graph.update(frame_to='Torso_Chest', frame_from='TorsoRoot')

    # Shirt Front Placket (local Y = 1.12 - 0.86 = +0.26, Z = -0.11)
    shirt_front = trimesh.creation.box([0.10, 0.32, 0.02])
    shirt_front.apply_translation([0, 0.26, -0.11])
    scene.add_geometry(apply_mat(shirt_front, MAT_CREAM), node_name='Torso_ShirtFront')
    scene.graph.update(frame_to='Torso_ShirtFront', frame_from='TorsoRoot')

    # Diagonal Straps across Torso
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

    # Neck (local Y = 0.0)
    neck = trimesh.creation.cylinder(radius=0.065, height=0.08, sections=14)
    scene.add_geometry(apply_mat(neck, MAT_SKIN), node_name='Head_Neck')
    scene.graph.update(frame_to='Head_Neck', frame_from='HeadRoot')

    # Scarf Ring (local Y = 0.0)
    scarf_ring = trimesh.creation.torus(major_radius=0.10, minor_radius=0.04, major_sections=18, minor_sections=10)
    scarf_ring.apply_scale([1.1, 1.0, 1.0])
    scene.add_geometry(apply_mat(scarf_ring, MAT_SCARF), node_name='Head_Scarf')
    scene.graph.update(frame_to='Head_Scarf', frame_from='HeadRoot')

    # Scarf Knot (local Y = -0.04, Z = -0.11)
    scarf_knot = trimesh.creation.box([0.05, 0.08, 0.04])
    scarf_knot.apply_translation([0.06, -0.04, -0.11])
    scene.add_geometry(apply_mat(scarf_knot, MAT_SCARF), node_name='Head_ScarfKnot')
    scene.graph.update(frame_to='Head_ScarfKnot', frame_from='HeadRoot')

    # Face Oval (local Y = 1.55 - 1.43 = +0.12)
    head_mesh = trimesh.creation.icosphere(subdivisions=2, radius=0.105)
    head_mesh.apply_scale([0.92, 1.15, 0.98])
    head_mesh.apply_translation([0, 0.12, -0.01])
    scene.add_geometry(apply_mat(head_mesh, MAT_SKIN), node_name='Head_Face')
    scene.graph.update(frame_to='Head_Face', frame_from='HeadRoot')

    # Hair Cap (local Y = 1.58 - 1.43 = +0.15)
    hair_cap = trimesh.creation.icosphere(subdivisions=2, radius=0.118)
    hair_cap.apply_scale([1.02, 1.05, 1.08])
    hair_cap.apply_translation([0, 0.15, 0.02])
    scene.add_geometry(apply_mat(hair_cap, MAT_HAIR), node_name='Head_HairCrown')
    scene.graph.update(frame_to='Head_HairCrown', frame_from='HeadRoot')

    # Hair Tuft Sweep (local Y = 1.62 - 1.43 = +0.19)
    hair_tuft = trimesh.creation.cone(radius=0.055, height=0.14, sections=10)
    rot_tuft = trimesh.transformations.rotation_matrix(np.radians(65), [1, 0, 0])
    hair_tuft.apply_transform(rot_tuft)
    hair_tuft.apply_translation([-0.04, 0.19, 0.10])
    scene.add_geometry(apply_mat(hair_tuft, MAT_HAIR), node_name='Head_HairTuft')
    scene.graph.update(frame_to='Head_HairTuft', frame_from='HeadRoot')

    # Front Bangs
    bangs = trimesh.creation.box([0.12, 0.05, 0.06])
    rot_b = trimesh.transformations.rotation_matrix(np.radians(-25), [1, 0, 0])
    bangs.apply_transform(rot_b)
    bangs.apply_translation([0.02, 0.20, -0.10])
    scene.add_geometry(apply_mat(bangs, MAT_HAIR), node_name='Head_HairBangs')
    scene.graph.update(frame_to='Head_HairBangs', frame_from='HeadRoot')

    # =========================================================================
    # 3. LEFT LEG ROOT (Hip Pivot at [0.10, 0.72, 0])
    # =========================================================================
    left_hip_pivot = [0.10, 0.72, 0.0]
    scene.graph.update(frame_to='LeftLegRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(left_hip_pivot))

    # Thigh: from hip Y=0 down to -0.22 (center Y = -0.11)
    l_thigh = trimesh.creation.cylinder(radius=0.075, height=0.22, sections=14)
    l_thigh.apply_translation([0, -0.11, 0])
    scene.add_geometry(apply_mat(l_thigh, MAT_PANTS), node_name='LeftLeg_Thigh')
    scene.graph.update(frame_to='LeftLeg_Thigh', frame_from='LeftLegRoot')

    # Calf: from Y=-0.22 down to -0.60 (center Y = -0.41)
    l_calf = trimesh.creation.cylinder(radius=0.058, height=0.38, sections=14)
    l_calf.apply_translation([0, -0.41, 0])
    scene.add_geometry(apply_mat(l_calf, MAT_PANTS), node_name='LeftLeg_Calf')
    scene.graph.update(frame_to='LeftLeg_Calf', frame_from='LeftLegRoot')

    # Shoe Upper: local Y = 0.07 - 0.72 = -0.65
    l_shoe = trimesh.creation.box([0.10, 0.08, 0.22])
    l_shoe.apply_translation([0, -0.65, -0.01])
    scene.add_geometry(apply_mat(l_shoe, MAT_BAG), node_name='LeftLeg_ShoeUpper')
    scene.graph.update(frame_to='LeftLeg_ShoeUpper', frame_from='LeftLegRoot')

    # Shoe Sole: local Y = 0.0175 - 0.72 = -0.7025
    l_sole = trimesh.creation.box([0.106, 0.035, 0.23])
    l_sole.apply_translation([0, -0.7025, -0.01])
    scene.add_geometry(apply_mat(l_sole, MAT_SOLE), node_name='LeftLeg_Sole')
    scene.graph.update(frame_to='LeftLeg_Sole', frame_from='LeftLegRoot')

    # Heel Tab: local Y = 0.07 - 0.72 = -0.65, Z = 0.102
    l_tab = trimesh.creation.box([0.03, 0.04, 0.015])
    l_tab.apply_translation([0, -0.65, 0.102])
    scene.add_geometry(apply_mat(l_tab, MAT_MARIGOLD), node_name='LeftLeg_HeelTab')
    scene.graph.update(frame_to='LeftLeg_HeelTab', frame_from='LeftLegRoot')

    # =========================================================================
    # 4. RIGHT LEG ROOT (Hip Pivot at [-0.10, 0.72, 0])
    # =========================================================================
    right_hip_pivot = [-0.10, 0.72, 0.0]
    scene.graph.update(frame_to='RightLegRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(right_hip_pivot))

    r_thigh = trimesh.creation.cylinder(radius=0.075, height=0.22, sections=14)
    r_thigh.apply_translation([0, -0.11, 0])
    scene.add_geometry(apply_mat(r_thigh, MAT_PANTS), node_name='RightLeg_Thigh')
    scene.graph.update(frame_to='RightLeg_Thigh', frame_from='RightLegRoot')

    r_calf = trimesh.creation.cylinder(radius=0.058, height=0.38, sections=14)
    r_calf.apply_translation([0, -0.41, 0])
    scene.add_geometry(apply_mat(r_calf, MAT_PANTS), node_name='RightLeg_Calf')
    scene.graph.update(frame_to='RightLeg_Calf', frame_from='RightLegRoot')

    r_shoe = trimesh.creation.box([0.10, 0.08, 0.22])
    r_shoe.apply_translation([0, -0.65, -0.01])
    scene.add_geometry(apply_mat(r_shoe, MAT_BAG), node_name='RightLeg_ShoeUpper')
    scene.graph.update(frame_to='RightLeg_ShoeUpper', frame_from='RightLegRoot')

    r_sole = trimesh.creation.box([0.106, 0.035, 0.23])
    r_sole.apply_translation([0, -0.7025, -0.01])
    scene.add_geometry(apply_mat(r_sole, MAT_SOLE), node_name='RightLeg_Sole')
    scene.graph.update(frame_to='RightLeg_Sole', frame_from='RightLegRoot')

    r_tab = trimesh.creation.box([0.03, 0.04, 0.015])
    r_tab.apply_translation([0, -0.65, 0.102])
    scene.add_geometry(apply_mat(r_tab, MAT_MARIGOLD), node_name='RightLeg_HeelTab')
    scene.graph.update(frame_to='RightLeg_HeelTab', frame_from='RightLegRoot')

    # =========================================================================
    # 5. LEFT ARM ROOT (Shoulder Pivot at [0.22, 1.34, 0])
    # =========================================================================
    left_shoulder_pivot = [0.22, 1.34, 0.0]
    scene.graph.update(frame_to='LeftArmRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(left_shoulder_pivot))

    # Upper Arm: starts at shoulder, angled down/out
    l_arm_up = trimesh.creation.cylinder(radius=0.055, height=0.26, sections=12)
    rot_arm_l = trimesh.transformations.rotation_matrix(np.radians(-18), [0, 0, 1])
    l_arm_up.apply_transform(rot_arm_l)
    l_arm_up.apply_translation([0.04, -0.12, 0])
    scene.add_geometry(apply_mat(l_arm_up, MAT_TEAL), node_name='LeftArm_Upper')
    scene.graph.update(frame_to='LeftArm_Upper', frame_from='LeftArmRoot')

    # Forearm
    l_arm_fore = trimesh.creation.cylinder(radius=0.045, height=0.24, sections=12)
    l_arm_fore.apply_transform(rot_arm_l)
    l_arm_fore.apply_translation([0.11, -0.32, 0])
    scene.add_geometry(apply_mat(l_arm_fore, MAT_TEAL), node_name='LeftArm_Forearm')
    scene.graph.update(frame_to='LeftArm_Forearm', frame_from='LeftArmRoot')

    # Hand
    l_hand = trimesh.creation.box([0.05, 0.09, 0.04])
    l_hand.apply_transform(rot_arm_l)
    l_hand.apply_translation([0.16, -0.47, 0])
    scene.add_geometry(apply_mat(l_hand, MAT_SKIN), node_name='LeftArm_Hand')
    scene.graph.update(frame_to='LeftArm_Hand', frame_from='LeftArmRoot')

    # =========================================================================
    # 6. RIGHT ARM ROOT (Shoulder Pivot at [-0.22, 1.34, 0])
    # =========================================================================
    right_shoulder_pivot = [-0.22, 1.34, 0.0]
    scene.graph.update(frame_to='RightArmRoot', frame_from='world',
                       matrix=trimesh.transformations.translation_matrix(right_shoulder_pivot))

    r_arm_up = trimesh.creation.cylinder(radius=0.055, height=0.26, sections=12)
    rot_arm_r = trimesh.transformations.rotation_matrix(np.radians(18), [0, 0, 1])
    r_arm_up.apply_transform(rot_arm_r)
    r_arm_up.apply_translation([-0.04, -0.12, 0])
    scene.add_geometry(apply_mat(r_arm_up, MAT_TEAL), node_name='RightArm_Upper')
    scene.graph.update(frame_to='RightArm_Upper', frame_from='RightArmRoot')

    r_arm_fore = trimesh.creation.cylinder(radius=0.045, height=0.24, sections=12)
    r_arm_fore.apply_transform(rot_arm_r)
    r_arm_fore.apply_translation([-0.11, -0.32, 0])
    scene.add_geometry(apply_mat(r_arm_fore, MAT_TEAL), node_name='RightArm_Forearm')
    scene.graph.update(frame_to='RightArm_Forearm', frame_from='RightArmRoot')

    r_hand = trimesh.creation.box([0.05, 0.09, 0.04])
    r_hand.apply_transform(rot_arm_r)
    r_hand.apply_translation([-0.16, -0.47, 0])
    scene.add_geometry(apply_mat(r_hand, MAT_SKIN), node_name='RightArm_Hand')
    scene.graph.update(frame_to='RightArm_Hand', frame_from='RightArmRoot')

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
    print("Generating Articulated Tuku v0.2 with Procedural Joint Nodes...")
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

    print(f"Saved Articulated GLB to {art_glb} and {pub_glb} ({len(glb_data)} bytes)")

if __name__ == "__main__":
    main()
