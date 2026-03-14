(function () {
  const form = document.getElementById("portfolioRequestForm");
  if (!form) return;

  const copyBtn = document.getElementById("copyFormBtn");
  const resetBtn = document.getElementById("resetFormBtn");
  const messageEl = document.getElementById("formMessage");
  const noticeConfirm = document.getElementById("noticeConfirm");

  const modal = document.getElementById("detailModal");
  const modalTitle = document.getElementById("detailModalTitle");
  const modalGuide = document.getElementById("detailModalGuide");
  const modalTextarea = document.getElementById("detailModalTextarea");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const saveDetailBtn = document.getElementById("saveDetailBtn");
  const backdrop = modal.querySelector("[data-close-modal]");
  const designToggles = document.querySelectorAll(".design-toggle");
  const editButtons = document.querySelectorAll(".design-edit-btn");


  const designConfig = {
    package: {
      label: "패키지",
      guide: "RT포스터 오픈 숫자 및 방식, PPT 내용 작성, 배너 종류 및 각 디자인에 들어갈 문구를 작성해주세요.",
      placeholder: "예) RT 300 달성 시 오픈 / PPT 5장 / 둥근 칸형 스케줄표 / 메인 문구 포함"
    },
    ppt: {
      label: "PPT",
      guide: "PPT 장수마다 들어갈 내용 혹은 적어져 있는 링크(구글, 캔바 등)를 적어주세요.",
      placeholder: "예) 1장 자기소개 / 2장 방송 규칙 / 3장 콘텐츠 소개"
    },
    chzzk: {
      label: "치지직",
      guide: "배너 종류 및 갯수를 작성해주세요.",
      placeholder: "예) 유튜브, 트위터, 팬심, 노래책 / 총 4종"
    },
    soop: {
      label: "SOOP",
      guide: "배너에 들어갈 문구를 작성해주세요.",
      placeholder: "예) 배너 2종 / 메인 문구 포함"
    },
    youtube: {
      label: "유튜브",
      guide: "채널아트에 들어갈 문구를 작성해주세요.",
      placeholder: "예) 매주 화·목·토 오후 8시 방송"
    },
    thumbnail: {
      label: "썸네일",
      guide: "썸네일에 들어갈 문구를 작성해주세요.",
      placeholder: "예) 첫 방송 / 신규 의상 공개 / 3D 공개"
    },
    poster: {
      label: "포스터",
      guide: "포스터에 들어갈 문구, RT 포스터일 경우 오픈 숫자 및 희망 오픈 방식을 작성해주세요.",
      placeholder: "예) (RT 포스터) 00RT, 00RT 부분공개 or 그라데이션 공개 / (일반 포스터) 메인 타이틀 및 문구 등 / 세로형, 가로형 등"
    },
    schedule: {
      label: "스케줄표",
      guide: "일자형, 네모칸형 등 원하는 사항을 작성해주세요.",
      placeholder: "예) 네모칸형 / 밝은 핑크 / 7칸 구성"
    },
    logo: {
      label: "로고",
      guide: "로고에 들어갈 문구를 작성해주세요.",
      placeholder: "예) 하루카 / HARUKA / Dreaming On Air"
    },
    boardgame: {
      label: "주루마블",
      guide: "예시 참고하여 모서리칸, 내용칸 문구를 작성해주세요.",
      placeholder: "예) 시작 / 벌칙 / 휴식 / 애교 3초 / 노래 한 소절"
    },
    waiting: {
      label: "대기화면",
      guide: "대기화면에 들어갈 문구를 작성해주세요.",
      placeholder: "예) 잠시 후 방송이 시작됩니다"
    },
    vod: {
      label: "다시보기",
      guide: "날짜와 문구 위치, 서브텍스트 유무를 작성해주세요.",
      placeholder: "예) 날짜 좌상단 / 타이틀 중앙 / 서브텍스트 있음"
    },
    etc: {
      label: "그 외 디자인",
      guide: "선택 항목에 없는 디자인이나 포트폴리오에 없는 디자인 요청 내용을 자유롭게 작성해주세요.",
      placeholder: " 예) 로드맵, 서버 API, 인생네컷 등"
    }
  };

  const detailStore = {};
  let currentKey = null;
  let currentToggle = null;

  function setMessage(text, isError = false) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.style.color = isError ? "#d14d72" : "#b14c73";
  }

function updateCardState(key) {
  const item = document.querySelector(`.design-item[data-key="${key}"]`);
  const toggle = document.querySelector(`.design-toggle[data-key="${key}"]`);
  const editBtn = document.querySelector(`.design-edit-btn[data-key="${key}"]`);

  if (!item || !toggle) return;

  const hasSavedValue = Boolean((detailStore[key] || "").trim());

  item.classList.toggle("active", toggle.checked);

  if (editBtn) {
    editBtn.hidden = !hasSavedValue;
  }
}

function openModal(key, toggleEl) {
  const config = designConfig[key];
  if (!config) return;

  currentKey = key;
  currentToggle = toggleEl || null;

  modalTitle.textContent = `${config.label} 상세 작성`;
  modalGuide.textContent = config.guide;
  modalTextarea.placeholder = config.placeholder;
  modalTextarea.value = detailStore[key] || "";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    modalTextarea.focus({ preventScroll: true });
  });
}

