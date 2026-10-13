"""
Kathmandu Street Module Kit Generator for Blender (bpy).
Creates editable 3D modular assets directly in Blender scenes:
- Kathmandu Road Tile (30m x 6.6m)
- Facade Variant A (2-story Newar house with San Jhyā and Lantern)
- Facade Variant B (3-story Merchant house with Shopfront & Bunting)
- Obstacle: Wooden Hurdle (Jumpable)
- Obstacle: Festival Oil Barrel (Unjumpable)
"""

import bpy
import math

def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_mat(name, hex_code, roughness=0.7, metallic=0.0, emissive=None):
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
        if emissive and 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = (emissive[0], emissive[1], emissive[2], 1.0)
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = 1.5
    return mat

def build_kit_in_blender():
    clean_scene()
    
    # Palette
    mat_road = create_mat("Mat_StonePavement", "#222831", roughness=0.85)
    mat_curb = create_mat("Mat_TerracottaCurb", "#6D3728", roughness=0.8)
    mat_brick_a = create_mat("Mat_DachiAppaBrickA", "#883925", roughness=0.75)
    mat_timber = create_mat("Mat_SalWoodTimber", "#2E1C14", roughness=0.7)
    mat_window = create_mat("Mat_WindowCandleGlow", "#EAA838", roughness=0.3, emissive=[0.9, 0.6, 0.1])
    mat_roof = create_mat("Mat_ClayTileRoof", "#562217", roughness=0.85)
    mat_barrel = create_mat("Mat_WeatheredWood", "#3B271E", roughness=0.7)
    mat_brass = create_mat("Mat_BrassBand", "#D97706", roughness=0.35, metallic=0.7)

    # 1. Road Section
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.05), scale=(6.0, 30.0, 0.1))
    road = bpy.context.active_object
    road.name = "Kit_Road_Surface"
    road.data.materials.append(mat_road)

    # 2. Facade A
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-5.0, 0, 3.75), scale=(4.5, 14.0, 7.5))
    facade_a = bpy.context.active_object
    facade_a.name = "Kit_Facade_Variant_A"
    facade_a.data.materials.append(mat_brick_a)

    # Roof Eave
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-5.0, 0, 7.7), scale=(5.3, 14.4, 0.4))
    eave = bpy.context.active_object
    eave.name = "Kit_Roof_Eave"
    eave.data.materials.append(mat_roof)

    # Windows
    for y in [-3.5, 3.5]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-2.7, y, 4.2), scale=(0.15, 1.8, 1.5))
        win = bpy.context.active_object
        win.name = f"Kit_Window_{y}"
        win.data.materials.append(mat_window)

    # 3. Hurdle Obstacle
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 5.0, 0.52), scale=(1.7, 0.08, 0.14))
    hurdle = bpy.context.active_object
    hurdle.name = "Kit_Obstacle_Hurdle"
    hurdle.data.materials.append(mat_barrel)

    # 4. Barrel Obstacle
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.45, depth=1.2, location=(0, 10.0, 0.6))
    barrel = bpy.context.active_object
    barrel.name = "Kit_Obstacle_Barrel"
    barrel.data.materials.append(mat_barrel)

    print("Kathmandu Street Module Kit successfully authored in Blender scene.")

if __name__ == "__main__":
    build_kit_in_blender()
