/**
 * 車種名（seed の modelName と同一キー）→ 表ヘッダー用サムネイル URL。
 * 出典は主に Wikimedia Commons（各ファイルのライセンス・帰属は Commons のファイルページを参照）。
 * 原則として外観（正面〜斜め前）の実写のみ選定（内装・コラージュ・ショー車両の開扉を避ける）。
 */

export const HEADER_IMAGE_URL_BY_MODEL_NAME: Record<string, string> = {
  ヤリス:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/2020_Toyota_Yaris_Hybrid_E-Four_%28Red%29_%28cropped%29.jpg/330px-2020_Toyota_Yaris_Hybrid_E-Four_%28Red%29_%28cropped%29.jpg",
  カローラ:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/2020_Toyota_Corolla_SE%2C_front_2.29.20.jpg/330px-2020_Toyota_Corolla_SE%2C_front_2.29.20.jpg",
  カローラツーリング:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/2023_Toyota_Corolla_Touring_Sports_Hybrid_%28E210%29_IMG_7679.jpg/330px-2023_Toyota_Corolla_Touring_Sports_Hybrid_%28E210%29_IMG_7679.jpg",
  プリウス:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Toyota_Prius_%28XW60%29_Plug-in_Hybrid_Automesse_Ludwigsburg_2023_1X7A0004.jpg/330px-Toyota_Prius_%28XW60%29_Plug-in_Hybrid_Automesse_Ludwigsburg_2023_1X7A0004.jpg",
  "クラウン (クロスオーバー)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/TOYOTA_CROWN_CROSSOVER_China.jpg/330px-TOYOTA_CROWN_CROSSOVER_China.jpg",
  カムリ:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/330px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg",
  RAV4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Toyota_RAV4_2019_%28XA50%29_CUV_Quarter_Front.jpg/330px-Toyota_RAV4_2019_%28XA50%29_CUV_Quarter_Front.jpg",
  "RAV4 PHV":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/2022_Toyota_RAV4_Prime_SE_in_Ice_Cap%2C_front_left.jpg/330px-2022_Toyota_RAV4_Prime_SE_in_Ice_Cap%2C_front_left.jpg",
  ハリアー:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Toyota_HARRIER_HYBRID_Z_2WD_%286AA-AXUH80-ANXSB%29_front.jpg/330px-Toyota_HARRIER_HYBRID_Z_2WD_%286AA-AXUH80-ANXSB%29_front.jpg",
  "ランドクルーザー 300":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Toyota_Land_Cruiser_J300_3.3_ZX_2022_%281%29.jpg/330px-Toyota_Land_Cruiser_J300_3.3_ZX_2022_%281%29.jpg",
  アルファード:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Toyota_Alphard%2C_Johor_Bahru_%28P1110139%29.jpg/330px-Toyota_Alphard%2C_Johor_Bahru_%28P1110139%29.jpg",
  ヴォクシー:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Toyota_VOXY_S-Z_2WD_%286BA-MZRA90W-BPXRH%29_front.jpg/330px-Toyota_VOXY_S-Z_2WD_%286BA-MZRA90W-BPXRH%29_front.jpg",
  "ハイエース バン":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/2017_Toyota_HiAce_%28TRH201R%29_LWB_van_%282018-10-01%29_01.jpg/330px-2017_Toyota_HiAce_%28TRH201R%29_LWB_van_%282018-10-01%29_01.jpg",
  GR86:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/2022_Toyota_GR86_Premium_in_Halo%2C_Front_Right%2C_04-10-2022.jpg/330px-2022_Toyota_GR86_Premium_in_Halo%2C_Front_Right%2C_04-10-2022.jpg",
  GRカローラ:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Toyota_GR_COROLLA_RZ_%284BA-GZEA14H-BHFRZ%29_front.jpg/330px-Toyota_GR_COROLLA_RZ_%284BA-GZEA14H-BHFRZ%29_front.jpg",
  センチュリー:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Toyota_Century_VG40_White.jpg/330px-Toyota_Century_VG40_White.jpg",
  シエンタ:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/2016_Toyota_Sienta_1.5_V_NSP170R_%2820190622%29.jpg/330px-2016_Toyota_Sienta_1.5_V_NSP170R_%2820190622%29.jpg",
  ライズ:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Daihatsu_Rocky_203_%28cropped%29.jpg/330px-Daihatsu_Rocky_203_%28cropped%29.jpg",
  ルーミー:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Toyota_ROOMY_CUSTOM_G-T_2WD_%28DBA-M900A-AGBVJ%29_front.jpg/330px-Toyota_ROOMY_CUSTOM_G-T_2WD_%28DBA-M900A-AGBVJ%29_front.jpg",
  アクア:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Toyota_Prius_c_IMG_7739.jpg/330px-Toyota_Prius_c_IMG_7739.jpg",
  ノア:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Toyota_NOAH_Z_2WD_%286BA-MZRA90W-APXQH%29.jpg/330px-Toyota_NOAH_Z_2WD_%286BA-MZRA90W-APXQH%29.jpg",
  "クラウン (スポーツタイプ)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Toyota_CROWN_SPORT_Z_%286AA-AZSH36W-BNXGB%29_front.jpg/330px-Toyota_CROWN_SPORT_Z_%286AA-AZSH36W-BNXGB%29_front.jpg",
  "クラウン (セダンタイプ)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Toyota_Crown_Sedan_Z_Hybrid_front_left.jpg/330px-Toyota_Crown_Sedan_Z_Hybrid_front_left.jpg",
  bZ4X:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Toyota_bZ4X_Automesse_Ludwigsburg_2022_1X7A5895.jpg/330px-Toyota_bZ4X_Automesse_Ludwigsburg_2022_1X7A5895.jpg",
  "ランドクルーザー 250":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/2025_Toyota_Land_Cruiser_Prado_250_2.4_Turbo_in_White_Pearl_Mica%2C_front_left.jpg/330px-2025_Toyota_Land_Cruiser_Prado_250_2.4_Turbo_in_White_Pearl_Mica%2C_front_left.jpg",
  ハイラックス:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Toyota_HiLux_GR_Sport_1X7A7281.jpg/330px-Toyota_HiLux_GR_Sport_1X7A7281.jpg",
  GRスープラ:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Toyota_GR_Supra_RZ_%283BA-DB42-ZRRW%29_front.jpg/330px-Toyota_GR_Supra_RZ_%283BA-DB42-ZRRW%29_front.jpg",
  カローラクロス:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/2022_Toyota_Corolla_Cross_L_FWD%2C_Front_Left%2C_11-21-2021.jpg/330px-2022_Toyota_Corolla_Cross_L_FWD%2C_Front_Left%2C_11-21-2021.jpg",
  ヤリスクロス:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Toyota_Yaris_Cross_Hybrid_%28XP210%29_1X7A1846.jpg/330px-Toyota_Yaris_Cross_Hybrid_%28XP210%29_1X7A1846.jpg",
  "C-HR":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Toyota_C-HR_hybrid_%28FL%29_1X7A6305.jpg/330px-Toyota_C-HR_hybrid_%28FL%29_1X7A6305.jpg",
  グランエース:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Toyota_GRANACE_Premium_%283DA-GDH303W-RDTJY%29_front.jpg/330px-Toyota_GRANACE_Premium_%283DA-GDH303W-RDTJY%29_front.jpg",
};

