"""
Procedural 3D Asset Generator for Kathmandu Street Module Kit (T008).
Generates 5 modular glTF/GLB models for Lakhey Run:
1. kathmandu_road_tile.glb: 30m repeating 3-lane street section with stone curbs & lane dashes.
2. kathmandu_facade_variant_a.glb: 2-story Newar brick house with San Jhyā window, eaves & lantern.
3. kathmandu_facade_variant_b.glb: 3-story merchant house with ground shopfront, Aki Jhyā lattice & festival bunting.
4. kathmandu_obstacle_hurdle.glb: Jumpable low wooden barrier hurdle (0.65m high, 1.7m wide).
5. kathmandu_obstacle_barrel.glb: Unjumpable festival oil barrel with brass rings (1.25m high, 0.9m wide).
"""

import os
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

def hex_to_rgba(hex_str):
    h = hex_str.lstrip('#')
    return [int(h[0:2], 16)/255.0, int(h[2:4], 16)/255.0, int(h[4:6], 16)/255.0, 1.0]

# PBR Material Palette for Kathmandu Built Heritage
MAT_ROAD = PBRMaterial(name="Mat_StonePavement", baseColorFactor=hex_to_rgba("#222831"), roughnessFactor=0.85, metallicFactor=0.0)
MAT_CURB = PBRMaterial(name="Mat_TerracottaCurb", baseColorFactor=hex_to_rgba("#6D3728"), roughnessFactor=0.8, metallicFactor=0.0)
MAT_LANE_LINE = PBRMaterial(name="Mat_CreamLaneLine", baseColorFactor=hex_to_rgba("#C2BBA8"), roughnessFactor=0.7, metallicFactor=0.0)

MAT_BRICK_A = PBRMaterial(name="Mat_DachiAppaBrickA", baseColorFactor=hex_to_rgba("#883925"), roughnessFactor=0.75, metallicFactor=0.0)
MAT_BRICK_B = PBRMaterial(name="Mat_AgedClayBrickB", baseColorFactor=hex_to_rgba("#702E1E"), roughnessFactor=0.8, metallicFactor=0.0)
MAT_TIMBER = PBRMaterial(name="Mat_SalWoodTimber", baseColorFactor=hex_to_rgba("#2E1C14"), roughnessFactor=0.7, metallicFactor=0.05)
MAT_WINDOW_GLOW = PBRMaterial(name="Mat_WindowCandleGlow", baseColorFactor=hex_to_rgba("#EAA838"), roughnessFactor=0.3, emissiveFactor=[0.8, 0.5, 0.1])
MAT_ROOF_TILE = PBRMaterial(name="Mat_ClayTileRoof", baseColorFactor=hex_to_rgba("#562217"), roughnessFactor=0.85, metallicFactor=0.0)

MAT_LANTERN_GOLD = PBRMaterial(name="Mat_LanternAmberGlow", baseColorFactor=hex_to_rgba("#F59E0B"), roughnessFactor=0.2, emissiveFactor=[1.0, 0.65, 0.15])
MAT_BRASS = PBRMaterial(name="Mat_BrassBand", baseColorFactor=hex_to_rgba("#D97706"), roughnessFactor=0.35, metallicFactor=0.6)
MAT_BARRIER_WOOD = PBRMaterial(name="Mat_WeatheredWood", baseColorFactor=hex_to_rgba("#3B271E"), roughnessFactor=0.7, metallicFactor=0.0)
MAT_BARRIER_WARNING = PBRMaterial(name="Mat_FestivalFestoon", baseColorFactor=hex_to_rgba("#DC2626"), roughnessFactor=0.6, metallicFactor=0.0)

# Festival Bunting Colors (Triangular Cloth Flags)
MAT_FLAG_YELLOW = PBRMaterial(name="Mat_FlagYellow", baseColorFactor=hex_to_rgba("#FBBF24"), roughnessFactor=0.6)
MAT_FLAG_RED = PBRMaterial(name="Mat_FlagRed", baseColorFactor=hex_to_rgba("#EF4444"), roughnessFactor=0.6)
MAT_FLAG_BLUE = PBRMaterial(name="Mat_FlagBlue", baseColorFactor=hex_to_rgba("#3B82F6"), roughnessFactor=0.6)

def apply_mat(mesh, material):
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh

