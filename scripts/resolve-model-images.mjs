/**
 * Commons で車種キーワード検索し、最初の画像の 330px thumb を取得。
 * node scripts/resolve-model-images.mjs
 */
const models = [
  ["ヤリス", "Toyota Yaris 2020 hybrid"],
  ["カローラ", "Toyota Corolla sedan 2020"],
  ["カローラツーリング", "Toyota Corolla Touring Sports"],
  ["プリウス", "Toyota Prius 2023"],
  ["クラウン (クロスオーバー)", "Toyota Crown crossover 2023"],
  ["カムリ", "Toyota Camry 2018"],
  ["RAV4", "Toyota RAV4 2019"],
  ["RAV4 PHV", "Toyota RAV4 Prime"],
  ["ハリアー", "Toyota Harrier 2020"],
  ["ランドクルーザー 300", "Toyota Land Cruiser 300"],
  ["アルファード", "Toyota Alphard 2023"],
  ["ヴォクシー", "Toyota Voxy 2022"],
  ["ハイエース バン", "Toyota HiAce van"],
  ["GR86", "Toyota GR86"],
  ["GRカローラ", "Toyota GR Corolla"],
  ["センチュリー", "Toyota Century sedan"],
  ["シエンタ", "Toyota Sienta"],
  ["ライズ", "Toyota Raize"],
  ["ルーミー", "Toyota Roomy"],
  ["アクア", "Toyota Aqua hybrid"],
  ["ノア", "Toyota Noah 2022"],
  ["クラウン (スポーツタイプ)", "Toyota Crown Sport"],
  ["クラウン (セダンタイプ)", "Toyota Crown sedan 2023"],
  ["bZ4X", "Toyota bZ4X"],
  ["ランドクルーザー 250", "Toyota Land Cruiser Prado 2024"],
  ["ハイラックス", "Toyota Hilux"],
  ["GRスープラ", "Toyota Supra A90"],
  ["カローラクロス", "Toyota Corolla Cross"],
  ["ヤリスクロス", "Toyota Yaris Cross"],
  ["C-HR", "Toyota C-HR"],
  ["グランエース", "Toyota GranAce"],
];

async function thumbForSearch(q) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("format", "json");
  u.searchParams.set("generator", "search");
  u.searchParams.set("gsrsearch", q);
  u.searchParams.set("gsrnamespace", "6");
  u.searchParams.set("gsrlimit", "3");
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|mime");
  u.searchParams.set("iiurlwidth", "330");

  const res = await fetch(u);
  const j = await res.json();
  const pages = j.query?.pages;
  if (!pages) return null;
  for (const id of Object.keys(pages)) {
    const p = pages[id];
    const ii = p.imageinfo?.[0];
    if (!ii?.mime?.startsWith("image/")) continue;
    const url = ii.thumburl || ii.url;
    if (url) return { url, title: p.title };
  }
  return null;
}

const out = {};
for (const [ja, q] of models) {
  const r = await thumbForSearch(q);
  out[ja] = r;
  await new Promise((x) => setTimeout(x, 350));
}

console.log(JSON.stringify(out, null, 2));
