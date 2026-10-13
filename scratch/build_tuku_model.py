"""
Procedural generator for Tuku 3D static blockout (v0.2 specification).
Creates clean stylized geometry matching the approved 1.68m orthographic turnaround.
Outputs standard glTF binary (.glb) with PBR materials and clean transforms.
"""

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
import os

def hex_to_rgba(hex_str):
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0
    return [r, g, b, 1.0]

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

def create_tuku_blockout():
    parts = []

    # ----------------------------------------------------
    # 1. HEAD & HAIR (1.44m to 1.68m)
    # ----------------------------------------------------
    # Neck
    neck = trimesh.creation.cylinder(radius=0.065, height=0.08, sections=14)
    neck.apply_translation([0, 1.43, 0])
    parts.append(apply_mat(neck, MAT_SKIN))

    # Head / Face
    head = trimesh.creation.icosphere(subdivisions=2, radius=0.105)
    # Scale slightly along Y for young adult oval face
    head.apply_scale([0.92, 1.15, 0.98])
    head.apply_translation([0, 1.55, -0.01])
    parts.append(apply_mat(head, MAT_SKIN))

    # Ears
    ear_l = trimesh.creation.icosphere(subdivisions=1, radius=0.024)
    ear_l.apply_scale([0.4, 1.3, 0.8])
    ear_l.apply_translation([0.10, 1.55, -0.01])
    parts.append(apply_mat(ear_l, MAT_SKIN))

    ear_r = trimesh.creation.icosphere(subdivisions=1, radius=0.024)
    ear_r.apply_scale([0.4, 1.3, 0.8])
    ear_r.apply_translation([-0.10, 1.55, -0.01])
    parts.append(apply_mat(ear_r, MAT_SKIN))

    # Hair - Crown volume & rear asymmetric sweep
    hair_cap = trimesh.creation.icosphere(subdivisions=2, radius=0.118)
    hair_cap.apply_scale([1.02, 1.05, 1.08])
    hair_cap.apply_translation([0, 1.58, 0.02])
    parts.append(apply_mat(hair_cap, MAT_HAIR))

    # Hair Tuft Sweep (protruding slightly rear-left)
    hair_tuft = trimesh.creation.cone(radius=0.055, height=0.14, sections=10)
    # Rotate tuft back and slightly left (+Z, -X)
    rot_tuft = trimesh.transformations.rotation_matrix(np.radians(65), [1, 0, 0])
    hair_tuft.apply_transform(rot_tuft)
    hair_tuft.apply_translation([-0.04, 1.62, 0.10])
    parts.append(apply_mat(hair_tuft, MAT_HAIR))

    # Front bangs tuft
    bangs = trimesh.creation.box([0.12, 0.05, 0.06])
    rot_b = trimesh.transformations.rotation_matrix(np.radians(-25), [1, 0, 0])
    bangs.apply_transform(rot_b)
    bangs.apply_translation([0.02, 1.63, -0.10])
    parts.append(apply_mat(bangs, MAT_HAIR))

    # ----------------------------------------------------
    # 2. SCARF / NECK WRAP (1.40m to 1.48m)
    # ----------------------------------------------------
    scarf_ring = trimesh.creation.torus(major_radius=0.10, minor_radius=0.04, major_sections=18, minor_sections=10)
    scarf_ring.apply_scale([1.1, 1.0, 1.0])
    scarf_ring.apply_translation([0, 1.43, 0])
    parts.append(apply_mat(scarf_ring, MAT_SCARF))

    # Scarf knot tuck on wearer's left (+X, front -Z)
    scarf_knot = trimesh.creation.box([0.05, 0.08, 0.04])
    scarf_knot.apply_translation([0.06, 1.39, -0.11])
    parts.append(apply_mat(scarf_knot, MAT_SCARF))

    # ----------------------------------------------------
    # 3. CROPPED JACKET (0.96m to 1.42m) - DUSTY TEAL
    # ----------------------------------------------------
    # Upper chest / shoulders
    chest = trimesh.creation.box([0.38, 0.28, 0.22])
    chest.apply_translation([0, 1.28, 0])
    parts.append(apply_mat(chest, MAT_TEAL))

    # Lower torso / waist of cropped jacket
    jacket_lower = trimesh.creation.box([0.34, 0.18, 0.20])
    jacket_lower.apply_translation([0, 1.05, 0])
    parts.append(apply_mat(jacket_lower, MAT_TEAL))

    # Jacket Hem Ribbing
    jacket_hem = trimesh.creation.box([0.35, 0.04, 0.21])
    jacket_hem.apply_translation([0, 0.96, 0])
    parts.append(apply_mat(jacket_hem, MAT_TEAL))

    # ----------------------------------------------------
    # 4. LONGLINE CREAM SHIRT (extends 8-10cm below jacket)
    # ----------------------------------------------------
    # Front shirt exposed center strip under open jacket
    shirt_front = trimesh.creation.box([0.10, 0.32, 0.02])
    shirt_front.apply_translation([0, 1.12, -0.11])
    parts.append(apply_mat(shirt_front, MAT_CREAM))

    # Shirt lower hem extending from Y=0.86 to 0.96m (10cm drop)
    shirt_hem = trimesh.creation.box([0.33, 0.10, 0.19])
    shirt_hem.apply_translation([0, 0.91, 0])
    parts.append(apply_mat(shirt_hem, MAT_CREAM))

    # ----------------------------------------------------
    # 5. ARMS IN A-POSE (Abducted ~20-22°)
    # ----------------------------------------------------
    arm_length = 0.58
    # Left Arm (wearer's left = +X)
    left_upper = trimesh.creation.cylinder(radius=0.055, height=0.28, sections=12)
    # Abduction rotation around Z axis (-22 degrees)
    rot_l = trimesh.transformations.rotation_matrix(np.radians(-22), [0, 0, 1])
    left_upper.apply_transform(rot_l)
    left_upper.apply_translation([0.24, 1.25, 0])
    parts.append(apply_mat(left_upper, MAT_TEAL))

    left_forearm = trimesh.creation.cylinder(radius=0.045, height=0.26, sections=12)
    left_forearm.apply_transform(rot_l)
    left_forearm.apply_translation([0.34, 1.01, 0])
    parts.append(apply_mat(left_forearm, MAT_TEAL))

    left_hand = trimesh.creation.box([0.05, 0.10, 0.04])
    left_hand.apply_transform(rot_l)
    left_hand.apply_translation([0.42, 0.82, 0])
    parts.append(apply_mat(left_hand, MAT_SKIN))

    # Right Arm (wearer's right = -X)
    right_upper = trimesh.creation.cylinder(radius=0.055, height=0.28, sections=12)
    rot_r = trimesh.transformations.rotation_matrix(np.radians(22), [0, 0, 1])
    right_upper.apply_transform(rot_r)
    right_upper.apply_translation([-0.24, 1.25, 0])
    parts.append(apply_mat(right_upper, MAT_TEAL))

    right_forearm = trimesh.creation.cylinder(radius=0.045, height=0.26, sections=12)
    right_forearm.apply_transform(rot_r)
    right_forearm.apply_translation([-0.34, 1.01, 0])
    parts.append(apply_mat(right_forearm, MAT_TEAL))

    right_hand = trimesh.creation.box([0.05, 0.10, 0.04])
    right_hand.apply_transform(rot_r)
    right_hand.apply_translation([-0.42, 0.82, 0])
    parts.append(apply_mat(right_hand, MAT_SKIN))

    # ----------------------------------------------------
    # 6. CROSSBODY SATCHEL & DIAGONAL STRAP
    # ----------------------------------------------------
    # Satchel Bag on wearer's RIGHT-REAR HIP (-X, +Z)
    satchel_body = trimesh.creation.box([0.16, 0.14, 0.09])
    # Slight tilt to sit naturally on hip
    rot_bag = trimesh.transformations.rotation_matrix(np.radians(-8), [0, 1, 0])
    satchel_body.apply_transform(rot_bag)
    satchel_body.apply_translation([-0.18, 0.94, 0.12])
    parts.append(apply_mat(satchel_body, MAT_BAG))

    # Satchel Flap
    satchel_flap = trimesh.creation.box([0.165, 0.08, 0.095])
    satchel_flap.apply_transform(rot_bag)
    satchel_flap.apply_translation([-0.18, 0.98, 0.12])
    parts.append(apply_mat(satchel_flap, MAT_BAG))

    # Diagonal Strap across Chest (from +X, Y=1.38, Z=-0.11 down to -X, Y=0.98, Z=-0.08)
    front_strap = trimesh.creation.box([0.045, 0.44, 0.015])
    # Angle from wearer left shoulder to right hip (~40 degrees)
    rot_strap = trimesh.transformations.rotation_matrix(np.radians(38), [0, 0, 1])
    front_strap.apply_transform(rot_strap)
    front_strap.apply_translation([0.02, 1.18, -0.115])
    parts.append(apply_mat(front_strap, MAT_BAG))

    # Diagonal Strap across Back (from +X, Y=1.38, Z=+0.11 down to -X, Y=0.98, Z=+0.11)
    back_strap = trimesh.creation.box([0.045, 0.44, 0.015])
    rot_back_strap = trimesh.transformations.rotation_matrix(np.radians(-38), [0, 0, 1])
    back_strap.apply_transform(rot_back_strap)
    back_strap.apply_translation([0.02, 1.18, 0.115])
    parts.append(apply_mat(back_strap, MAT_BAG))

    # ----------------------------------------------------
    # 7. TAPERED CHARCOAL TROUSERS (0.12m to 0.86m)
    # ----------------------------------------------------
    # Pelvis / Hips
    pelvis = trimesh.creation.box([0.32, 0.16, 0.18])
    pelvis.apply_translation([0, 0.80, 0])
    parts.append(apply_mat(pelvis, MAT_PANTS))

    # Left Leg (wearer's left = +X)
    # Upper thigh
    left_thigh = trimesh.creation.cylinder(radius=0.075, height=0.34, sections=14)
    left_thigh.apply_translation([0.10, 0.61, 0])
    parts.append(apply_mat(left_thigh, MAT_PANTS))

    # Lower calf (tapered)
    left_calf = trimesh.creation.cylinder(radius=0.058, height=0.32, sections=14)
    left_calf.apply_translation([0.10, 0.28, 0])
    parts.append(apply_mat(left_calf, MAT_PANTS))

    # Right Leg (wearer's right = -X)
    # Upper thigh
    right_thigh = trimesh.creation.cylinder(radius=0.075, height=0.34, sections=14)
    right_thigh.apply_translation([-0.10, 0.61, 0])
    parts.append(apply_mat(right_thigh, MAT_PANTS))

    # Lower calf (tapered)
    right_calf = trimesh.creation.cylinder(radius=0.058, height=0.32, sections=14)
    right_calf.apply_translation([-0.10, 0.28, 0])
    parts.append(apply_mat(right_calf, MAT_PANTS))

    # ----------------------------------------------------
    # 8. SNEAKERS WITH CREAM SOLE & MARIGOLD TAB (0.00m to 0.12m)
    # ----------------------------------------------------
    # Left Sneaker
    left_shoe_upper = trimesh.creation.box([0.10, 0.08, 0.22])
    left_shoe_upper.apply_translation([0.10, 0.07, -0.01])
    parts.append(apply_mat(left_shoe_upper, MAT_BAG))

    left_shoe_sole = trimesh.creation.box([0.106, 0.035, 0.23])
    left_shoe_sole.apply_translation([0.10, 0.0175, -0.01])
    parts.append(apply_mat(left_shoe_sole, MAT_SOLE))

    left_heel_tab = trimesh.creation.box([0.03, 0.04, 0.015])
    left_heel_tab.apply_translation([0.10, 0.07, 0.102])
    parts.append(apply_mat(left_heel_tab, MAT_MARIGOLD))

    # Right Sneaker
    right_shoe_upper = trimesh.creation.box([0.10, 0.08, 0.22])
    right_shoe_upper.apply_translation([-0.10, 0.07, -0.01])
    parts.append(apply_mat(right_shoe_upper, MAT_BAG))

    right_shoe_sole = trimesh.creation.box([0.106, 0.035, 0.23])
    right_shoe_sole.apply_translation([-0.10, 0.0175, -0.01])
    parts.append(apply_mat(right_shoe_sole, MAT_SOLE))

    right_heel_tab = trimesh.creation.box([0.03, 0.04, 0.015])
    right_heel_tab.apply_translation([-0.10, 0.07, 0.102])
    parts.append(apply_mat(right_heel_tab, MAT_MARIGOLD))

    return parts