# -----------------------------------------------------------------------------
# 1. TILEABLE ROAD SECTION (30m x 6.6m)
# -----------------------------------------------------------------------------
def build_road_tile():
    scene = trimesh.Scene()
    road_width = 6.0
    tile_length = 30.0

    # Road surface (stone slab paving)
    road_mesh = trimesh.creation.box([road_width, 0.1, tile_length])
    road_mesh.apply_translation([0, -0.05, -tile_length / 2])
    scene.add_geometry(apply_mat(road_mesh, MAT_ROAD), node_name="Road_Surface")

    # Left & Right Curbs
    curb_w = 0.3
    curb_h = 0.15
    for side, x in [("Left", -(road_width / 2 + curb_w / 2)), ("Right", road_width / 2 + curb_w / 2)]:
        curb = trimesh.creation.box([curb_w, curb_h, tile_length])
        curb.apply_translation([x, curb_h / 2, -tile_length / 2])
        scene.add_geometry(apply_mat(curb, MAT_CURB), node_name=f"Curb_{side}")

    # Dashed Lane Lines (between lanes: X = -1.0 and X = +1.0)
    dash_len = 2.0
    dash_gap = 2.0
    num_dashes = int(tile_length / (dash_len + dash_gap))
    for d in range(num_dashes):
        z = -(d * (dash_len + dash_gap) + dash_len / 2)
        for side, x in [("L", -1.0), ("R", 1.0)]:
            dash = trimesh.creation.box([0.08, 0.01, dash_len])
            dash.apply_translation([x, 0.005, z])
            scene.add_geometry(apply_mat(dash, MAT_LANE_LINE), node_name=f"Dash_{side}_{d}")

    return scene

# -----------------------------------------------------------------------------
# 2. KATHMANDU FACADE VARIANT A (2-Story Brick House, 14m D x 4.5m W x 7.5m H)
# -----------------------------------------------------------------------------
def build_facade_a():
    scene = trimesh.Scene()
    w, h, d = 4.5, 7.5, 14.0

    # Main brick body
    body = trimesh.creation.box([w, h, d])
    body.apply_translation([0, h / 2, 0])
    scene.add_geometry(apply_mat(body, MAT_BRICK_A), node_name="FacadeA_Body")

    # Timber horizontal string courses (traditional wooden floor bands)
    for band_y in [2.8, 5.4]:
        band = trimesh.creation.box([w + 0.15, 0.18, d + 0.15])
        band.apply_translation([0, band_y, 0])
        scene.add_geometry(apply_mat(band, MAT_TIMBER), node_name=f"Timber_Band_{band_y}")

    # Projecting Roof Eave (Chhajja) with clay tiles
    eave = trimesh.creation.box([w + 0.8, 0.4, d + 0.4])
    eave.apply_translation([0, h + 0.2, 0])
    scene.add_geometry(apply_mat(eave, MAT_ROOF_TILE), node_name="Roof_Eave")

    # Wooden Roof Struts (Tundan) angled under eave
    for z in [-4.0, 0.0, 4.0]:
        strut = trimesh.creation.box([0.15, 0.7, 0.15])
        rot = trimesh.transformations.rotation_matrix(np.radians(25), [0, 0, 1])
        strut.apply_transform(rot)
        strut.apply_translation([-w/2 + 0.15, h - 0.2, z])
        scene.add_geometry(apply_mat(strut, MAT_TIMBER), node_name=f"Strut_{z}")

    # Carved San Jhyā Window Frame (Front facing: -X edge)
    front_x = -w / 2 - 0.05
    for z in [-3.5, 3.5]:
        win_frame = trimesh.creation.box([0.12, 1.5, 1.8])
        win_frame.apply_translation([front_x, 4.2, z])
        scene.add_geometry(apply_mat(win_frame, MAT_TIMBER), node_name=f"Window_Frame_{z}")

        win_glow = trimesh.creation.box([0.08, 1.2, 1.4])
        win_glow.apply_translation([front_x - 0.01, 4.2, z])
        scene.add_geometry(apply_mat(win_glow, MAT_WINDOW_GLOW), node_name=f"Window_Glow_{z}")

    # Hanging Brass/Amber Street Lantern (Diyo bracket)
    bracket = trimesh.creation.box([0.6, 0.08, 0.08])
    bracket.apply_translation([front_x - 0.25, 3.2, 0])
    scene.add_geometry(apply_mat(bracket, MAT_TIMBER), node_name="Lantern_Bracket")

    lantern = trimesh.creation.cylinder(radius=0.18, height=0.35, sections=12)
    lantern.apply_translation([front_x - 0.55, 2.9, 0])
    scene.add_geometry(apply_mat(lantern, MAT_LANTERN_GOLD), node_name="Lantern_Lamp")

    return scene

