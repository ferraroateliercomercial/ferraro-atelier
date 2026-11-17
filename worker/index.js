// Ferraro Atelier: o site é estático (servido direto pela Cloudflare). Este Worker só entra nos pedidos do
// filme, para responder por partes (Range → 206), como os navegadores esperam de um vídeo: sem isso o
// Safari/iPhone não toca o vídeo e os outros baixam o arquivo inteiro antes de começar.
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    const range = request.headers.get("Range");
    if (res.status !== 200) return res;
    const headers = new Headers(res.headers);
    headers.set("Accept-Ranges", "bytes");
    if (!range) return new Response(res.body, { status: 200, headers });
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    const buf = await res.arrayBuffer();
    const total = buf.byteLength;
    if (!m || (m[1] === "" && m[2] === "")) return new Response(buf, { status: 200, headers });
    let start, end;
    if (m[1] === "") { start = Math.max(0, total - Number(m[2])); end = total - 1; } // os últimos N bytes
    else { start = Number(m[1]); end = m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1); }
    if (start >= total || start > end) {
      headers.set("Content-Range", `bytes */${total}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
    headers.set("Content-Length", String(end - start + 1));
    headers.delete("Content-Encoding");
    return new Response(buf.slice(start, end + 1), { status: 206, headers });
  },
};
