"""
Lakhey Guardian 3D Blockout Generator for Blender (bpy).
Creates editable 3D mesh objects with PBR materials in Blender:
- Height: 2.35m-2.5m, broad 0.85m chest span
- Ceremonial crimson robe & flared pleated skirt
- Gold brocade belt, collar, and brass wrist/ankle cuffs
- Cascading dark mane and theatrical terracotta guardian mask
"""

import bpy
import math

def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_mat(name, hex_code, roughness=0.6, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    h = hex_code.lstrip('#')
    r, g, b = int(h[0:2], 16)/255.0, int(h[2:4], 16)/255.0, int(h[4:6], 16)/255.0
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (r, g, b, 1.0)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

def build_lakhey_in_blender():
    clean_scene()

    mat_crimson = create_mat("Mat_LakheyCrimson", "#A31D1D", roughness=0.6)
    mat_gold = create_mat("Mat_LakheyGold", "#E5A93C", roughness=0.35, metallic=0.4)
    mat_mane = create_mat("Mat_LakheyMane", "#1A1412", roughness=0.8)
    mat_face = create_mat("Mat_LakheyFace", "#C2410C", roughness=0.65)
    mat_boots = create_mat("Mat_LakheyBoots", "#1E242B", roughness=0.7)

    root = bpy.data.objects.new("Lakhey_v01_Root", None)
    bpy.context.collection.objects.link(root)

    def add_mesh(obj, material):
        obj.parent = root
        if len(obj.data.materials) == 0:
            obj.data.materials.append(material)
        else:
            obj.data.materials[0] = material
        return obj

    # Torso
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.40), scale=(0.82, 0.42, 0.45))
    chest = bpy.context.active_object
    chest.name = "Lakhey_Chest"
    add_mesh(chest, mat_crimson)

    # Skirt
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.69), scale=(1.10, 0.65, 0.22))
    skirt = bpy.context.active_object
    skirt.name = "Lakhey_Skirt_Lower"
    add_mesh(skirt, mat_crimson)

    # Belt
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.13), scale=(0.76, 0.48, 0.10))
    belt = bpy.context.active_object
    belt.name = "Lakhey_Belt"
    add_mesh(belt, mat_gold)

    # Mane Cascading Drape (Upper, Mid, Lower)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.16, 2.10), scale=(0.96, 0.38, 0.38))
    m_up = bpy.context.active_object
    m_up.name = "Lakhey_Mane_Upper"
    add_mesh(m_up, mat_mane)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.20, 1.82), scale=(0.86, 0.35, 0.32))
    m_mid = bpy.context.active_object
    m_mid.name = "Lakhey_Mane_Mid"
    add_mesh(m_mid, mat_mane)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.22, 1.54), scale=(0.72, 0.30, 0.24))
    m_low = bpy.context.active_object
    m_low.name = "Lakhey_Mane_Lower"
    add_mesh(m_low, mat_mane)

    # Mask Visage
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.22, location=(0, -0.16, 2.04))
    face = bpy.context.active_object
    face.name = "Lakhey_Face"
    face.scale = (0.95, 0.85, 1.18)
    add_mesh(face, mat_face)

    # Boots
    for side, x in [("L", 0.18), ("R", -0.18)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, -0.02, 0.10), scale=(0.18, 0.34, 0.20))
        boot = bpy.context.active_object
        boot.name = f"Lakhey_Boot_{side}"
        add_mesh(boot, mat_boots)

    print("Lakhey Guardian model successfully built in Blender scene.")

if __name__ == "__main__":
    build_lakhey_in_blender()
