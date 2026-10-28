import { PHOTOS } from "@/lib/photos";
import type { SiteCopy } from "@/lib/siteContent";
import type { ExtraNumbers } from "@/lib/translationChecks";

/**
 * Traditional Chinese site copy — SPEC.md §7.5 (v1.13). Every string
 * renders the English string at the same place in lib/siteContent.ts, and
 * adds or drops nothing (CLAUDE.md rule 1). Drafted by Claude; each string
 * ships only once Suyu has approved it (SPEC_v1.13_amendment.md §6).
 *
 * Proper names stay English (Humber Polytechnic, Back Alley Barbell, the
 * OWA, Rogers Centre, BlueJaysFanWeb, PATS), and so do the two employers
 * until Suyu confirms their Chinese names. The credential stays English,
 * unglossed. The work-authorization and availability wordings are the
 * §6.2 drafts. No 破折號 (rule 10); lib/translationChecks.ts enforces it.
 */
export const SITE_COPY_ZH: SiteCopy = {
  meta: {
    title: "田野筆記",
    siteName: "Suyu — 田野筆記",
    description:
      "Suyu，多倫多的全端工程師。六年來打造支撐企業營運的核心系統：規劃、簽核、資產與銷售，現在也在導入 AI。",
    projectsTitle: "專案",
    projectsDescription: "所有專案，可依標籤篩選。",
    aboutTitle: "關於",
    aboutDescription:
      "Suyu — 多倫多的全端工程師：六年的 ERP、CRM 與企業系統經驗，現在也在導入 AI。",
  },
  ui: {
    skipLink: "跳到主要內容",
    nav: {
      label: "主要導覽",
      home: "首頁",
      projects: "專案",
      about: "關於",
      resume: "履歷",
    },
    featuredHeading: "精選筆記",
    allProjects: "所有專案",
    card: {
      cta: "閱讀案例",
      ctaLabelPrefix: "閱讀案例：",
    },
    filter: {
      label: "依標籤篩選專案",
      all: "全部",
      empty: "這個標籤底下還沒有筆記",
    },
    tags: {
      "full-stack": "全端",
      AI: "AI",
      "data engineering": "資料工程",
      modeling: "建模",
      frontend: "前端",
      BI: "BI",
      research: "研究",
    },
    caseStudy: {
      demo: "線上展示",
      repo: "原始碼",
      writeup: "文章",
      contentsLabel: "目錄",
      contentsLead: "目錄：",
      moreNotesLabel: "更多筆記",
      allProjects: "所有專案",
      nextNotePrefix: "下一篇：",
    },
  },
  hero: {
    headline: "田野筆記",
    // The positioning statement (SPEC §1), §6.2 draft. Its copies, the zh
    // site and /about descriptions above, follow it (SPEC §6.5).
    intro:
      "你好，我是 Suyu。過去六年，我打造支撐企業營運的核心系統：規劃、簽核、資產與銷售。我做的是完整而有效率的解決方案，最近也開始導入 AI，讓它們更聰明。",
    subline: "多倫多 · 全端 · ERP 與企業系統 · AI 整合",
    chatCta: "和 PATS 聊聊",
    aboutCta: "關於我",
    interestsCta: "興趣",
    doodleCaption: "校準，親手檢查",
    portrait: {
      image: PHOTOS.portrait,
      alt: "Suyu 戴著藍鳥隊球帽、穿著球衣微笑",
    },
  },
  availability: "現在即可到職，尋找全職的全端與軟體工程職位。人在多倫多，也願意搬遷。",
  footer: {
    handNote: "用 rough.js 畫的",
  },
  about: {
    headline: "關於",
    interestsId: "interests",
    portrait: {
      image: PHOTOS.portrait,
      alt: "Suyu 戴著藍鳥隊球帽、穿著球衣微笑",
    },
    bio: [
      "我是 Suyu。我在台北的 Seasonic Electronics（電源供應器製造商）和 ACTi Corporation（安全科技公司）待過六年，兩邊都是兩到三人的內部開發團隊。我打造的是這些公司日常真正倚賴的系統：物料需求規劃、多階段簽核流程、固定資產追蹤、銷售預測與佣金。所謂從頭到尾，是和執行長、財務、採購與工廠現場一起釐清需求，設計資料模型，寫大量 SQL 的後端和前端，再推行到四個國家。",
      "我在 2024 年搬到多倫多，並在 Humber Polytechnic 完成 Ontario College Graduate Certificate, Information Technology Solutions with Honours（2024 年 9 月至 2026 年 5 月）。現在我在這裡尋找全端與軟體工程職位。我是台灣籍，可在加拿大合法工作，不需雇主擔保。這個網站上的專案，想呈現的是真正的決策深度，而不是一張功能清單。",
    ],
    howIWork: {
      heading: "我的工作方式",
      intro:
        "這些專案背後有一條共同的主線，是從研究借來的工作紀律：在你可能被誘惑去改規則之前，先把規則定好。",
      points: [
        {
          title: "先設計，再實作",
          body: "書面規格是唯一的依據。我先在紙上規劃好決策，再照著它寫程式，讓困難的選擇是經過深思熟慮做出的，而不是在敲鍵盤的途中臨時決定。",
        },
        {
          title: "預先登記",
          body: "在八字研究裡，我在檢視任何一個相關係數之前就凍結了 47 個假設，所以不可能一路調整、湊出正面的結果。",
        },
        {
          title: "凍結的測試向量",
          body: "世界盃的價值計算先用 Python 寫一次，再移植到 TypeScript，並用黃金向量（golden vectors）讓兩邊保持一致：84 個測試全數通過。",
        },
        {
          title: "大聲失敗的資料管線",
          body: "我的 ETL 遇到對不上的隊名或悄悄偏移的座標時，會直接報錯，而不是取個近似值。大聲的失敗，勝過一個看起來合理的錯誤答案。",
        },
        {
          title: "準確優先於流暢",
          body: "這個網站上的助理只能陳述知識庫裡寫明的事實；其他問題一律得到一句固定的回覆，而不是一個聽起來合理的猜測。",
        },
      ],
    },
    volunteering: {
      heading: "志工服務",
      intro:
        "2025 年，我在多倫多和 Back Alley Barbell 一起擔任肌力比賽的志工：先布置場地，比賽時在場上擔任護槓員與安全人員。",
      roles: [
        {
          title: "健力比賽",
          detail: "共有來自全省 5 所學院的 36 位選手參賽。",
          when: "2025 · 多倫多",
        },
        {
          title: "舉重比賽",
          detail: "經 Ontario Weightlifting Association（OWA）認可。",
          when: "2025 · 多倫多",
        },
        {
          title: "Back Alley's Strongest",
          detail: "一場大力士比賽。",
          when: "2025 · 多倫多",
        },
      ],
    },
    interestsHeading: "興趣",
    interests: [
      {
        body: "寫程式之外：棒球，尤其是藍鳥隊，BlueJaysFanWeb 就是這樣來的。",
        photos: [
          {
            image: PHOTOS.bluejaysGame1,
            alt: "Suyu 穿著 Springer 4 號球衣的背影，在 Rogers Centre 朝球場舉起球帽",
            caption: "我的 Springer 球衣，Rogers Centre",
          },
          {
            image: PHOTOS.bluejaysGame2,
            alt: "Suyu 指著藍鳥隊的獎盃展示櫃",
            caption: "Rogers Centre 的獎盃櫃",
          },
        ],
      },
      {
        body: "我也長期對八字（BaZi）有興趣，也就是中國傳統的命盤命理。這正是那份預先登記研究真正的起點：一個我有偏愛的主題，最適合拿來考驗自己，看我能不能對想相信的事情保持嚴謹。",
        photos: [],
      },
      {
        body: "我也練重訓。在台灣時，我每週下班後訓練四到五次；2022 年，我代表宜蘭縣參加全民運動會的健力項目。全民運動會是台灣的全國綜合運動會，每個縣市各派一隊參加。我在那場比賽的成績：深蹲 205 公斤、臥推 120 公斤、硬舉 230 公斤。",
        photos: [
          {
            image: PHOTOS.powerlifting1,
            alt: "Suyu 在比賽台上準備硬舉 230 公斤，裁判在一旁看著",
            caption: "230 公斤的硬舉",
          },
          {
            image: PHOTOS.powerlifting2,
            alt: "Suyu 穿著藍色外套坐在比賽熱身區，身旁是其他選手",
            caption: "在熱身區",
          },
        ],
      },
      {
        body: "週末我喜歡到戶外：去山裡健行，或到海裡自由潛水。",
        photos: [
          {
            image: PHOTOS.hiking1,
            alt: "晴朗藍天下，Suyu 站在兩側高聳雪牆之間的道路上",
            caption: "山裡的雪牆",
          },
          {
            image: PHOTOS.hiking2,
            alt: "Suyu 戴著太陽眼鏡、穿著刷毛外套站在多石的河邊，背後是積雪的山峰",
            caption: "雪峰之下",
          },
          {
            image: PHOTOS.freediving1,
            alt: "Suyu 穿著防寒衣、戴著面鏡浮在海面上，舉起一隻手，背後是青綠的山丘",
            caption: "自由潛水",
          },
          {
            image: PHOTOS.freediving2,
            alt: "從下方看，Suyu 在深藍的海水中沿著導潛繩自由潛水，成了一道剪影",
            caption: "沿著繩子往下",
          },
        ],
      },
    ],
    contactHeading: "聯絡",
  },
};

/**
 * Numbers only the Chinese writes in digits, by copy path, each with the
 * English word it renders (lib/translationChecks.ts).
 */
export const SITE_COPY_ZH_EXTRA_NUMBERS: Readonly<Record<string, ExtraNumbers>> = {
  "about.bio.1": { "9": "September", "5": "May" },
};
