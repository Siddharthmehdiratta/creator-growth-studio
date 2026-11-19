/* Reads Instagram's own "Download your information" file (a ZIP of JSON files, or one JSON file) in the browser.
   Nothing is uploaded anywhere. Turns posts, reels and any past insights it finds into rows the report understands.
   Instagram changes this file's layout from time to time, so this reader looks for patterns rather than exact paths. */
(function () {
  "use strict";
  /* Meta writes UTF-8 text as if each byte were a separate character ("Ã©" for "é"): undo that. */
  const fixText = s => { if (typeof s !== "string") return s; try { return decodeURIComponent(escape(s)); } catch (e) { return s; } };

  async function inflate(bytes) {
    const ds = new DecompressionStream("deflate-raw");
    const out = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
    return new Uint8Array(out);
  }
  /* A small ZIP reader: finds the central directory and unpacks the .json files only. */
  async function readZip(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf), files = {};
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error("That ZIP file looks damaged. Download it again from Instagram.");
    const count = dv.getUint16(eocd + 10, true); let p = dv.getUint32(eocd + 16, true);
    const dec = new TextDecoder();
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
      p += 46 + nlen + xlen + clen;
      if (!/\.json$/i.test(name)) continue;
      const lnlen = dv.getUint16(off + 26, true), lxlen = dv.getUint16(off + 28, true), start = off + 30 + lnlen + lxlen;
      const raw = u8.subarray(start, start + csize);
      const data = method === 0 ? raw : method === 8 ? await inflate(raw) : null;
      if (data) files[name] = dec.decode(data);
    }
    return files;
  }

  const pad = n => String(n).padStart(2, "0");
  const stamp = t => { const d = new Date(t * 1000); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const num = v => { const n = Number(String(v ?? "").replace(/[, ]/g, "")); return isFinite(n) && String(v ?? "").trim() !== "" ? n : ""; };
  /* Insight labels Instagram uses, matched loosely, mapped to the report's columns. */
  const LABELS = [[/accounts reached|^reach$/i, "Reach"], [/impressions|^views$|plays/i, "Views"], [/^likes?$/i, "Likes"], [/^comments?$/i, "Comments"],
    [/shares?|sends?/i, "Shares"], [/saves?|saved/i, "Saves"], [/follows?$/i, "Follows"], [/profile (visits|activity)/i, "Profile visits"],
    [/average watch time|avg.*watch/i, "Average watch time (sec)"]];

  function walk(node, fn, path) { if (Array.isArray(node)) node.forEach((x, i) => walk(x, fn, path)); else if (node && typeof node === "object") { fn(node, path); Object.values(node).forEach(v => walk(v, fn, path)); } }

  function toRows(files) {
    const posts = [], insights = [];
    for (const [path, text] of Object.entries(files)) {
      let json; try { json = JSON.parse(text); } catch (e) { continue; }
      const isInsight = /insight/i.test(path);
      walk(json, obj => {
        /* posts and reels: { media: [{ uri, creation_timestamp, title }], title?, creation_timestamp? } */
        if (!isInsight && Array.isArray(obj.media) && obj.media.length && obj.media[0] && (obj.media[0].uri || obj.media[0].creation_timestamp)) {
          const m = obj.media, t = obj.creation_timestamp || m[0].creation_timestamp;
          if (!t) return;
          const video = m.some(x => /\.(mp4|mov)$/i.test(x.uri || "")), reel = /reel/i.test(path);
          posts.push({ t, caption: fixText(obj.title || m[0].title || ""), type: reel ? "Reel" : m.length > 1 ? "Carousel" : video ? "Video" : "Image" });
        }
        /* insights: { string_map_data: { "Accounts reached": { value }, "Creation timestamp": { timestamp } ... } } */
        if (obj.string_map_data && typeof obj.string_map_data === "object") {
          const row = {}, smd = obj.string_map_data;
          for (const [k, v] of Object.entries(smd)) {
            const key = fixText(k);
            if (/timestamp|time|date/i.test(key) && v && v.timestamp) row.t = v.timestamp;
            else if (/caption|description/i.test(key)) row.caption = fixText(v && v.value);
            else for (const [re, col] of LABELS) if (re.test(key)) { const n = num(v && v.value); if (n !== "") row[col] = n; break; }
          }
          if (obj.media_map_data && !row.t) walk(obj.media_map_data, x => { if (x.creation_timestamp && !row.t) row.t = x.creation_timestamp; if (x.title && !row.caption) row.caption = fixText(x.title); });
          if (Object.keys(row).some(k => LABELS.some(([, c]) => c === k))) insights.push(row);
        }
      });
    }
    /* join insights to posts by time (within 2 minutes) or by the start of the caption */
    const seen = new Set();
    const rows = posts.sort((a, b) => a.t - b.t).filter(p => { const k = p.t + "|" + p.type; if (seen.has(k)) return false; seen.add(k); return true; }).map((p, i) => {
      const hit = insights.find(x => (x.t && Math.abs(x.t - p.t) <= 120) || (x.caption && p.caption && x.caption.slice(0, 40) === p.caption.slice(0, 40)));
      const r = { "Post ID": "dyi-" + i, "Description": p.caption, "Publish time": stamp(p.t), "Post type": p.type };
      LABELS.forEach(([, c]) => { r[c] = hit && hit[c] !== undefined ? hit[c] : ""; });
      return r;
    });
    /* insights that matched no post still count as posts */
    insights.filter(x => x.t && !rows.some(r => r["Publish time"] === stamp(x.t))).forEach((x, i) => {
      const r = { "Post ID": "dyi-i" + i, "Description": x.caption || "", "Publish time": stamp(x.t), "Post type": "Post" };
      LABELS.forEach(([, c]) => { r[c] = x[c] !== undefined ? x[c] : ""; }); rows.push(r);
    });
    const withNumbers = rows.filter(r => r.Reach !== "" || r.Views !== "" || r.Likes !== "").length;
    return { rows, posts: posts.length, withNumbers, files: Object.keys(files).length };
  }

  async function read(file) {
    const buf = await file.arrayBuffer();
    const head = new Uint8Array(buf.slice(0, 4));
    let files;
    if (head[0] === 0x50 && head[1] === 0x4b) {
      if (typeof DecompressionStream === "undefined") throw new Error("Your browser is too old to open ZIP files. Update it, or unzip the file and upload the JSON files inside.");
      files = await readZip(buf);
    } else files = { [file.name]: new TextDecoder().decode(buf) };
    if (!Object.keys(files).length) throw new Error("No JSON files were found. When you request your download, choose the JSON format, not HTML.");
    return toRows(files);
  }
  window.CGS_DYI = { read, toRows, readZip, fixText };
})();
