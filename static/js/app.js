/* =========================
   Notice (CSV: order, icon, desc)
========================= */
(function () {
  const TARGET_ID = "notice";

  const NOTICE_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSe0kYXtOsrsHFRfLWcWk1o5ULuOIWqHcAYW0DM6Yrb_wOUBZL7XbN8z0MAa7wLbjA98eFLl2tp0d_H/pub?gid=0&single=true&output=csv";

  const COPY = {
    kicker: "Notice",
    title: "작업 전 안내",
    desc: "문의 전 꼭 확인해주세요.",
    listTitle: "안내 사항",
  };

    const PROCESS_DATA = [
    {
        step: 1,
        title: "문의 접수",
        desc: "견적 안내 및 일정 조율"
    },
    {
        step: 2,
        title: "아트머그 결제",
        desc: "최종 상담 완료 후 결제를 진행"
    },
    {
        step: 3,
        title: "러프 (1차 컨펌)",
        desc: "마음에 드는 러프를 선택하고 수정"
    },
    {
        step: 4,
        title: "채색, 마무리 (2차 컨펌)",
        desc: "중간~마무리 단계에서 수정 사항 확인"
    },
    {
        step: 5,
        title: "완성 및 전달",
        desc: "파일을 전달하고 수령 완료"
    }
    ];

  function stripScripts(html) {
    return String(html).replace(
      /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
      ""
    );
  }

  function withBreaks(html) {
    return stripScripts(html).replace(/\r\n|\r|\n/g, "<br>");
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"' && inQuotes && next === '"') {
        cur += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && (ch === "," || ch === "\n" || ch === "\r")) {
        row.push(cur);
        cur = "";

        if (ch === "\r" && next === "\n") i++;
        if (ch === "\n" || ch === "\r") {
          if (row.some((c) => String(c).trim() !== "")) rows.push(row);
          row = [];
        }
        continue;
      }

      cur += ch;
    }

    row.push(cur);
    if (row.some((c) => String(c).trim() !== "")) rows.push(row);
    return rows;
  }

  function rowsToObjects(rows) {
    if (!rows || rows.length < 2) return [];
    const header = rows[0].map((h) => String(h).trim());
    return rows.slice(1).map((r) => {
      const obj = {};
      header.forEach((h, i) => (obj[h] = r[i] ?? ""));
      return obj;
    });
  }

  function toNum(v) {
    const n = Number(String(v ?? "").trim());
    return Number.isFinite(n) ? n : 0;
  }

  function normalizeRow(o) {
    const pick = (...keys) => {
      for (const k of keys) {
        const v = o[k];
        if (v !== undefined && v !== null && String(v).trim() !== "") return v;
      }
      return "";
    };

    const order = toNum(pick("order", "Order", "ORDER", "\ufefforder"));
    const icon = String(pick("icon", "Icon", "ICON", "\ufefficon")).trim();
    const desc = String(pick("desc", "Desc", "DESC", "내용", "\ufeffdesc")).trim();

    return { order, icon, desc };
  }

  function renderNotice(items) {
    const root = document.getElementById(TARGET_ID);
    if (!root) return;

    const list = (items || [])
      .map(normalizeRow)
      .filter((it) => it.desc && it.desc.trim() !== "")
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const bodyHTML = list.length
      ? `
        <section class="noticePanel">
          <div class="noticePanel__head">
            <h3 class="noticePanel__title">${esc(COPY.listTitle)}</h3>
            <p class="noticePanel__sub">${list.length}개</p>
          </div>

          <div class="noticePanel__body">
            <ul class="noticeList noticeList--simple">
              ${list
                .map((it) => {
                  const icon = it.icon ? esc(it.icon) : "•";
                  const desc = withBreaks(esc(it.desc));
                  return `
                    <li class="noticeItem noticeItem--icon">
                      <span class="noticeItem__icon" aria-hidden="true">${icon}</span>
                      <div class="noticeItem__desc">${desc}</div>
                    </li>
                  `.trim();
                })
                .join("")}
            </ul>
          </div>
        </section>
      `.trim()
      : `<div class="notice__error">공지 데이터를 불러오지 못했습니다. (헤더: order, icon, desc)</div>`;

      const processHTML = `
        <section class="processSection">
            <div class="processHead">
            <h3 class="processTitle">작업 과정</h3>
            </div>

            <div class="processTimeline">
            ${PROCESS_DATA.map(p => `
                <div class="processItem" data-step="${p.step}">
                <div class="processStep">${p.step}</div>
                <div class="processBody">
                    <div class="processItemTitle">${p.title}</div>
                    <div class="processItemDesc">${p.desc}</div>
                </div>
                </div>
            `).join("")}
            </div>

            <div class="processFoot">
            <p>
                컨펌은 최대 3회이며 3회 이상의 컨펌이 있을 시엔 추가금이 들어갑니다.<br>
                작가의 실수로 인한 컨펌은 카운트하지 않습니다.
            </p>
            </div>
        </section>
        `;

    root.innerHTML = `
      <div class="container noticeWrap">
        <div class="secHead">
          <p class="secHead__kicker">${esc(COPY.kicker)}</p>
          <h2 class="secHead__title">${esc(COPY.title)}</h2>
          <p class="secHead__desc">${esc(COPY.desc)}</p>
        </div>

        <div class="card noticeCard">
            ${bodyHTML}
            ${processHTML}
        </div>
      </div>
    `.trim();
  }

  async function loadNotice() {
    const root = document.getElementById(TARGET_ID);
    if (!root) return;

    root.innerHTML = `
      <div class="container noticeWrap">
        <div class="secHead">
          <p class="secHead__kicker">${esc(COPY.kicker)}</p>
          <h2 class="secHead__title">${esc(COPY.title)}</h2>
          <p class="secHead__desc">불러오는 중…</p>
        </div>
        <div class="card noticeCard">
          <div class="notice__loading">불러오는 중…</div>
        </div>
      </div>
    `.trim();

    try {
      const res = await fetch(NOTICE_CSV, { cache: "no-store" });
      if (!res.ok) throw new Error("Notice CSV fetch failed: " + res.status);

      const csvText = await res.text();
      const rows = parseCSV(csvText);
      const objs = rowsToObjects(rows);

      renderNotice(objs);
    } catch (err) {
      console.warn("[notice] load failed:", err);
      renderNotice([]);
    }
  }

  document.addEventListener("DOMContentLoaded", loadNotice);
})();