function closeModal({ revertIfEmpty = false } = {}) {
  if (revertIfEmpty && currentKey && currentToggle) {
    const draftValue = (modalTextarea.value || "").trim();
    const savedValue = (detailStore[currentKey] || "").trim();

    if (!draftValue && !savedValue && currentToggle.checked) {
      currentToggle.checked = false;
      updateCardState(currentKey);
    }
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  currentKey = null;
  currentToggle = null;
}

function saveModalDetail() {
  if (!currentKey) return;

  detailStore[currentKey] = modalTextarea.value.trim();
  updateCardState(currentKey);
  closeModal();
  setMessage("상세 내용이 저장되었어요.");
}

designToggles.forEach((toggle) => {
  const key = toggle.dataset.key;
  updateCardState(key);

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      updateCardState(key);

      requestAnimationFrame(() => {
        openModal(key, toggle);
      });
    } else {
      updateCardState(key);
    }
  });
});

editButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const key = button.dataset.key;
    const toggle = document.querySelector(`.design-toggle[data-key="${key}"]`);

    openModal(key, toggle);
  });
});

  closeModalBtn.addEventListener("click", () => closeModal({ revertIfEmpty: true }));
  cancelModalBtn.addEventListener("click", () => closeModal({ revertIfEmpty: true }));
  backdrop.addEventListener("click", () => closeModal({ revertIfEmpty: true }));

  saveDetailBtn.addEventListener("click", saveModalDetail);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal({ revertIfEmpty: true });
    }
  });

  function buildSelectedDesignLines() {
    const orderedKeys = [
      "package",
      "ppt",
      "chzzk",
      "soop",
      "youtube",
      "thumbnail",
      "poster",
      "schedule",
      "logo",
      "boardgame",
      "waiting",
      "vod",
      "etc"
    ];

    return orderedKeys
      .filter((key) => {
        const toggle = document.querySelector(`.design-toggle[data-key="${key}"]`);
        return Boolean(toggle?.checked);
      })
      .map((key) => {
        const label = designConfig[key].label;
        const value = detailStore[key] || "";
        return `· ${label} : ${value}`;
      });
  }

  async function copyFormText() {
    if (!noticeConfirm.checked) {
      setMessage("공지사항 확인 체크를 해야 양식을 복사할 수 있어요.", true);
      return;
    }

    const broadcastInfo = document.getElementById("broadcastInfo")?.value.trim() || "";
    const desiredDate = document.getElementById("desiredDate")?.value.trim() || "";
    const referenceNote = document.getElementById("referenceNote")?.value.trim() || "";

    const extraOptions = Array.from(
      form.querySelectorAll('input[name="extraOption"]:checked')
    ).map((el) => el.value);

    const rushOption =
      form.querySelector('input[name="rushOption"]:checked')?.value || "";

    const selectedDesignLines = buildSelectedDesignLines();

    const copiedText = [
      `⯌ 방송 닉네임 및 주소 : ${broadcastInfo}`,
      `⯌ 수령 희망 날짜 : ${desiredDate}`,
      `⯌ 신청하실 디자인 항목`,
      ...selectedDesignLines,
      `⯌ 추가 옵션 : ${extraOptions.join(", ")}`,
      `⯌ 빠른 마감 옵션 : ${rushOption}`,
      `⯌ 참고자료 및 요청사항 : ${referenceNote}`,
      `⯌ 공지사항 확인 : 확인 완료`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(copiedText);
      setMessage("양식이 복사되었어요.");
    } catch (error) {
      setMessage("복사에 실패했어요. 브라우저 권한을 확인해주세요.", true);
    }
  }

  function resetFormAll() {
    form.reset();

    Object.keys(designConfig).forEach((key) => {
      detailStore[key] = "";
      updateCardState(key);
    });

    closeModal();
    setMessage("양식이 초기화되었어요.");
  }

  copyBtn.addEventListener("click", copyFormText);
  resetBtn.addEventListener("click", resetFormAll);
})();