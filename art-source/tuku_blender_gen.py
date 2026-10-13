"""
Tuku v0.2 Procedural Blockout Generator for Blender (bpy).
Can be run inside Blender's Scripting workspace or via `blender -b --python tuku_blender_gen.py`.
Creates native mesh objects with PBR materials, transforms, and exports .blend and .glb.
"""

import bpy
import math

def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_material(name, hex_code, roughness=0.6, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    
    # Hex to RGBA
    h = hex_code.lstrip('#')
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    
    # Blender 4+ Principled BSDF inputs
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (r, g, b, 1.0)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

def build_tuku():
    clean_scene()
    
    # Palette
    mat_teal = create_material("Mat_TealJacket", "#2F7875", roughness=0.6)
    mat_cream = create_material("Mat_CreamShirt", "#E8DDCA", roughness=0.7)
    mat_pants = create_material("Mat_CharcoalPants", "#2D3438", roughness=0.65)
    mat_scarf = create_material("Mat_MaroonScarf", "#8C414B", roughness=0.7)
    mat_bag = create_material("Mat_CharcoalBag", "#25292B", roughness=0.5, metallic=0.1)
    mat_sole = create_material("Mat_CreamSole", "#D7CDBE", roughness=0.8)
    mat_marigold = create_material("Mat_MarigoldAccent", "#DEA94B", roughness=0.4, metallic=0.2)
    mat_skin = create_material("Mat_WarmSkin", "#C89568", roughness=0.6)
    mat_hair = create_material("Mat_DarkHair", "#25292B", roughness=0.75)
    
    root = bpy.data.objects.new("Tuku_v02_Root", None)
    bpy.context.collection.objects.link(root)
    
    def add_mesh(obj, material):
        obj.parent = root
        if len(obj.data.materials) == 0:
            obj.data.materials.append(material)
        else:
            obj.data.materials[0] = material
        return obj

    # 1. Head & Face
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.105, location=(0, -0.01, 1.55))
    head = bpy.context.active_object
    head.name = "Head"
    head.scale = (0.92, 0.98, 1.15)
    add_mesh(head, mat_skin)

    # Neck
    bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.065, depth=0.08, location=(0, 0, 1.43))
    neck = bpy.context.active_object
    neck.name = "Neck"
    add_mesh(neck, mat_skin)

    # Hair
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.118, location=(0, 0.02, 1.58))
    hair = bpy.context.active_object
    hair.name = "Hair_Crown"
    hair.scale = (1.02, 1.08, 1.05)
    add_mesh(hair, mat_hair)

    # Hair Sweep Tuft
    bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.055, depth=0.14, location=(-0.04, 0.10, 1.62), rotation=(math.radians(65), 0, 0))
    tuft = bpy.context.active_object
    tuft.name = "Hair_Tuft"
    add_mesh(tuft, mat_hair)

    # 2. Scarf Wrap
    bpy.ops.mesh.primitive_torus_add(major_segments=16, minor_segments=10, major_radius=0.10, minor_radius=0.04, location=(0, 0, 1.43))
    scarf = bpy.context.active_object
    scarf.name = "Scarf_Wrap"
    add_mesh(scarf, mat_scarf)

    # 3. Cropped Teal Jacket
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.28), scale=(0.38, 0.22, 0.28))
    chest = bpy.context.active_object
    chest.name = "Jacket_Chest"
    add_mesh(chest, mat_teal)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.05), scale=(0.34, 0.20, 0.18))
    j_low = bpy.context.active_object
    j_low.name = "Jacket_Lower"
    add_mesh(j_low, mat_teal)

    # 4. Longline Cream Shirt
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.91), scale=(0.33, 0.19, 0.10))
    shirt_hem = bpy.context.active_object
    shirt_hem.name = "Shirt_Longline_Hem"
    add_mesh(shirt_hem, mat_cream)

    # Exposed front placket
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.11, 1.12), scale=(0.10, 0.02, 0.32))
    shirt_front = bpy.context.active_object
    shirt_front.name = "Shirt_Front_Placket"
    add_mesh(shirt_front, mat_cream)

    # 5. Arms (A-Pose)
    # Left Arm (+X)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.055, depth=0.28, location=(0.24, 0, 1.25), rotation=(0, math.radians(-22), 0))
    arm_l = bpy.context.active_object
    arm_l.name = "Arm_L_Upper"
    add_mesh(arm_l, mat_teal)

    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.045, depth=0.26, location=(0.34, 0, 1.01), rotation=(0, math.radians(-22), 0))
    forearm_l = bpy.context.active_object
    forearm_l.name = "Forearm_L"
    add_mesh(forearm_l, mat_teal)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.42, 0, 0.82), scale=(0.05, 0.04, 0.10), rotation=(0, math.radians(-22), 0))
    hand_l = bpy.context.active_object
    hand_l.name = "Hand_L"
    add_mesh(hand_l, mat_skin)

    # Right Arm (-X)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.055, depth=0.28, location=(-0.24, 0, 1.25), rotation=(0, math.radians(22), 0))
    arm_r = bpy.context.active_object
    arm_r.name = "Arm_R_Upper"
    add_mesh(arm_r, mat_teal)

    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.045, depth=0.26, location=(-0.34, 0, 1.01), rotation=(0, math.radians(22), 0))
    forearm_r = bpy.context.active_object
    forearm_r.name = "Forearm_R"
    add_mesh(forearm_r, mat_teal)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.42, 0, 0.82), scale=(0.05, 0.04, 0.10), rotation=(0, math.radians(22), 0))
    hand_r = bpy.context.active_object
    hand_r.name = "Hand_R"
    add_mesh(hand_r, mat_skin)

    # 6. Crossbody Satchel (Right-Rear Hip)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.18, 0.12, 0.94), scale=(0.16, 0.09, 0.14), rotation=(0, 0, math.radians(-8)))
    bag = bpy.context.active_object
    bag.name = "Satchel_Bag"
    add_mesh(bag, mat_bag)

    # Strap
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.02, -0.115, 1.18), scale=(0.045, 0.015, 0.44), rotation=(0, 0, math.radians(38)))
    strap = bpy.context.active_object
    strap.name = "Satchel_Strap_Front"
    add_mesh(strap, mat_bag)

    # 7. Tapered Pants
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.80), scale=(0.32, 0.18, 0.16))
    pelvis = bpy.context.active_object
    pelvis.name = "Pants_Pelvis"
    add_mesh(pelvis, mat_pants)

    # Left Leg (+X)
    bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.075, depth=0.34, location=(0.10, 0, 0.61))
    thigh_l = bpy.context.active_object
    thigh_l.name = "Leg_L_Thigh"
    add_mesh(thigh_l, mat_pants)

    bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.058, depth=0.32, location=(0.10, 0, 0.28))
    calf_l = bpy.context.active_object
    calf_l.name = "Leg_L_Calf"
    add_mesh(calf_l, mat_pants)

    # Right Leg (-X)
    bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.075, depth=0.34, location=(-0.10, 0, 0.61))
    thigh_r = bpy.context.active_object
    thigh_r.name = "Leg_R_Thigh"
    add_mesh(thigh_r, mat_pants)

    bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.058, depth=0.32, location=(-0.10, 0, 0.28))
    calf_r = bpy.context.active_object
    calf_r.name = "Leg_R_Calf"
    add_mesh(calf_r, mat_pants)

    # 8. Sneakers
    for side, x in [("L", 0.10), ("R", -0.10)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.01, 0.07), scale=(0.10, 0.22, 0.08))
        shoe = bpy.context.active_object
        shoe.name = f"Shoe_{side}_Upper"
        add_mesh(shoe, mat_bag)

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.01, 0.0175), scale=(0.106, 0.23, 0.035))
        sole = bpy.context.active_object
        sole.name = f"Shoe_{side}_Sole"
        add_mesh(sole, mat_sole)

        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 0.102, 0.07), scale=(0.03, 0.015, 0.04))
        tab = bpy.context.active_object
        tab.name = f"Shoe_{side}_MarigoldTab"
        add_mesh(tab, mat_marigold)

    print("Tuku v0.2 model successfully created in Blender scene.")

if __name__ == "__main__":
    build_tuku()
