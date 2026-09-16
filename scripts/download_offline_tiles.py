"""
Download offline map tiles for Myanmar from ESRI World Topo Map.
ESRI tiles are free, high quality, no API key, no watermarks.
Tiles are JPEG, saved as {z}/{x}/{y}.jpg
Note: ESRI uses /tile/{z}/{y}/{x} URL pattern (y before x).
"""

import math
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "public", "tiles")

def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

# ESRI World Topo Map - free, no API key, no watermark, JPEG
TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/*,*/*;q=0.8",
}

def download_tile(z, x, y):
    out_path = os.path.join(OUTPUT_DIR, str(z), str(x), f"{y}.jpg")

    if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        return True, f"exists: {z}/{x}/{y}"

    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    # ESRI URL pattern: /tile/{z}/{y}/{x}  (note: y before x!)
    url = TILE_URL.format(z=z, y=y, x=x)

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    data = resp.read()
                    if len(data) > 500:
                        with open(out_path, "wb") as f:
                            f.write(data)
                        time.sleep(0.01)
                        return True, f"downloaded: {z}/{x}/{y}"
        except Exception as e:
            if attempt < 2:
                time.sleep(0.5 * (attempt + 1))
                continue

    return False, f"failed: {z}/{x}/{y}"

def collect_tiles():
    tiles = set()

    # 1. Myanmar national overview: zoom 4-8
    for z in range(4, 9):
        x_min, y_max = deg2num(9.5, 92.0, z)
        x_max, y_min = deg2num(28.5, 101.5, z)
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                tiles.add((z, x, y))

    # 2. Greater Yangon: zoom 9-13
    for z in range(9, 14):
        x_min, y_max = deg2num(16.4, 95.8, z)
        x_max, y_min = deg2num(17.3, 96.6, z)
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                tiles.add((z, x, y))

    # 3. Major hubs: zoom 9-12
    hubs = [
        (21.80, 22.10, 95.95, 96.20),  # Mandalay
        (19.60, 19.90, 96.00, 96.25),  # Naypyidaw
        (20.10, 20.95, 94.75, 95.05),  # Magway/Chauk/Yenangyaung
        (17.20, 17.45, 96.35, 96.60),  # Bago
        (20.70, 20.90, 96.95, 97.15),  # Taunggyi
    ]
    for min_lat, max_lat, min_lon, max_lon in hubs:
        for z in range(9, 13):
            x_min, y_max = deg2num(min_lat, min_lon, z)
            x_max, y_min = deg2num(max_lat, max_lon, z)
            for x in range(x_min, x_max + 1):
                for y in range(y_min, y_max + 1):
                    tiles.add((z, x, y))

    return sorted(list(tiles))

def main():
    tiles = collect_tiles()
    print(f"Total tiles to download: {len(tiles)}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    ok_count = 0
    fail_count = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(download_tile, z, x, y): (z, x, y) for z, x, y in tiles}
        for future in as_completed(futures):
            ok, msg = future.result()
            if ok:
                ok_count += 1
            else:
                fail_count += 1
                print(f"  FAIL: {msg}")
            total = ok_count + fail_count
            if total % 50 == 0 or total == len(tiles):
                print(f"Progress: {total}/{len(tiles)} (OK: {ok_count}, Fail: {fail_count})")

    print(f"\nDone! Success: {ok_count}, Failed: {fail_count}")

if __name__ == "__main__":
    main()
