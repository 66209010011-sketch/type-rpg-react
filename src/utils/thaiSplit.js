// ✅ แบบเดิม (แยกทุกตัวออกมาเลย: พยัญชนะ/สระ/วรรณยุกต์)
export function splitThaiChars(str = "") {
  return Array.from(str.normalize("NFC"));
}

// ✅ แบบ cluster (รวมเป็นก้อน)
const RE_PREPOSED = /[\u0E40-\u0E44]/;                  // เ แ โ ใ ไ
const RE_COMBINING = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4C]/; // ั ิ-ฺ ็ ่-์
const RE_BASE = /[\u0E01-\u0E2E\u0E30\u0E32\u0E33\u0E45]/; // ก-ฮ + ะ า ำ ๅ

export function splitThaiClusters(str = "") {
  const cps = Array.from(str.normalize("NFC"));
  const out = [];
  let pendingPreposed = "";
  let cur = "";

  const pushCur = () => { if (cur) { out.push(cur); cur = ""; } };

  for (const ch of cps) {
    if (RE_PREPOSED.test(ch)) {
      pushCur();
      pendingPreposed += ch;
      continue;
    }
    if (RE_BASE.test(ch)) {
      pushCur();
      cur = pendingPreposed + ch;
      pendingPreposed = "";
      continue;
    }
    if (RE_COMBINING.test(ch)) {
      if (!cur) cur = pendingPreposed, pendingPreposed = "";
      cur += ch;
      continue;
    }
    if (pendingPreposed) { out.push(pendingPreposed); pendingPreposed = ""; }
    pushCur();
    out.push(ch);
  }
  if (pendingPreposed) out.push(pendingPreposed);
  pushCur();
  return out;
}

// ✅ ฟังก์ชันเลือกตามโหมด
export function splitByLanguage(word = "", lang = "TH", mode = "char") {
  if (lang?.toUpperCase() === "TH") {
    return mode === "cluster" 
      ? splitThaiClusters(word)   // รวมก้อน
      : splitThaiChars(word);     // แยกทีละตัว
  }
  return Array.from(word.normalize("NFC"));
}
