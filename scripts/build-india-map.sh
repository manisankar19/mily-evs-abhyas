#!/usr/bin/env bash
# Builds app/assets/shared-india-states.svg (Task 17): outline map of India with state/UT
# boundaries and no names. Data: Natural Earth 10m (public domain) — admin-1 states, the
# India point-of-view country outline, and Pakistan admin-1 polygons used only to split the
# outline-minus-states area into J&K (Azad Kashmir area) and Ladakh (Gilgit-Baltistan, Aksai
# Chin), as on the official map of India. Needs curl, python3, npx (mapshaper).
# Usage: scripts/build-india-map.sh [workdir]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
W="${1:-${TMPDIR:-/tmp}/india-map}"
mkdir -p "$W"; cd "$W"
B=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
for f in ne_10m_admin_1_states_provinces.geojson ne_10m_admin_0_countries_ind.geojson; do
  [ -s "$f" ] || curl -sSfL -o "$f" "$B/$f"
done
python3 - <<'PY'
import json
a = json.load(open('ne_10m_admin_1_states_provinces.geojson'))
feat = lambda i, g, **p: {"type": "Feature", "properties": dict(id=i, **p), "geometry": g}
fc = lambda fs: {"type": "FeatureCollection", "features": fs}
json.dump(fc([feat(f['properties']['iso_3166_2'], f['geometry'], name=f['properties']['name'])
              for f in a['features'] if f['properties'].get('adm0_a3') == 'IND']), open('states.json', 'w'))
pk = {'Northern Areas': 'IN-LA', 'Gilgit-Baltistan': 'IN-LA', 'Azad Kashmir': 'IN-JK'}
json.dump(fc([feat(pk[f['properties']['name']], f['geometry']) for f in a['features']
              if f['properties'].get('adm0_a3') == 'PAK' and f['properties']['name'] in pk]), open('pak_kashmir.json', 'w'))
c = json.load(open('ne_10m_admin_0_countries_ind.geojson'))
json.dump(fc([feat('IN', f['geometry']) for f in c['features'] if f['properties']['ADM0_A3'] == 'IND']), open('india.json', 'w'))
PY
M="npx -y mapshaper@0.6"
$M -i india.json name=india -i states.json name=states -i pak_kashmir.json name=pk \
  -erase target=india source=states + name=gap \
  -explode target=gap -filter target=gap 'this.area > 1e9' \
  -clip target=pk source=gap + name=gapPK \
  -erase target=gap source=pk + name=rest -each target=rest 'id="IN-LA"' \
  -merge-layers target=gapPK,rest name=north force \
  -clip target=states source=india + name=sc \
  -merge-layers target=sc,north name=all force \
  -dissolve id target=all copy-fields=name \
  -o target=all format=geojson all.json
$M -i all.json name=states -proj '+proj=lcc +lat_1=12 +lat_2=30 +lat_0=22 +lon_0=82 +datum=WGS84' \
  -simplify 15% keep-shapes \
  -dissolve target=states + name=border \
  -style target=states fill='#ffffff' stroke='#444444' stroke-width=0.8 \
  -style target=border fill=none stroke='#111111' stroke-width=1.8 \
  -o target=states,border format=svg id-field=id width=560 margin=8 precision=0.1 raw.svg
node "$ROOT/scripts/finish-india-map.js" raw.svg "$ROOT/app/assets/shared-india-states.svg"