# -----------------------------------------------------------------------------
# 3. KATHMANDU FACADE VARIANT B (3-Story Merchant House with Bunting, 10.5m H)
# -----------------------------------------------------------------------------
def build_facade_b():
    scene = trimesh.Scene()
    w, h, d = 4.5, 10.5, 14.0

    # Main brick body (Aged darker brick)
    body = trimesh.creation.box([w, h, d])
    body.apply_translation([0, h / 2, 0])
    scene.add_geometry(apply_mat(body, MAT_BRICK_B), node_name="FacadeB_Body")

    # Timber floor bands (3 tiers)
    for band_y in [3.2, 6.4, 9.6]:
        band = trimesh.creation.box([w + 0.15, 0.18, d + 0.15])
        band.apply_translation([0, band_y, 0])
        scene.add_geometry(apply_mat(band, MAT_TIMBER), node_name=f"Tier_Band_{band_y}")

    # Ground floor wooden merchant shopfront shutter (Kawaa)
    front_x = -w / 2 - 0.05
    shutter = trimesh.creation.box([0.1, 2.4, 8.0])
    shutter.apply_translation([front_x, 1.2, 0])
    scene.add_geometry(apply_mat(shutter, MAT_TIMBER), node_name="Shopfront_Shutter")

    # Upper floor Aki Jhyā window frames (narrow decorative lattice windows)
    for y, z in [(4.8, -3.0), (4.8, 3.0), (7.8, -3.0), (7.8, 0.0), (7.8, 3.0)]:
        win = trimesh.creation.box([0.1, 1.3, 1.1])
        win.apply_translation([front_x, y, z])
        scene.add_geometry(apply_mat(win, MAT_TIMBER), node_name=f"Aki_Jhya_{y}_{z}")

        glow = trimesh.creation.box([0.06, 1.0, 0.8])
        glow.apply_translation([front_x - 0.01, y, z])
        scene.add_geometry(apply_mat(glow, MAT_WINDOW_GLOW), node_name=f"Glow_{y}_{z}")

    # Top Roof Eave
    roof = trimesh.creation.box([w + 0.9, 0.45, d + 0.5])
    roof.apply_translation([0, h + 0.225, 0])
    scene.add_geometry(apply_mat(roof, MAT_ROOF_TILE), node_name="Roof_Top")

    # Festival Bunting String with Colorful Triangular Flags
    bunting_cable = trimesh.creation.cylinder(radius=0.015, height=d, sections=6)
    rot_c = trimesh.transformations.rotation_matrix(np.radians(90), [1, 0, 0])
    bunting_cable.apply_transform(rot_c)
    bunting_cable.apply_translation([front_x - 0.4, 3.4, 0])
    scene.add_geometry(apply_mat(bunting_cable, MAT_TIMBER), node_name="Bunting_Cable")

    # Triangular pennant flags
    flag_mats = [MAT_FLAG_YELLOW, MAT_FLAG_RED, MAT_FLAG_BLUE]
    for i, fz in enumerate(np.linspace(-5.5, 5.5, 8)):
        flag = trimesh.creation.box([0.02, 0.28, 0.35])
        flag.apply_translation([front_x - 0.4, 3.22, fz])
        mat = flag_mats[i % len(flag_mats)]
        scene.add_geometry(apply_mat(flag, mat), node_name=f"Flag_{i}")

    return scene

