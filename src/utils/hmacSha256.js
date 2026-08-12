// src/utils/hmacSha256.js
// 基于 Web Crypto API 的 HMAC-SHA256，输出小写 hex。
// 可用环境：浏览器 https / localhost（安全上下文）与 Node >= 19（globalThis.crypto.subtle）。
// 不引第三方依赖。
async function hmacSha256(key, message) {
    const enc = new TextEncoder();
    const keyBuf = await crypto.subtle.importKey(
        "raw",
        enc.encode(key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", keyBuf, enc.encode(message));
    return Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export default hmacSha256;
