/* Tidewright art manifest. Loaded as a script so the game also opens from file:// with no server. */
window.TW_MANIFEST = {
 "_readme": [
  "Single source of truth for every art asset: id, file (relative to game/assets/), pixel size and usage.",
  "Tiles and cells are 144x144, drawn at up to 64 CSS px per cell. Every tile orientation is its own sprite: never rotate one.",
  "Flow strips hold 8 frames side by side (frames and frameW say so). Play a strip backward for reverse flow.",
  "present:true means the game loads and draws the file. present:false keeps the clean placeholder shape for that id."
 ],
 "cellPx": 144,
 "assets": [
  {
   "id": "aqueduct_cross",
   "file": "tiles/aqueduct_cross.png",
   "w": 144,
   "h": 144,
   "usage": "Aqueduct tile: N-S bridge over E-W channel.",
   "present": true
  },
  {
   "id": "clay_bend_es",
   "file": "tiles/clay_bend_es.png",
   "w": 144,
   "h": 144,
   "usage": "Clay tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "clay_bend_ne",
   "file": "tiles/clay_bend_ne.png",
   "w": 144,
   "h": 144,
   "usage": "Clay tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "clay_bend_nw",
   "file": "tiles/clay_bend_nw.png",
   "w": 144,
   "h": 144,
   "usage": "Clay tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "clay_bend_sw",
   "file": "tiles/clay_bend_sw.png",
   "w": 144,
   "h": 144,
   "usage": "Clay tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "clay_straight_ew",
   "file": "tiles/clay_straight_ew.png",
   "w": 144,
   "h": 144,
   "usage": "Clay tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "clay_straight_ns",
   "file": "tiles/clay_straight_ns.png",
   "w": 144,
   "h": 144,
   "usage": "Clay tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "fork_label_exit_1",
   "file": "tiles/fork_label_exit_1.png",
   "w": 48,
   "h": 48,
   "usage": "Fork exit label, 48 px, centered 40 px from cell center on the exit arm.",
   "present": true
  },
  {
   "id": "fork_label_exit_2",
   "file": "tiles/fork_label_exit_2.png",
   "w": 48,
   "h": 48,
   "usage": "Fork exit label, 48 px, centered 40 px from cell center on the exit arm.",
   "present": true
  },
  {
   "id": "fork_t_esw",
   "file": "tiles/fork_t_esw.png",
   "w": 144,
   "h": 144,
   "usage": "Fork tile, one sprite per orientation (never rotate).",
   "present": true
  },
  {
   "id": "fork_t_nes",
   "file": "tiles/fork_t_nes.png",
   "w": 144,
   "h": 144,
   "usage": "Fork tile, one sprite per orientation (never rotate).",
   "present": true
  },
  {
   "id": "fork_t_new",
   "file": "tiles/fork_t_new.png",
   "w": 144,
   "h": 144,
   "usage": "Fork tile, one sprite per orientation (never rotate).",
   "present": true
  },
  {
   "id": "fork_t_nsw",
   "file": "tiles/fork_t_nsw.png",
   "w": 144,
   "h": 144,
   "usage": "Fork tile, one sprite per orientation (never rotate).",
   "present": true
  },
  {
   "id": "sand_bend_es",
   "file": "tiles/sand_bend_es.png",
   "w": 144,
   "h": 144,
   "usage": "Sand tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "sand_bend_ne",
   "file": "tiles/sand_bend_ne.png",
   "w": 144,
   "h": 144,
   "usage": "Sand tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "sand_bend_nw",
   "file": "tiles/sand_bend_nw.png",
   "w": 144,
   "h": 144,
   "usage": "Sand tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "sand_bend_sw",
   "file": "tiles/sand_bend_sw.png",
   "w": 144,
   "h": 144,
   "usage": "Sand tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "sand_meter_se_1",
   "file": "tiles/sand_meter_se_1.png",
   "w": 144,
   "h": 144,
   "usage": "Sand evaporation meter overlay (full cell frame). sw only for sand_bend_es.",
   "present": true
  },
  {
   "id": "sand_meter_se_2",
   "file": "tiles/sand_meter_se_2.png",
   "w": 144,
   "h": 144,
   "usage": "Sand evaporation meter overlay (full cell frame). sw only for sand_bend_es.",
   "present": true
  },
  {
   "id": "sand_meter_se_3",
   "file": "tiles/sand_meter_se_3.png",
   "w": 144,
   "h": 144,
   "usage": "Sand evaporation meter overlay (full cell frame). sw only for sand_bend_es.",
   "present": true
  },
  {
   "id": "sand_meter_sw_1",
   "file": "tiles/sand_meter_sw_1.png",
   "w": 144,
   "h": 144,
   "usage": "Sand evaporation meter overlay (full cell frame). sw only for sand_bend_es.",
   "present": true
  },
  {
   "id": "sand_meter_sw_2",
   "file": "tiles/sand_meter_sw_2.png",
   "w": 144,
   "h": 144,
   "usage": "Sand evaporation meter overlay (full cell frame). sw only for sand_bend_es.",
   "present": true
  },
  {
   "id": "sand_meter_sw_3",
   "file": "tiles/sand_meter_sw_3.png",
   "w": 144,
   "h": 144,
   "usage": "Sand evaporation meter overlay (full cell frame). sw only for sand_bend_es.",
   "present": true
  },
  {
   "id": "sand_straight_ew",
   "file": "tiles/sand_straight_ew.png",
   "w": 144,
   "h": 144,
   "usage": "Sand tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "sand_straight_ns",
   "file": "tiles/sand_straight_ns.png",
   "w": 144,
   "h": 144,
   "usage": "Sand tile, one sprite per orientation (never rotate). Board, tray, drag ghost.",
   "present": true
  },
  {
   "id": "tile_collapsed_scar",
   "file": "wear/tile_collapsed_scar.png",
   "w": 144,
   "h": 144,
   "usage": "Scar where a tile collapsed (run and plan).",
   "present": true
  },
  {
   "id": "tile_locked_rivets",
   "file": "wear/tile_locked_rivets.png",
   "w": 144,
   "h": 144,
   "usage": "Rivets over a locked tile.",
   "present": true
  },
  {
   "id": "wear_crack_stage_1",
   "file": "wear/wear_crack_stage_1.png",
   "w": 144,
   "h": 144,
   "usage": "Crack overlay on a worn tile.",
   "present": true
  },
  {
   "id": "wear_crack_stage_2",
   "file": "wear/wear_crack_stage_2.png",
   "w": 144,
   "h": 144,
   "usage": "Crack overlay on a worn tile.",
   "present": true
  },
  {
   "id": "wear_crack_stage_3",
   "file": "wear/wear_crack_stage_3.png",
   "w": 144,
   "h": 144,
   "usage": "Crack overlay on a worn tile.",
   "present": true
  },
  {
   "id": "border_corner_ne",
   "file": "ground/border_corner_ne.png",
   "w": 36,
   "h": 36,
   "usage": "Board border piece, 36 px thick (a quarter cell).",
   "present": true
  },
  {
   "id": "border_corner_nw",
   "file": "ground/border_corner_nw.png",
   "w": 36,
   "h": 36,
   "usage": "Board border piece, 36 px thick (a quarter cell).",
   "present": true
  },
  {
   "id": "border_corner_se",
   "file": "ground/border_corner_se.png",
   "w": 36,
   "h": 36,
   "usage": "Board border piece, 36 px thick (a quarter cell).",
   "present": true
  },
  {
   "id": "border_corner_sw",
   "file": "ground/border_corner_sw.png",
   "w": 36,
   "h": 36,
   "usage": "Board border piece, 36 px thick (a quarter cell).",
   "present": true
  },
  {
   "id": "border_edge_e",
   "file": "ground/border_edge_e.png",
   "w": 36,
   "h": 144,
   "usage": "Board border piece, 36 px thick (a quarter cell).",
   "present": true
  },
  {
   "id": "border_edge_n",
   "file": "ground/border_edge_n.png",
   "w": 144,
   "h": 36,
   "usage": "Board border piece, 36 px thick (a quarter cell).",
   "present": true
  },
  {
   "id": "border_edge_s",
   "file": "ground/border_edge_s.png",
   "w": 144,
   "h": 36,
   "usage": "Board border piece, 36 px thick (a quarter cell).",
   "present": true
  },
  {
   "id": "border_edge_w",
   "file": "ground/border_edge_w.png",
   "w": 36,
   "h": 144,
   "usage": "Board border piece, 36 px thick (a quarter cell).",
   "present": true
  },
  {
   "id": "rock_cell",
   "file": "ground/rock_cell.png",
   "w": 144,
   "h": 144,
   "usage": "Rock cell.",
   "present": true
  },
  {
   "id": "soil_cell",
   "file": "ground/soil_cell.png",
   "w": 144,
   "h": 144,
   "usage": "Empty soil cell.",
   "present": true
  },
  {
   "id": "valley_background_1080x1920",
   "file": "ground/valley_background_1080x1920.png",
   "w": 1080,
   "h": 1920,
   "usage": "Page background behind the menu and board (cover, opaque).",
   "present": true
  },
  {
   "id": "spring_a_exit_e",
   "file": "springs/spring_a_exit_e.png",
   "w": 144,
   "h": 144,
   "usage": "Spring with its exit arrow baked in (a = first spring, b = second).",
   "present": true
  },
  {
   "id": "spring_a_exit_n",
   "file": "springs/spring_a_exit_n.png",
   "w": 144,
   "h": 144,
   "usage": "Spring with its exit arrow baked in (a = first spring, b = second).",
   "present": true
  },
  {
   "id": "spring_a_exit_s",
   "file": "springs/spring_a_exit_s.png",
   "w": 144,
   "h": 144,
   "usage": "Spring with its exit arrow baked in (a = first spring, b = second).",
   "present": true
  },
  {
   "id": "spring_a_exit_w",
   "file": "springs/spring_a_exit_w.png",
   "w": 144,
   "h": 144,
   "usage": "Spring with its exit arrow baked in (a = first spring, b = second).",
   "present": true
  },
  {
   "id": "spring_b_exit_e",
   "file": "springs/spring_b_exit_e.png",
   "w": 144,
   "h": 144,
   "usage": "Spring with its exit arrow baked in (a = first spring, b = second).",
   "present": true
  },
  {
   "id": "spring_b_exit_n",
   "file": "springs/spring_b_exit_n.png",
   "w": 144,
   "h": 144,
   "usage": "Spring with its exit arrow baked in (a = first spring, b = second).",
   "present": true
  },
  {
   "id": "spring_b_exit_s",
   "file": "springs/spring_b_exit_s.png",
   "w": 144,
   "h": 144,
   "usage": "Spring with its exit arrow baked in (a = first spring, b = second).",
   "present": true
  },
  {
   "id": "spring_b_exit_w",
   "file": "springs/spring_b_exit_w.png",
   "w": 144,
   "h": 144,
   "usage": "Spring with its exit arrow baked in (a = first spring, b = second).",
   "present": true
  },
  {
   "id": "field_digit_0",
   "file": "fields/field_digit_0.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_1",
   "file": "fields/field_digit_1.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_2",
   "file": "fields/field_digit_2.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_3",
   "file": "fields/field_digit_3.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_4",
   "file": "fields/field_digit_4.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_5",
   "file": "fields/field_digit_5.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_6",
   "file": "fields/field_digit_6.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_7",
   "file": "fields/field_digit_7.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_8",
   "file": "fields/field_digit_8.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_digit_9",
   "file": "fields/field_digit_9.png",
   "w": 60,
   "h": 60,
   "usage": "Field need digit, 60 px, centered at (72,30) of the cell.",
   "present": true
  },
  {
   "id": "field_dry",
   "file": "fields/field_dry.png",
   "w": 144,
   "h": 144,
   "usage": "Field base: dry (0 drops), filling, full.",
   "present": true
  },
  {
   "id": "field_filling",
   "file": "fields/field_filling.png",
   "w": 144,
   "h": 144,
   "usage": "Field base: dry (0 drops), filling, full.",
   "present": true
  },
  {
   "id": "field_full",
   "file": "fields/field_full.png",
   "w": 144,
   "h": 144,
   "usage": "Field base: dry (0 drops), filling, full.",
   "present": true
  },
  {
   "id": "field_pip_empty",
   "file": "fields/field_pip_empty.png",
   "w": 24,
   "h": 24,
   "usage": "Field drop pip, 24 px, row at y=110 with a 22 px pitch.",
   "present": true
  },
  {
   "id": "field_pip_full",
   "file": "fields/field_pip_full.png",
   "w": 24,
   "h": 24,
   "usage": "Field drop pip, 24 px, row at y=110 with a 22 px pitch.",
   "present": true
  },
  {
   "id": "fx_flood_chain_8f",
   "file": "water/fx_flood_chain_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flood chain burst on each cell when a win floods, 8 frames.",
   "present": true
  },
  {
   "id": "water_drop_72",
   "file": "water/water_drop_72.png",
   "w": 72,
   "h": 72,
   "usage": "The drop, drawn at about 24 pt.",
   "present": true
  },
  {
   "id": "water_flow_aqueduct_under_w2e_8f",
   "file": "water/water_flow_aqueduct_under_w2e_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_bend_e2s_8f",
   "file": "water/water_flow_bend_e2s_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_bend_n2e_8f",
   "file": "water/water_flow_bend_n2e_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_bend_s2w_8f",
   "file": "water/water_flow_bend_s2w_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_bend_w2n_8f",
   "file": "water/water_flow_bend_w2n_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_fork_arm_e_out_8f",
   "file": "water/water_flow_fork_arm_e_out_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_fork_arm_n_out_8f",
   "file": "water/water_flow_fork_arm_n_out_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_fork_arm_s_out_8f",
   "file": "water/water_flow_fork_arm_s_out_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_fork_arm_w_out_8f",
   "file": "water/water_flow_fork_arm_w_out_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_fork_hub_8f",
   "file": "water/water_flow_fork_hub_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_straight_n2s_8f",
   "file": "water/water_flow_straight_n2s_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_flow_straight_w2e_8f",
   "file": "water/water_flow_straight_w2e_8f.png",
   "w": 1152,
   "h": 144,
   "frames": 8,
   "frameW": 144,
   "usage": "Flow strip, 8 frames of 144 px. Play backward for reverse flow.",
   "present": true
  },
  {
   "id": "water_spill_mark",
   "file": "water/water_spill_mark.png",
   "w": 144,
   "h": 144,
   "usage": "Spill point scar shown on the plan after a run.",
   "present": true
  },
  {
   "id": "water_spill_splash_6f",
   "file": "water/water_spill_splash_6f.png",
   "w": 864,
   "h": 144,
   "frames": 6,
   "frameW": 144,
   "usage": "Splash animation where a drop spills, 6 frames.",
   "present": true
  },
  {
   "id": "app_icon_1024",
   "file": "ui/app_icon_1024.png",
   "w": 1024,
   "h": 1024,
   "usage": "App icon (favicon / home screen icon).",
   "present": true
  },
  {
   "id": "btn_fast",
   "file": "ui/btn_fast.png",
   "w": 168,
   "h": 168,
   "usage": "Round button, icon only; caption drawn in code.",
   "present": true
  },
  {
   "id": "btn_redo",
   "file": "ui/btn_redo.png",
   "w": 168,
   "h": 168,
   "usage": "Round button, icon only; caption drawn in code.",
   "present": true
  },
  {
   "id": "btn_release",
   "file": "ui/btn_release.png",
   "w": 216,
   "h": 216,
   "usage": "Round button, icon only; caption drawn in code.",
   "present": true
  },
  {
   "id": "btn_reset",
   "file": "ui/btn_reset.png",
   "w": 168,
   "h": 168,
   "usage": "Round button, icon only; caption drawn in code.",
   "present": true
  },
  {
   "id": "btn_skip",
   "file": "ui/btn_skip.png",
   "w": 168,
   "h": 168,
   "usage": "Round button, icon only; caption drawn in code.",
   "present": true
  },
  {
   "id": "btn_stop",
   "file": "ui/btn_stop.png",
   "w": 168,
   "h": 168,
   "usage": "Round button, icon only; caption drawn in code.",
   "present": true
  },
  {
   "id": "btn_undo",
   "file": "ui/btn_undo.png",
   "w": 168,
   "h": 168,
   "usage": "Round button, icon only; caption drawn in code.",
   "present": true
  },
  {
   "id": "star_flood",
   "file": "ui/star_flood.png",
   "w": 192,
   "h": 192,
   "usage": "Star (earned, or empty).",
   "present": true
  },
  {
   "id": "star_flood_empty",
   "file": "ui/star_flood_empty.png",
   "w": 192,
   "h": 192,
   "usage": "Star (earned, or empty).",
   "present": true
  },
  {
   "id": "star_frugal",
   "file": "ui/star_frugal.png",
   "w": 192,
   "h": 192,
   "usage": "Star (earned, or empty).",
   "present": true
  },
  {
   "id": "star_frugal_empty",
   "file": "ui/star_frugal_empty.png",
   "w": 192,
   "h": 192,
   "usage": "Star (earned, or empty).",
   "present": true
  },
  {
   "id": "star_lean",
   "file": "ui/star_lean.png",
   "w": 192,
   "h": 192,
   "usage": "Star (earned, or empty).",
   "present": true
  },
  {
   "id": "star_lean_empty",
   "file": "ui/star_lean_empty.png",
   "w": 192,
   "h": 192,
   "usage": "Star (earned, or empty).",
   "present": true
  },
  {
   "id": "ui_hud_counter_plate",
   "file": "ui/ui_hud_counter_plate.png",
   "w": 300,
   "h": 96,
   "usage": "Blank HUD counter plate; text drawn in code.",
   "present": true
  },
  {
   "id": "ui_icon_tiles",
   "file": "ui/ui_icon_tiles.png",
   "w": 72,
   "h": 72,
   "usage": "HUD plate icon.",
   "present": true
  },
  {
   "id": "ui_icon_waste",
   "file": "ui/ui_icon_waste.png",
   "w": 72,
   "h": 72,
   "usage": "HUD plate icon.",
   "present": true
  },
  {
   "id": "ui_perfect_frame_gold",
   "file": "ui/ui_perfect_frame_gold.png",
   "w": 720,
   "h": 300,
   "usage": "Gold Perfect frame around the three stars.",
   "present": true
  },
  {
   "id": "ui_result_panel",
   "file": "ui/ui_result_panel.png",
   "w": 960,
   "h": 1200,
   "usage": "Blank result panel; text drawn in code.",
   "present": true
  },
  {
   "id": "ui_tide_gauge_fill",
   "file": "ui/ui_tide_gauge_fill.png",
   "w": 888,
   "h": 64,
   "usage": "Tide gauge water fill (888x64), clipped to the tick fraction.",
   "present": true
  },
  {
   "id": "ui_tide_gauge_frame",
   "file": "ui/ui_tide_gauge_frame.png",
   "w": 960,
   "h": 144,
   "usage": "Tide gauge frame (window at x 36-924, y 40-104).",
   "present": true
  },
  {
   "id": "ui_tide_line",
   "file": "ui/ui_tide_line.png",
   "w": 28,
   "h": 96,
   "usage": "Wave line at the leading edge of the gauge fill.",
   "present": true
  },
  {
   "id": "ui_tide_turn_marker",
   "file": "ui/ui_tide_turn_marker.png",
   "w": 56,
   "h": 112,
   "usage": "Moon marker at tick T on the gauge.",
   "present": true
  },
  {
   "id": "ui_tray_count_badge",
   "file": "ui/ui_tray_count_badge.png",
   "w": 64,
   "h": 64,
   "usage": "Tray count badge; number drawn in code.",
   "present": true
  },
  {
   "id": "ui_tray_slot",
   "file": "ui/ui_tray_slot.png",
   "w": 192,
   "h": 192,
   "usage": "Tray slot (plain, selected).",
   "present": true
  },
  {
   "id": "ui_tray_slot_selected",
   "file": "ui/ui_tray_slot_selected.png",
   "w": 192,
   "h": 192,
   "usage": "Tray slot (plain, selected).",
   "present": true
  },
  {
   "id": "ui_warning_chip",
   "file": "ui/ui_warning_chip.png",
   "w": 48,
   "h": 48,
   "usage": "Warning chip for open ends, unfed fields and the hint chip.",
   "present": true
  },
  {
   "id": "tidewright_logotype",
   "file": "title/tidewright_logotype.png",
   "w": 1059,
   "h": 344,
   "usage": "Logotype on the menu.",
   "present": true
  },
  {
   "id": "title_card_1080x1920",
   "file": "title/title_card_1080x1920.png",
   "w": 1080,
   "h": 1920,
   "usage": "Title card painting (not used by the game yet).",
   "present": false
  },
  {
   "id": "icon_back",
   "file": "ui/icon_back.png",
   "w": 96,
   "h": 96,
   "usage": "Back-to-levels arrow.",
   "present": false
  },
  {
   "id": "icon_sound_on",
   "file": "ui/icon_sound_on.png",
   "w": 96,
   "h": 96,
   "usage": "Sound on icon.",
   "present": false
  },
  {
   "id": "icon_sound_off",
   "file": "ui/icon_sound_off.png",
   "w": 96,
   "h": 96,
   "usage": "Sound off icon.",
   "present": false
  },
  {
   "id": "icon_lock",
   "file": "ui/icon_lock.png",
   "w": 96,
   "h": 96,
   "usage": "Locked level icon.",
   "present": false
  }
 ]
};