# -----------------------------------------------------------------------------
# 4. KATHMANDU OBSTACLE: WOODEN BARRIER HURDLE (JUMPABLE, H=0.65m, W=1.7m)
# -----------------------------------------------------------------------------
def build_obstacle_hurdle():
    scene = trimesh.Scene()
    # Left & Right A-frame legs
    leg_w, leg_h, leg_d = 0.08, 0.65, 0.08
    for side, x in [("L", -0.75), ("R", 0.75)]:
        leg1 = trimesh.creation.box([leg_w, leg_h, leg_d])
        rot1 = trimesh.transformations.rotation_matrix(np.radians(12), [0, 0, 1])
        leg1.apply_transform(rot1)
        leg1.apply_translation([x, leg_h / 2, -0.15])
        scene.add_geometry(apply_mat(leg1, MAT_BARRIER_WOOD), node_name=f"Leg_{side}_1")

        leg2 = trimesh.creation.box([leg_w, leg_h, leg_d])
        rot2 = trimesh.transformations.rotation_matrix(np.radians(-12), [0, 0, 1])
        leg2.apply_transform(rot2)
        leg2.apply_translation([x, leg_h / 2, 0.15])
        scene.add_geometry(apply_mat(leg2, MAT_BARRIER_WOOD), node_name=f"Leg_{side}_2")

    # Horizontal Crossbars (Red & Wood striped festival barrier)
    bar1 = trimesh.creation.box([1.7, 0.14, 0.06])
    bar1.apply_translation([0, 0.52, 0])
    scene.add_geometry(apply_mat(bar1, MAT_BARRIER_WARNING), node_name="Crossbar_Top")

    bar2 = trimesh.creation.box([1.7, 0.12, 0.06])
    bar2.apply_translation([0, 0.28, 0])
    scene.add_geometry(apply_mat(bar2, MAT_BARRIER_WOOD), node_name="Crossbar_Bottom")

    # Brass decorative rivets
    for rx in [-0.65, 0.0, 0.65]:
        rivet = trimesh.creation.icosphere(subdivisions=1, radius=0.03)
        rivet.apply_translation([rx, 0.52, 0.035])
        scene.add_geometry(apply_mat(rivet, MAT_BRASS), node_name=f"Rivet_{rx}")

    return scene

# -----------------------------------------------------------------------------
# 5. KATHMANDU OBSTACLE: BRASS-BANDED FESTIVAL BARREL (UNJUMPABLE, H=1.25m, W=0.9m)
# -----------------------------------------------------------------------------
def build_obstacle_barrel():
    scene = trimesh.Scene()
    # Main Barrel Body (Tapered Sal wood staves)
    body = trimesh.creation.cylinder(radius=0.45, height=1.20, sections=16)
    body.apply_translation([0, 0.60, 0])
    scene.add_geometry(apply_mat(body, MAT_TIMBER), node_name="Barrel_Body")

    # Barrel Lid
    lid = trimesh.creation.cylinder(radius=0.42, height=0.05, sections=16)
    lid.apply_translation([0, 1.225, 0])
    scene.add_geometry(apply_mat(lid, MAT_TIMBER), node_name="Barrel_Lid")

    # 3 Brass Reinforcing Hoops (Top, Middle, Bottom)
    for hoop_y, r in [(0.20, 0.46), (0.60, 0.47), (1.00, 0.46)]:
        hoop = trimesh.creation.cylinder(radius=r, height=0.06, sections=16)
        hoop.apply_translation([0, hoop_y, 0])
        scene.add_geometry(apply_mat(hoop, MAT_BRASS), node_name=f"Brass_Hoop_{hoop_y}")

    # Top Brass Tap / Spigot
    tap = trimesh.creation.box([0.15, 0.08, 0.12])
    tap.apply_translation([0, 0.85, 0.46])
    scene.add_geometry(apply_mat(tap, MAT_BRASS), node_name="Brass_Spigot")

    return scene

def main():
    print("Building Kathmandu Street Module Kit (T008)...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    art_dir = os.path.join(base_dir, "art-source")
    pub_dir = os.path.join(base_dir, "public", "models")
    os.makedirs(pub_dir, exist_ok=True)

    kits = {
        "kathmandu_road_tile.glb": build_road_tile(),
        "kathmandu_facade_variant_a.glb": build_facade_a(),
        "kathmandu_facade_variant_b.glb": build_facade_b(),
        "kathmandu_obstacle_hurdle.glb": build_obstacle_hurdle(),
        "kathmandu_obstacle_barrel.glb": build_obstacle_barrel(),
    }

    manifest = []
    for filename, scene in kits.items():
        glb_data = scene.export(file_type='glb')
        art_path = os.path.join(art_dir, filename)
        pub_path = os.path.join(pub_dir, filename)

        with open(art_path, "wb") as f:
            f.write(glb_data)
        with open(pub_path, "wb") as f:
            f.write(glb_data)

        tris = sum(len(g.faces) for g in scene.geometry.values())
        extents = scene.extents
        size_kb = len(glb_data) / 1024.0

        manifest.append({
            "name": filename,
            "tris": tris,
            "size_kb": f"{size_kb:.1f} KB",
            "dims": f"{extents[0]:.2f}m x {extents[1]:.2f}m x {extents[2]:.2f}m"
        })
        print(f"[OK] {filename}: {tris} tris, {size_kb:.1f} KB, Dims: {extents[0]:.2f}m x {extents[1]:.2f}m x {extents[2]:.2f}m")

    print("\nAll 5 Kathmandu kit assets generated successfully!")

if __name__ == "__main__":
    main()