/** シードの `manufacturer: "Honda"` と modelName が一致するキー（未設定時は空＝ヘッダ画像なし） */
export const HONDA_HEADER_IMAGE_URL_BY_MODEL_NAME: Record<string, string> = {
  フィット:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Honda_FIT_e-HEV_HOME_%286AA-GR3%29.jpg/330px-Honda_FIT_e-HEV_HOME_%286AA-GR3%29.jpg",
  ヴェゼル:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Honda_VEZEL_e%EF%BC%9AHEV_X_HuNT_Package_2WD.jpg/330px-Honda_VEZEL_e%EF%BC%9AHEV_X_HuNT_Package_2WD.jpg",
  "CR-V":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Honda_CR-V_e-HEV_EX%E3%83%BBMasterpiece_%286AA-RT5%29_front.jpg/330px-Honda_CR-V_e-HEV_EX%E3%83%BBMasterpiece_%286AA-RT5%29_front.jpg",
  シビック:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Honda_CIVIC_e-HEV_%286AA-FL4%29_front.jpg/330px-Honda_CIVIC_e-HEV_%286AA-FL4%29_front.jpg",
  "N-BOX":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Honda_N-BOX_%286BA-JF5%29_front.jpg/330px-Honda_N-BOX_%286BA-JF5%29_front.jpg",
  ステップワゴン:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Honda_STEP_WGN_e-HEV_SPADA_PREMIUM_LINE_%286AA-RP8%29_front.jpg/330px-Honda_STEP_WGN_e-HEV_SPADA_PREMIUM_LINE_%286AA-RP8%29_front.jpg",
};

/** シードの `manufacturer: "Nissan"` と modelName が一致するキー（未設定時は空＝ヘッダ画像なし） */
export const NISSAN_HEADER_IMAGE_URL_BY_MODEL_NAME: Record<string, string> = {
  ノート:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Nissan_Note_e-POWER_%28E13%29%2C_2021%2C_front.jpg/330px-Nissan_Note_e-POWER_%28E13%29%2C_2021%2C_front.jpg",
  セレナ:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Nissan_SERENA_e-POWER_XV_%286AA-GC28%29_front.jpg/330px-Nissan_SERENA_e-POWER_XV_%286AA-GC28%29_front.jpg",
  エクストレイル:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Nissan_X-TRAIL_G_e-4ORCE_%28SNT33%29_front.jpg/330px-Nissan_X-TRAIL_G_e-4ORCE_%28SNT33%29_front.jpg",
  リーフ:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Nissan_LEAF_G_%28ZE1%29_front.jpg/330px-Nissan_LEAF_G_%28ZE1%29_front.jpg",
  アリア:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Nissan_Ariya%2C_front%2C_Nissan_Gallery_HQ%2C_2021.jpg/330px-Nissan_Ariya%2C_front%2C_Nissan_Gallery_HQ%2C_2021.jpg",
  スカイライン:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Nissan_SKYLINE_400R_%28RV37%29_front.jpg/330px-Nissan_SKYLINE_400R_%28RV37%29_front.jpg",
};

export function headerImageUrlForVehicle(
  manufacturer: string,
  modelName: string
): string {
  if (manufacturer === "Honda") {
    return HONDA_HEADER_IMAGE_URL_BY_MODEL_NAME[modelName] ?? "";
  }
  if (manufacturer === "Nissan") {
    return NISSAN_HEADER_IMAGE_URL_BY_MODEL_NAME[modelName] ?? "";
  }
  return HEADER_IMAGE_URL_BY_MODEL_NAME[modelName] ?? "";
}