/* =========================================================
   FORM (Copy / Reset)
========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);

  const section = $("#form");
  if (!section) return;

  const form = $(".formSheet", section);
  const btnCopy = $('[data-form-copy]', section);
  const btnReset = $('[data-form-reset]', section);

  if (!form || !btnCopy || !btnReset) return;

  // 토스트(없으면 자동 생성)
  const ensureToast = () => {
    let toast = $("#formToast", section);
    if (toast) return toast;

    toast = document.createElement("div");
    toast.id = "formToast";
    toast.className = "formToast";
    toast.setAttribute("aria-live", "polite");

    // 버튼 영역에 붙이기(가장 자연스러움)
    const actions = $(".formActions", section) || form;
    actions.appendChild(toast);

    return toast;
  };

  const toast = ensureToast();

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-on"), 1400);
  };

  const v = (name) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return "";
    return (el.value || "").trim();
  };

  const filesCount = (name) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el || !el.files) return 0;
    return el.files.length || 0;
  };

  const line = (label, value) => `${label} ${value || ""}`.trimEnd();
  const block = (label, value) =>
    `${label}\n${(value || "").trim()}`.trimEnd();

    const buildText = () => {
    const nick = v("nick");
    const use = v("use");

    const bodyRange = v("body_range");
    const license = v("license");
    const size = v("size");
    const pose = v("pose");
    const bg = v("bg");

    const publicInfo = v("public");
    const deadline = v("deadline");
    const extra = v("extra");

    return [
        "신청 양식",
        "",
        `1. 신청자(방송용) 닉네임`,
        `   ${nick || ""}`,
        `   사용용도`,
        `   ${use || ""}`,
        "",
        "2. 캐릭터 자료 설명 (이미지 첨부 필수)",
        `   - 구도 범위 ${bodyRange || ""}`,
        `   - 사용 범위 ${license || ""}`,
        `   - 작업 사이즈 ${size || ""}`,
        "",
        `   - 포즈/구도 설명`,
        `${pose || ""}`,
        "",
        `   - 배경 설명`,
        `${bg || ""}`,
        "",
        "3. 포트폴리오 비공개 여부 / 공개 시점",
        `${publicInfo || ""}`,
        "",
        "4. 납품 희망 날짜(기본 45일)",
        `   ${deadline || ""}`,
        "",
        "5. 그 외 문의 사항",
        `${extra || ""}`,
        "",
        "※ 안내: 문의 작성 시 이미지를 꼭 첨부해 주세요.",
    ].join("\n");
    };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("복사 완료!");
    } catch (e) {
      // 폴백(권한/환경 이슈 대응)
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showToast("복사 완료!");
      } catch (e2) {
        showToast("복사 실패… 브라우저 권한 확인");
      }
      document.body.removeChild(ta);
    }
  };

  btnCopy.addEventListener("click", () => {
    const text = buildText();
    copyToClipboard(text);
  });

  btnReset.addEventListener("click", () => {
    form.reset();
    showToast("초기화 완료!");
  });
})();




/* =========================
   Showcase
========================= */
(function () {
  const TARGET_ID = "showcase";

  const PERSONAL_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSe0kYXtOsrsHFRfLWcWk1o5ULuOIWqHcAYW0DM6Yrb_wOUBZL7XbN8z0MAa7wLbjA98eFLl2tp0d_H/pub?gid=859576024&single=true&output=csv";

  const COMMISSION_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSe0kYXtOsrsHFRfLWcWk1o5ULuOIWqHcAYW0DM6Yrb_wOUBZL7XbN8z0MAa7wLbjA98eFLl2tp0d_H/pub?gid=1857880290&single=true&output=csv";

  const COPY = {
    kicker: "Portfolio",
    title: "포트폴리오",
    desc: "의뢰작 / 개인작을 확인할 수 있습니다.",

    commissionTitle: "의뢰작",
    commissionHint: "재생 버튼을 누르면 유튜브로 이동합니다. 일러스트는 새 창에서 크게 볼 수 있습니다.",

    personalTitle: "개인작",
    personalHint: "이미지를 클릭하면 새 창에서 크게 볼 수 있습니다.",

    btnToCommission: "의뢰작 보러가기",
    btnToPersonal: "개인작 보러가기",
  };

  // ---------- utils ----------
  function stripScripts(html) {
    return String(html).replace(
      /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
      ""
    );
  }
  function withBreaks(html) {
    return stripScripts(html).replace(/\r\n|\r|\n/g, "<br>");
  }
  function escHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escAttr(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function toNum(v) {
    const n = Number(String(v ?? "").trim());
    return Number.isFinite(n) ? n : 0;
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"' && inQuotes && next === '"') {
        cur += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && (ch === "," || ch === "\n" || ch === "\r")) {
        row.push(cur);
        cur = "";

        if (ch === "\r" && next === "\n") i++;
        if (ch === "\n" || ch === "\r") {
          if (row.some((c) => String(c).trim() !== "")) rows.push(row);
          row = [];
        }
        continue;
      }

      cur += ch;
    }

    row.push(cur);
    if (row.some((c) => String(c).trim() !== "")) rows.push(row);
    return rows;
  }

  function rowsToObjects(rows) {
    if (!rows || rows.length < 2) return [];
    const header = rows[0].map((h) => String(h).trim());
    return rows.slice(1).map((r) => {
      const obj = {};
      header.forEach((h, i) => (obj[h] = r[i] ?? ""));
      return obj;
    });
  }

  // ----- Drive image url normalize -----
  function extractDriveFileId(url) {
    const s = String(url || "").trim();
    if (!s) return null;

    const m1 = s.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
    if (m1) return m1[1];

    const m2 = s.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
    if (m2) return m2[1];

    const m3 = s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (m3) return m3[1];

    const m4 = s.match(/^[a-zA-Z0-9_-]{10,}$/);
    if (m4) return s;

    return null;
  }

  function normalizeImageUrl(url) {
    const s = String(url || "").trim();
    if (!s) return "";

    // already direct
    if (s.includes("lh3.googleusercontent.com/d/")) return s;

    // drive share link
    if (s.includes("drive.google.com")) {
      const id = extractDriveFileId(s);
      if (id) return `https://lh3.googleusercontent.com/d/${id}`;
    }

    const idOnly = extractDriveFileId(s);
    if (idOnly) return `https://lh3.googleusercontent.com/d/${idOnly}`;

    return s;
  }

  // ----- YouTube helpers -----
  function extractYouTubeId(url) {
    const s = String(url || "").trim();
    if (!s) return "";

    let m = s.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (m) return m[1];

    m = s.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (m) return m[1];

    m = s.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (m) return m[1];

    return "";
  }

  function ytThumb(url) {
    const id = extractYouTubeId(url);
    if (!id) return "";
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }

  // ---------- normalize rows ----------
  function normalizePersonalRow(o) {
    const order = toNum(o.order ?? o.Order ?? o["\ufefforder"]);
    const title = String(o.title ?? "").trim();
    const desc = String(o.desc ?? "").trim();
    const url = String(o.url ?? "").trim();

    const img = normalizeImageUrl(url);
    const open = img || url;

    return { order, title, desc, img, open };
  }

  function normalizeCommissionRow(o) {
    const order = toNum(o.order ?? o.Order ?? o["\ufefforder"]);
    const name = String(o.name ?? "").trim();
    const title = String(o.title ?? "").trim();
    const desc = String(o.desc ?? "").trim();
    const imgUrlRaw = String(o.img_url ?? o.imgUrl ?? o.image_url ?? "").trim();
    const youtube = String(o.youtube_url ?? o.youtube ?? "").trim();

    const img = normalizeImageUrl(imgUrlRaw);
    const yt = youtube;

    const href = yt ? yt : (img || imgUrlRaw);
    const mediaType = yt ? "yt" : "img";
    const mediaSrc = img || "";

    return { order, name, title, desc, href, mediaType, mediaSrc };
  }

  // ---------- render ----------
  function render(personalItems, commissionItems) {
    const root = document.getElementById(TARGET_ID);
    if (!root) return;

    const personal = (personalItems || [])
      .map(normalizePersonalRow)
      .filter((it) => it.open && it.img)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const commission = (commissionItems || [])
      .map(normalizeCommissionRow)
      .filter((it) => it.href)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const personalHTML = personal.length
      ? personal
          .map((it) => {
            const t = it.title || "작업물";
            const d = it.desc ? withBreaks(escHtml(it.desc)) : "";
            return `
              <a class="pfCard pfCard--personal"
                 href="${escAttr(it.open)}"
                 target="_blank"
                 rel="noopener noreferrer">
                <div class="pfMedia pfMedia--img">
                  <img src="${escAttr(it.img)}" alt="${escAttr(t)}" loading="lazy">
                </div>
                ${(it.title || it.desc) ? `
                  <div class="pfMeta">
                    ${it.title ? `<div class="pfTitle">${escHtml(it.title)}</div>` : ``}
                    ${it.desc ? `<div class="pfDesc">${d}</div>` : ``}
                  </div>
                ` : ``}
              </a>
            `.trim();
          })
          .join("")
      : `<div class="notice__error">개인작 데이터를 불러오지 못했습니다. (헤더: order, title, desc, url)</div>`;

    const commissionHTML = commission.length
      ? commission
          .map((it) => {
            const head = [it.name, it.title].filter(Boolean).join(" · ");
            const d = it.desc ? withBreaks(escHtml(it.desc)) : "";

            const media =
              it.mediaType === "yt"
                ? `
                  <div class="pfMedia pfMedia--yt">
                    ${
                      it.mediaSrc
                        ? `<img src="${escAttr(it.mediaSrc)}" alt="${escAttr(head)}" loading="lazy">`
                        : `<div class="pfPh">YouTube</div>`
                    }
                    <div class="pfPlay" aria-hidden="true">▶</div>
                  </div>
                `.trim()
                : `
                  <div class="pfMedia pfMedia--img">
                    ${
                      it.mediaSrc
                        ? `<img src="${escAttr(it.mediaSrc)}" alt="${escAttr(head)}" loading="lazy">`
                        : `<div class="pfPh">Image</div>`
                    }
                  </div>
                `.trim();

            return `
              <a class="pfCard pfCard--commission"
                 href="${escAttr(it.href)}"
                 target="_blank"
                 rel="noopener noreferrer">
                ${media}
                <div class="pfMeta">
                  <div class="pfTitle">${escHtml(head)}</div>
                  ${it.desc ? `<div class="pfDesc">${d}</div>` : ``}
                </div>
              </a>
            `.trim();
          })
          .join("")
      : `<div class="notice__error">의뢰작 데이터를 불러오지 못했습니다. (헤더: order, name, title, desc, img_url, youtube_url)</div>`;

    root.innerHTML = `
      <div class="container showcaseWrap">
        <div class="secHead">
          <p class="secHead__kicker">${escHtml(COPY.kicker)}</p>
          <h2 class="secHead__title">${escHtml(COPY.title)}</h2>
          <p class="secHead__desc">${escHtml(COPY.desc)}</p>
        </div>

        <div class="card showcaseCard">

          <section class="pfSection" id="pfCommission">
            <div class="pfSectionHead">
              <div class="pfSectionHead__left">
                <h3 class="pfSectionTitle">${escHtml(COPY.commissionTitle)}</h3>
                <p class="pfHint">${escHtml(COPY.commissionHint)}</p>
              </div>
              <a class="pfJump" name="goto" href="#pfPersonal">${escHtml(COPY.btnToPersonal)}</a>
            </div>

            <div class="pfMasonry pfMasonry--commission">
              ${commissionHTML}
            </div>
          </section>

          <div class="pfDivider" role="separator" aria-hidden="true"></div>

          <section class="pfSection" id="pfPersonal">
            <div class="pfSectionHead">
              <div class="pfSectionHead__left">
                <h3 class="pfSectionTitle">${escHtml(COPY.personalTitle)}</h3>
                <p class="pfHint">${escHtml(COPY.personalHint)}</p>
              </div>
              <a class="pfJump" name="goto" href="#pfCommission">${escHtml(COPY.btnToCommission)}</a>
            </div>

            <div class="pfMasonry">
              ${personalHTML}
            </div>
          </section>

        </div>
      </div>
    `.trim();
  }

  // ---------- load ----------
  async function loadShowcase() {
    const root = document.getElementById(TARGET_ID);
    if (!root) return;

    root.innerHTML = `
      <div class="container showcaseWrap">
        <div class="secHead">
          <p class="secHead__kicker">${escHtml(COPY.kicker)}</p>
          <h2 class="secHead__title">${escHtml(COPY.title)}</h2>
          <p class="secHead__desc">불러오는 중…</p>
        </div>
        <div class="card showcaseCard">
          <div class="notice__loading">불러오는 중…</div>
        </div>
      </div>
    `.trim();

    try {
      const [pRes, cRes] = await Promise.all([
        fetch(PERSONAL_CSV, { cache: "no-store" }),
        fetch(COMMISSION_CSV, { cache: "no-store" }),
      ]);

      if (!pRes.ok) throw new Error("Personal CSV fetch failed: " + pRes.status);
      if (!cRes.ok) throw new Error("Commission CSV fetch failed: " + cRes.status);

      const [pText, cText] = await Promise.all([pRes.text(), cRes.text()]);
      const pRows = parseCSV(pText);
      const cRows = parseCSV(cText);

      const pObjs = rowsToObjects(pRows);
      const cObjs = rowsToObjects(cRows);

      render(pObjs, cObjs);
    } catch (err) {
      console.warn("[showcase] load failed:", err);
      render([], []);
    }
  }

  document.addEventListener("DOMContentLoaded", loadShowcase);
})();



// ===== safe goto scroll =====
(function () {
  function getTargetFromHref(href) {
    if (!href) return null;
    const id = href.startsWith("#") ? href.slice(1) : href;
    if (!id) return null;
    return document.getElementById(id) || document.querySelector(`[name="${id}"]`);
  }

  function onClick(e) {
    const a = e.target.closest('a[name="goto"]');
    if (!a) return;

    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#")) return;

    const target = getTargetFromHref(href);
    if (!target) {
      console.warn("[goto] target not found:", href);
      return;
    }

    e.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });

    history.replaceState(null, "", href);
  }

  document.addEventListener("click", onClick, true);
})();

(function () {
  function bindGoto() {
    document.querySelectorAll('a[name="goto"]').forEach(a => {
      if (a.__gotoBound) return;
      a.__gotoBound = true;

      a.addEventListener("click", e => {
        e.preventDefault();

        const targetId = a.getAttribute("href");
        if (!targetId) return;

        const target =
          document.getElementById(targetId) ||
          document.querySelector(`[name="${targetId}"]`);

        if (!target) {
          console.warn("[goto] target not found:", targetId);
          return;
        }

        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest"
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", bindGoto);

  window.addEventListener("load", bindGoto);

  setTimeout(bindGoto, 800);
})();