def main():
    print("Generating Tuku v0.2 Static 3D Blockout...")
    parts = create_tuku_blockout()

    scene = trimesh.Scene()
    total_triangles = 0
    total_vertices = 0

    for i, mesh in enumerate(parts):
        node_name = f"tuku_part_{i:02d}"
        scene.add_geometry(mesh, node_name=node_name)
        total_triangles += len(mesh.faces)
        total_vertices += len(mesh.vertices)

    bounds = scene.bounds
    extents = scene.extents
    print(f"Total parts: {len(parts)}")
    print(f"Total Triangles: {total_triangles}")
    print(f"Total Vertices: {total_vertices}")
    print(f"Bounds Min: {bounds[0]}")
    print(f"Bounds Max: {bounds[1]}")
    print(f"Dimensions (W x H x D): {extents[0]:.3f}m x {extents[1]:.3f}m x {extents[2]:.3f}m")

    # Export to GLB
    glb_data = scene.export(file_type='glb')

    # Output paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    art_glb_path = os.path.join(base_dir, "art-source", "tuku_blockout_v02.glb")
    public_dir = os.path.join(base_dir, "public", "models")
    os.makedirs(public_dir, exist_ok=True)
    public_glb_path = os.path.join(public_dir, "tuku_blockout_v02.glb")

    with open(art_glb_path, "wb") as f:
        f.write(glb_data)
    print(f"Saved GLB to: {art_glb_path} ({len(glb_data)} bytes)")

    with open(public_glb_path, "wb") as f:
        f.write(glb_data)
    print(f"Saved GLB to: {public_glb_path} ({len(glb_data)} bytes)")

if __name__ == "__main__":
    main()
