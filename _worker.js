const EDIT_PASSWORD = "dhipmarketing";
const VIEW_PASSWORD = "dhipsocials";
const COOKIE_NAME = "cc_access";

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Content Calendar — Login</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0C0C0C;color:#E8E8E8;font-family:'Space Mono',monospace;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
  .box{width:100%;max-width:380px;border:1px solid #282828;border-top:3px solid #D4AF37;background:#111;padding:32px 28px;border-radius:3px;}
  .logo{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;color:#D4AF37;margin-bottom:4px;}
  .sub{font-size:9px;letter-spacing:3px;color:#777;margin-bottom:28px;text-transform:uppercase;}
  label{font-size:9px;letter-spacing:2px;color:#777;margin-bottom:8px;display:block;text-transform:uppercase;}
  .inp-wrap{position:relative;margin-bottom:16px;}
  input[type=password],input[type=text]{width:100%;background:#1a1a1a;border:1px solid #2a2a2a;color:#E8E8E8;padding:11px 44px 11px 14px;font-family:'Space Mono',monospace;font-size:13px;border-radius:2px;outline:none;letter-spacing:2px;}
  input:focus{border-color:#D4AF37;}
  .eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:transparent;border:none;color:#777;cursor:pointer;font-size:14px;padding:4px;}
  .eye:hover{color:#E8E8E8;}
  button[type=submit]{width:100%;background:#D4AF37;color:#000;border:none;padding:12px;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:3px;cursor:pointer;border-radius:2px;text-transform:uppercase;}
  button[type=submit]:hover{background:#c09f2f;}
  .err{font-size:10px;color:#8B2E2E;letter-spacing:1px;margin-top:10px;text-align:center;min-height:16px;}
</style>
</head>
<body>
<div class="box">
  <div class="logo">CONTENT CALENDAR</div>
  <div class="sub">Dhip Marketing — Enter password to continue</div>
  <form method="POST">
    <label>Password</label>
    <div class="inp-wrap">
      <input type="password" name="password" id="pw" placeholder="••••••••••••••" autocomplete="current-password" autofocus/>
      <button type="button" class="eye" onclick="var i=document.getElementById('pw');i.type=i.type==='password'?'text':'password'">👁</button>
    </div>
    <button type="submit">UNLOCK</button>
    <div class="err">__ERROR__</div>
  </form>
</div>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Handle POST (password submission) ──
    if (request.method === "POST") {
      const formData = await request.formData();
      const password = formData.get("password") || "";

      let accessLevel = null;
      if (password === EDIT_PASSWORD) accessLevel = "edit";
      if (password === VIEW_PASSWORD) accessLevel = "view";

      if (accessLevel) {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/",
            "Set-Cookie": `${COOKIE_NAME}=${accessLevel}; Path=/; SameSite=Strict; Secure`,
          },
        });
      }

      return new Response(LOGIN_HTML.replace("__ERROR__", "Incorrect password. Please try again."), {
        status: 401,
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // ── Handle GET — check session cookie ──
    const cookie = request.headers.get("cookie") || "";
    const match = cookie.match(/cc_access=([^;]+)/);
    const accessLevel = match ? match[1] : null;

    if (accessLevel === "edit" || accessLevel === "view") {
      // Valid session — serve the actual page from Pages assets
      const response = await env.ASSETS.fetch(request);
      const originalHtml = await response.text();
      const injected = originalHtml.replace(
        "</head>",
        `<script>window.__ACCESS_LEVEL__ = "${accessLevel}";<\/script>\n</head>`
      );
      return new Response(injected, {
        status: 200,
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // No valid session — show login page
    return new Response(LOGIN_HTML.replace("__ERROR__", ""), {
      status: 200,
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  }
};
