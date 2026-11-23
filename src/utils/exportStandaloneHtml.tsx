import { renderToStaticMarkup } from 'react-dom/server';
import { DiagramViewer } from '../components/DiagramViewer';
import { darkAcademiaLibraryScenes } from '../data/libraryScenes';
import type { DiagramId, QuizDataset } from '../types/quiz';

const DIAGRAM_IDS: DiagramId[] = [
  'fig1',
  'fig2',
  'fig3',
  'fig4',
  'fig5',
  'fig6',
  'fig7',
  'fig8',
  'fig9',
  'fig10',
];

function buildDiagramMap(): Record<DiagramId, string> {
  const map = {} as Record<DiagramId, string>;
  for (const id of DIAGRAM_IDS) {
    map[id] = renderToStaticMarkup(<DiagramViewer diagramId={id} />);
  }
  return map;
}

function safeJsonForHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function generateStandaloneBackupHtml(datasets: QuizDataset[]): string {
  const diagramMap = buildDiagramMap();
  const safeDatasetsJson = safeJsonForHtml(datasets);
  const safeDiagramsJson = safeJsonForHtml(diagramMap);
  const safeScenesJson = safeJsonForHtml(darkAcademiaLibraryScenes);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Daia's３次元ＣＡＤ対策</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Noto+Serif+JP:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Noto Serif JP', serif;
      background-color: #09070a;
      color: #e6dfd3;
      overflow-x: hidden;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .classic-title {
      font-family: 'Cinzel', 'Playfair Display', 'Noto Serif JP', serif;
    }
    #library-bg-video {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -2;
      pointer-events: none;
      background-color: #09070a;
    }
    #library-bg-overlay {
      position: fixed;
      inset: 0;
      z-index: -1;
      background: radial-gradient(circle at 50% 35%, rgba(13, 10, 14, 0.30) 0%, rgba(7, 5, 9, 0.50) 100%);
      backdrop-filter: blur(2px);
      pointer-events: none;
    }
    .antique-card {
      background: linear-gradient(145deg, rgba(24, 20, 28, 0.90) 0%, rgba(15, 12, 19, 0.94) 100%);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(197, 160, 89, 0.5);
      box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(212, 175, 55, 0.2);
      position: relative;
      border-radius: 1rem;
      padding: 1.5rem;
    }
    .antique-card::before {
      content: '';
      position: absolute;
      inset: 4px;
      border: 1px solid rgba(197, 160, 89, 0.18);
      border-radius: inherit;
      pointer-events: none;
    }
    .antique-btn {
      background: linear-gradient(135deg, #3a1c24 0%, #241116 100%);
      color: #f3e5ab;
      border: 1px solid #c5a059;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
      transition: all 0.25s ease;
      cursor: pointer;
    }
    .antique-btn:hover {
      background: linear-gradient(135deg, #522531 0%, #33161e 100%);
      border-color: #ffd700;
      box-shadow: 0 0 15px rgba(197, 160, 89, 0.35);
      transform: translateY(-1px);
    }
    .antique-option {
      background-color: rgba(24, 19, 29, 0.88);
      border: 1px solid rgba(197, 160, 89, 0.32);
      color: #dfd7c8;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .antique-option:hover:not(:disabled) {
      background-color: rgba(58, 43, 66, 0.78);
      border-color: #d4af37;
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.22);
    }
    .hidden { display: none !important; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.35s ease-out forwards;
    }
    /* Offline fallback layout helpers if Tailwind CDN is unreachable */
    .fallback-container { max-width: 48rem; width: 100%; margin: 1.5rem auto; padding: 1rem; flex-grow: 1; }
    .fallback-header { background: rgba(9, 7, 10, 0.9); border-bottom: 1px solid rgba(197, 160, 89, 0.4); padding: 1.25rem 1rem; position: sticky; top: 0; z-index: 10; }
    .fallback-footer { background: #09070a; color: #6e6359; font-size: 0.75rem; padding: 1rem; text-align: center; border-top: 1px solid rgba(197, 160, 89, 0.2); }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between selection:bg-[#722f37] selection:text-[#f3e5ab]">
  <video id="library-bg-video" autoplay loop muted playsinline preload="auto"></video>
  <div id="library-bg-overlay"></div>

  <header class="fallback-header bg-[#09070a]/90 backdrop-blur-md text-[#e6dfd3] py-5 px-4 border-b border-[#c5a059]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] sticky top-0 z-10">
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center space-x-3 cursor-pointer group" onclick="goToHome()">
        <div class="p-2 rounded-full border border-[#c5a059]/50 bg-[#1a141e] group-hover:border-[#ffd700] transition">
          <svg class="w-6 h-6 text-[#d4af37]" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <div>
          <span class="block text-[10px] tracking-[0.25em] text-[#c5a059]">Daia's３次元ＣＡＤ対策</span>
          <h1 class="classic-title text-xl sm:text-2xl font-bold tracking-wider text-[#f3e5ab]">3次元CAD利用技術者試験２級</h1>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <div id="scene-menu-container" class="relative">
          <span id="bg-scene-badge" onclick="handleSceneBadgeClick()" class="hidden md:inline-block text-[11px] px-3 py-1 rounded-full bg-[#17121c]/90 text-[#c5a059] border border-[#c5a059]/30 tracking-wider">
            🏛️ 書庫情景
          </span>
          <div id="scene-menu-popover" class="hidden absolute right-0 mt-2 w-72 rounded-xl bg-[#141019]/95 backdrop-blur-md border border-[#c5a059]/70 shadow-2xl p-2 z-50 animate-fadeIn">
            <div class="px-2.5 py-1.5 text-[11px] font-bold text-[#d4af37] border-b border-[#c5a059]/25 mb-1 flex items-center justify-between">
              <span>🎬 背景動画を選択</span>
              <span class="text-[10px] text-[#9e9285]">テストモード</span>
            </div>
            <div id="scene-menu-list" class="max-h-64 overflow-y-auto space-y-1"></div>
            <div class="border-t border-[#c5a059]/25 mt-2 pt-2">
              <input id="custom-video-file-input" type="file" accept="video/*" onchange="handleCustomVideoSelect(this)" class="hidden" />
              <button type="button" onclick="document.getElementById('custom-video-file-input').click()" class="w-full px-3 py-2 rounded-lg text-xs font-bold bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] border border-[#c5a059]/50 transition flex items-center justify-center gap-1.5 cursor-pointer">
                <span>📁 任意の動画ファイルを選択</span>
              </button>
            </div>
          </div>
        </div>
        <button id="home-btn-header" onclick="goToHome()" class="hidden text-xs sm:text-sm px-4 py-2 rounded-lg bg-[#1d1722] hover:bg-[#3a1c24] text-[#d4af37] border border-[#c5a059]/50 transition shadow cursor-pointer">
          🗝️ ホームへ戻る
        </button>
      </div>
    </div>
  </header>

  <main class="fallback-container flex-grow max-w-3xl w-full mx-auto p-4 sm:p-6 my-6">
    <div id="custom-toast" class="hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#2a151b] border border-[#d4af37] text-[#f3e5ab] px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fadeIn">
      <span id="custom-toast-msg"></span>
    </div>

    <div id="view-home" class="space-y-8 animate-fadeIn">
      <div class="text-center space-y-3 mb-8">
        <button type="button" onclick="toggleSecretInput()" class="inline-block text-xs tracking-[0.2em] uppercase px-4 py-1 bg-[#261829] text-[#d4af37] font-semibold rounded-full border border-[#c5a059]/40 cursor-pointer hover:border-[#ffd700] transition">
          ✦ ようこそ ✦
        </button>
        <h2 class="classic-title text-3xl sm:text-4xl font-bold text-[#f3e5ab] drop-shadow">ホーム</h2>
        <p class="text-sm text-[#9e9285]">ファイルを1つお選びください。</p>
        <div id="secret-input-wrap" class="hidden pt-2 flex items-center justify-center gap-2 animate-fadeIn">
          <input id="secret-input" type="text" autocomplete="off" placeholder="コマンドを入力..." oninput="handleSecretInput(this.value)" onkeydown="if(event.key==='Escape'){closeSecretInput();}" class="w-52 px-3 py-1.5 rounded-lg bg-[#120e16] border border-[#c5a059]/60 text-[#f5efe6] placeholder-[#7d7267] text-xs focus:outline-none focus:border-[#ffd700]" />
        </div>
      </div>
      <div id="file-list-container" class="grid grid-cols-1 gap-6"></div>
      <div id="test-mode-home-bar" class="hidden bg-[#130f17]/90 border border-[#c5a059]/35 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-fadeIn">
        <div class="space-y-1">
          <span class="text-xs font-bold text-[#d4af37] tracking-wider">🛠️ テストモード有効中</span>
          <p class="text-xs sm:text-sm text-[#a69a8c] leading-relaxed">場所番号の表示と、問題画面での番号移動・全問数変更が有効です（Escキーで通常モードに戻ります）。</p>
        </div>
      </div>
    </div>

    <div id="view-quiz" class="hidden space-y-6 animate-fadeIn">
      <div class="bg-[#151118] border border-[#c5a059]/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
        <span id="quiz-file-title" class="font-bold text-[#d4af37] text-sm sm:text-base tracking-wide"></span>
        <div class="flex items-center space-x-3">
          <span id="quiz-progress-text" class="bg-[#2a1c30] px-4 py-1 rounded-full font-bold text-xs sm:text-sm text-[#f3e5ab] border border-[#c5a059]/60 shadow-inner"></span>
        </div>
      </div>

      <div class="antique-card rounded-2xl p-6 sm:p-8 space-y-6">
        <div class="space-y-3">
          <div class="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-bold text-[#c5a059] bg-[#211926] px-3 py-1 rounded border border-[#c5a059]/40" id="current-q-badge"></div>
          <div id="question-diagram-container" class="hidden my-4 p-3 sm:p-4 bg-[#f8f6f0] rounded-xl border-2 border-[#c5a059]/70 shadow-inner overflow-x-auto"></div>
          <h3 id="question-text" class="text-lg sm:text-xl font-bold text-[#f5efe6] leading-relaxed"></h3>
        </div>
        <div id="options-container" class="space-y-3"></div>
        <div id="explanation-box" class="hidden mt-6 p-5 rounded-xl border-l-4 transition-all animate-fadeIn">
          <div class="flex items-center space-x-2 font-bold mb-2" id="explanation-header"></div>
          <div id="explanation-text" class="text-sm sm:text-base leading-relaxed"></div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2">
        <button onclick="prevQuestion()" id="prev-btn" class="px-5 py-3 rounded-xl border border-[#c5a059]/40 text-[#c9beae] bg-[#1a151f] hover:bg-[#2a2133] hover:text-[#f3e5ab] font-semibold text-sm transition flex items-center space-x-2 shadow cursor-pointer">
          <span>◀ 戻る</span>
        </button>
        <button onclick="nextQuestion()" id="next-btn" class="antique-btn px-7 py-3 rounded-xl font-bold text-sm transition flex items-center space-x-2 cursor-pointer">
          <span id="next-btn-text">次へ ▶</span>
        </button>
      </div>
    </div>

    <div id="view-result" class="hidden space-y-6 animate-fadeIn">
      <div class="antique-card rounded-2xl p-8 sm:p-10 text-center space-y-8">
        <div class="space-y-3">
          <span class="inline-block text-xs uppercase tracking-[0.25em] text-[#d4af37] font-bold px-4 py-1 bg-[#261829] rounded-full border border-[#c5a059]/40">
            ✦ 試練の記録 ✦
          </span>
          <h2 class="classic-title text-3xl sm:text-4xl font-bold text-[#f3e5ab]">最終鑑定結果</h2>
          <p class="text-sm text-[#a69a8c]" id="result-file-subtitle"></p>
        </div>

        <div class="bg-[#120e16] border border-[#c5a059]/50 rounded-xl p-6 max-w-lg mx-auto grid grid-cols-3 gap-4 shadow-inner">
          <div class="text-center border-r border-[#c5a059]/25 pr-2">
            <span class="block text-xs text-[#9e9285] font-semibold mb-1">正解した回数</span>
            <span id="stat-correct" class="text-2xl sm:text-3xl font-bold text-emerald-400">0</span>
          </div>
          <div class="text-center border-r border-[#c5a059]/25 pr-2">
            <span class="block text-xs text-[#9e9285] font-semibold mb-1">間違えた回数</span>
            <span id="stat-incorrect" class="text-2xl sm:text-3xl font-bold text-rose-400">0</span>
          </div>
          <div class="text-center">
            <span class="block text-xs text-[#9e9285] font-semibold mb-1">正解率</span>
            <span id="stat-percentage" class="text-2xl sm:text-3xl font-bold text-[#f3e5ab]">0%</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-4">
          <button onclick="handleResultHomeClick()" class="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#e6dfd3] font-bold shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer">
            <span id="result-home-btn-text">🗝️ ホームに戻る</span>
          </button>
          <button id="retry-incorrect-btn" onclick="retryIncorrectOnly()" class="hidden w-full sm:w-auto px-6 py-3.5 rounded-xl border border-rose-500/70 bg-[#2d141d] hover:bg-[#421a28] text-[#f3e5ab] font-bold shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer">
            <span id="retry-incorrect-text">🔄 間違えた問題だけをやり直す</span>
          </button>
          <button onclick="retryQuiz()" class="w-full sm:w-auto antique-btn px-8 py-3.5 rounded-xl font-bold shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer">
            <span>🕯️ もう一度挑戦する</span>
          </button>
        </div>
      </div>
    </div>

    <!-- VIEW 4: DATA TRANSFER SCREEN -->
    <div id="view-transfer" class="hidden space-y-6 animate-fadeIn">
      <div class="antique-card rounded-2xl p-6 sm:p-8 space-y-8">
        <div class="text-center space-y-2">
          <span class="inline-block text-xs uppercase tracking-[0.25em] text-[#d4af37] font-bold px-4 py-1 bg-[#261829] rounded-full border border-[#c5a059]/40">
            ✦ 記録の継承 ✦
          </span>
          <h2 class="classic-title text-2xl sm:text-3xl font-bold text-[#f3e5ab]">
            データ引継ぎ（Base64URL）
          </h2>
          <p id="transfer-subtitle" class="text-xs sm:text-sm text-[#a69a8c]">
            現在の復習問題（全 0 問）をコードやURLとして別の端末・ブラウザへ引き継げます。
          </p>
        </div>

        <div class="space-y-3 bg-[#120e16]/80 border border-[#c5a059]/35 rounded-xl p-5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm sm:text-base font-bold text-[#d4af37]">
              📤 データを書き出す（引継ぎコード）
            </h3>
            <span id="transfer-count-label" class="text-xs text-[#a69a8c]">収録数：0 問</span>
          </div>
          <textarea
            id="transfer-export-code"
            readonly
            rows="3"
            onfocus="this.select()"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0910] border border-[#c5a059]/50 text-[#f3e5ab] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#ffd700] resize-none"
          ></textarea>
          <div class="flex flex-col sm:flex-row gap-3">
            <button type="button" onclick="copyTransferCode()" class="antique-btn px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer">
              📋 コードをコピー
            </button>
            <button type="button" onclick="copyTransferUrl()" class="px-5 py-2.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] text-xs sm:text-sm font-bold transition shadow cursor-pointer">
              🔗 引継ぎURLをコピー
            </button>
          </div>
        </div>

        <div class="space-y-3 bg-[#120e16]/80 border border-[#c5a059]/35 rounded-xl p-5">
          <h3 class="text-sm sm:text-base font-bold text-[#d4af37]">
            📥 データを読み込む（コード / 引継ぎURL）
          </h3>
          <textarea
            id="transfer-import-input"
            rows="3"
            placeholder="Base64URLコード、または引継ぎURL（?save=...）をここに貼り付けてください..."
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0910] border border-[#c5a059]/50 text-[#f5efe6] placeholder-[#7d7267] text-xs font-mono leading-relaxed focus:outline-none focus:border-[#ffd700] resize-none"
          ></textarea>
          <div class="flex flex-col sm:flex-row flex-wrap gap-3">
            <button type="button" onclick="importTransferData(false)" class="antique-btn px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer">
              📥 上書きして読み込む
            </button>
            <button type="button" onclick="importTransferData(true)" class="px-5 py-2.5 rounded-xl border border-[#c5a059]/60 bg-[#1c1622] hover:bg-[#2c2236] text-[#f3e5ab] text-xs sm:text-sm font-bold transition shadow cursor-pointer">
              ➕ 現在の記録と統合する
            </button>
          </div>
        </div>

        <div id="transfer-reset-trigger" class="flex justify-center pt-2">
          <button type="button" onclick="openResetConfirm()" class="px-6 py-3 rounded-xl border border-rose-500/60 bg-[#261117] hover:bg-[#3a1822] text-rose-200 font-bold text-sm shadow-lg transition cursor-pointer">
            🗑️ データを初期化
          </button>
        </div>
        <div id="transfer-reset-confirm" class="hidden bg-[#261117]/90 border border-rose-500/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <p id="transfer-reset-message" class="text-xs sm:text-sm text-rose-200 font-semibold">
            保存されている復習問題データ（全 0 問）をすべて消去して初期化しますか？
          </p>
          <div class="flex items-center gap-3 shrink-0">
            <button type="button" onclick="cancelResetConfirm()" class="px-4 py-2 rounded-lg border border-[#c5a059]/40 bg-[#1c1622] hover:bg-[#2c2236] text-[#e6dfd3] text-xs font-bold transition cursor-pointer">
              キャンセル
            </button>
            <button type="button" onclick="confirmResetAllData()" class="px-4 py-2 rounded-lg border border-rose-400 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer">
              初期化する
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer class="fallback-footer bg-[#09070a] text-[#6e6359] text-xs py-4 text-center border-t border-[#c5a059]/20">
    <p>Gutta cavat lapidem.</p>
  </footer>

  <script>
    const darkAcademiaLibraryScenes = ${safeScenesJson};
    const diagramSvgs = ${safeDiagramsJson};
    const quizDatasets = ${safeDatasetsJson};

    let lastBgIndex = -1;
    let currentDataset = null;
    let currentIndex = 0;
    let userAnswers = [];
    let isAnswered = false;
    let toastTimeout = null;
    let currentFolder = null;
    const REVIEW_STORAGE_KEY = 'daia_3dcad_review_questions_v1';
    const REVIEW_DATASET_ID = 'review_wrong_questions';

    function getQuestionKey(q) {
      return (q.diagram || '') + '::' + (q.type || 'choice') + '::' + q.question;
    }

    function loadStoredReviewQuestions() {
      try {
        const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function saveStoredReviewQuestions(list) {
      try {
        window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {}
    }

    let reviewQuestions = loadStoredReviewQuestions();

    function encodeBase64Url(text) {
      const bytes = new TextEncoder().encode(text);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary)
        .split('+').join('-')
        .split('/').join('_')
        .replace(/=+$/, '');
    }

    function decodeBase64Url(code) {
      const normalized = code.trim().split('-').join('+').split('_').join('/');
      if (!normalized || !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) {
        throw new Error('Invalid Base64URL format');
      }
      const padLen = (4 - (normalized.length % 4)) % 4;
      const padded = normalized + '='.repeat(padLen);
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    }

    function exportReviewToBase64Url(list, datasets) {
      const indexLookup = new Map();
      datasets.forEach((ds, dsIdx) => {
        ds.questions.forEach((q, qIdx) => {
          const key = getQuestionKey(q);
          if (!indexLookup.has(key)) {
            indexLookup.set(key, [dsIdx, qIdx]);
          }
        });
      });

      const refs = [];
      const extras = [];
      for (let i = 0; i < list.length; i++) {
        const q = list[i];
        const ref = indexLookup.get(getQuestionKey(q));
        if (ref) refs.push(ref);
        else extras.push(q);
      }

      const payload = extras.length > 0
        ? { v: 1, r: refs, x: extras }
        : { v: 1, r: refs };
      return encodeBase64Url(JSON.stringify(payload));
    }

    function extractBase64UrlToken(input) {
      const trimmed = String(input || '').trim();
      if (!trimmed) return '';
      if (trimmed.indexOf('save=') !== -1) {
        try {
          const url = new URL(trimmed);
          const param = url.searchParams.get('save');
          if (param) return param.trim();
        } catch (e) {
          const idx = trimmed.indexOf('save=');
          if (idx !== -1) {
            const after = trimmed.slice(idx + 5);
            const end = after.search(/[&#\\s]/);
            const rawToken = end === -1 ? after : after.slice(0, end);
            if (rawToken) return decodeURIComponent(rawToken).trim();
          }
        }
      }
      return trimmed.replace(/\\s+/g, '');
    }

    function importReviewFromBase64Url(rawInput, datasets) {
      const token = extractBase64UrlToken(rawInput);
      if (!token) throw new Error('Empty input');
      const parsed = JSON.parse(decodeBase64Url(token));
      if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.r)) {
        throw new Error('Invalid payload structure');
      }
      const result = [];
      const seen = new Set();
      for (let i = 0; i < parsed.r.length; i++) {
        const entry = parsed.r[i];
        if (!Array.isArray(entry) || entry.length !== 2) continue;
        const ds = datasets[entry[0]];
        const q = ds && ds.questions ? ds.questions[entry[1]] : null;
        if (!q) continue;
        const key = getQuestionKey(q);
        if (!seen.has(key)) {
          seen.add(key);
          result.push(q);
        }
      }
      if (Array.isArray(parsed.x)) {
        for (let i = 0; i < parsed.x.length; i++) {
          const q = parsed.x[i];
          if (!q || typeof q.question !== 'string') continue;
          const key = getQuestionKey(q);
          if (!seen.has(key)) {
            seen.add(key);
            result.push(q);
          }
        }
      }
      return result;
    }

    function mergeReviewQuestions(current, incoming) {
      const merged = current.slice();
      const seen = new Set(current.map(getQuestionKey));
      for (let i = 0; i < incoming.length; i++) {
        const q = incoming[i];
        const key = getQuestionKey(q);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(q);
        }
      }
      return merged;
    }

    function refreshTransferView() {
      const subtitleEl = document.getElementById('transfer-subtitle');
      const countEl = document.getElementById('transfer-count-label');
      const codeEl = document.getElementById('transfer-export-code');
      if (subtitleEl) {
        subtitleEl.innerText = '現在の復習問題（全 ' + reviewQuestions.length + ' 問）をコードやURLとして別の端末・ブラウザへ引き継げます。';
      }
      if (countEl) {
        countEl.innerText = '収録数：' + reviewQuestions.length + ' 問';
      }
      if (codeEl) {
        codeEl.value = exportReviewToBase64Url(reviewQuestions, quizDatasets);
      }
    }

    function openResetConfirm() {
      const msgEl = document.getElementById('transfer-reset-message');
      if (msgEl) {
        msgEl.innerText = '保存されている復習問題データ（全 ' + reviewQuestions.length + ' 問）をすべて消去して初期化しますか？';
      }
      const triggerEl = document.getElementById('transfer-reset-trigger');
      const confirmEl = document.getElementById('transfer-reset-confirm');
      if (triggerEl) triggerEl.classList.add('hidden');
      if (confirmEl) confirmEl.classList.remove('hidden');
    }

    function cancelResetConfirm() {
      const triggerEl = document.getElementById('transfer-reset-trigger');
      const confirmEl = document.getElementById('transfer-reset-confirm');
      if (confirmEl) confirmEl.classList.add('hidden');
      if (triggerEl) triggerEl.classList.remove('hidden');
    }

    function confirmResetAllData() {
      reviewQuestions = [];
      saveStoredReviewQuestions([]);
      try {
        window.localStorage.removeItem(REVIEW_STORAGE_KEY);
      } catch (e) {}
      const importEl = document.getElementById('transfer-import-input');
      if (importEl) importEl.value = '';
      cancelResetConfirm();
      refreshTransferView();
      showMessage('✦ 学習データを初期化しました。');
    }

    function openTransferView() {
      changeRandomLibraryBackground();
      document.getElementById('view-home').classList.add('hidden');
      document.getElementById('view-quiz').classList.add('hidden');
      document.getElementById('view-result').classList.add('hidden');
      document.getElementById('view-transfer').classList.remove('hidden');
      document.getElementById('home-btn-header').classList.remove('hidden');
      const importEl = document.getElementById('transfer-import-input');
      if (importEl) importEl.value = '';
      cancelResetConfirm();
      refreshTransferView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function copyTextToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const tmp = document.createElement('textarea');
        tmp.value = text;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }
    }

    async function copyTransferCode() {
      const code = exportReviewToBase64Url(reviewQuestions, quizDatasets);
      await copyTextToClipboard(code);
      showMessage('✦ Base64URLコードをコピーしました。');
    }

    async function copyTransferUrl() {
      const code = exportReviewToBase64Url(reviewQuestions, quizDatasets);
      const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '';
      const shareUrl = origin + window.location.pathname + '?save=' + code;
      await copyTextToClipboard(shareUrl);
      showMessage('✦ 引継ぎURLをコピーしました。');
    }

    function importTransferData(mergeMode) {
      const importEl = document.getElementById('transfer-import-input');
      const raw = importEl ? importEl.value : '';
      try {
        const imported = importReviewFromBase64Url(raw, quizDatasets);
        if (mergeMode) {
          const merged = mergeReviewQuestions(reviewQuestions, imported);
          const addedCount = merged.length - reviewQuestions.length;
          reviewQuestions = merged;
          saveStoredReviewQuestions(merged);
          if (importEl) importEl.value = '';
          refreshTransferView();
          showMessage('✦ 復習データを統合しました（新規追加 ' + addedCount + ' 問・合計 ' + merged.length + ' 問）。');
        } else {
          reviewQuestions = imported;
          saveStoredReviewQuestions(imported);
          if (importEl) importEl.value = '';
          refreshTransferView();
          showMessage('✦ ' + imported.length + ' 問の復習データを引き継ぎました（上書き）。');
        }
      } catch (e) {
        showMessage('引継ぎコードの形式が正しくありません。');
      }
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    let isTestMode = false;
    let testQuestionLimit = null;
    let keyBuffer = '';
    let jumpTimer = null;
    let totalTimer = null;
    let showSceneMenu = false;
    let customVideo = null;

    function getEffectiveTotal() {
      if (!currentDataset) return 0;
      const max = currentDataset.questions.length;
      if (testQuestionLimit === null) return max;
      return Math.max(1, Math.min(testQuestionLimit, max));
    }

    function clearCustomVideo() {
      if (customVideo && customVideo.url) {
        try { URL.revokeObjectURL(customVideo.url); } catch (e) {}
      }
      customVideo = null;
    }

    function closeSceneMenu() {
      showSceneMenu = false;
      const pop = document.getElementById('scene-menu-popover');
      if (pop) pop.classList.add('hidden');
    }

    function renderSceneMenuList() {
      const listEl = document.getElementById('scene-menu-list');
      if (!listEl) return;
      listEl.innerHTML = '';
      darkAcademiaLibraryScenes.forEach((scene, idx) => {
        const isActive = !customVideo && lastBgIndex === idx;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition cursor-pointer ' +
          (isActive
            ? 'bg-[#3a1c24] text-[#f3e5ab] border border-[#d4af37]/70 font-bold'
            : 'text-[#dfd7c8] hover:bg-[#231b2b] border border-transparent');
        btn.onclick = () => selectSceneByIndex(idx);
        btn.innerHTML = '<span class="truncate">' + (idx + 1) + '. ' + escapeHtml(scene.name) + '</span>' +
          (isActive ? '<span class="text-[10px] text-[#ffd700] shrink-0">再生中</span>' : '');
        listEl.appendChild(btn);
      });
    }

    function handleSceneBadgeClick() {
      if (!isTestMode) return;
      showSceneMenu = !showSceneMenu;
      const pop = document.getElementById('scene-menu-popover');
      if (!pop) return;
      if (showSceneMenu) {
        renderSceneMenuList();
        pop.classList.remove('hidden');
      } else {
        pop.classList.add('hidden');
      }
    }

    function applyBackgroundVideoUrl(url) {
      const bgVideo = document.getElementById('library-bg-video');
      if (!bgVideo) return;
      if (bgVideo.getAttribute('src') !== url) {
        bgVideo.src = url;
        bgVideo.load();
      }
      bgVideo.play().catch(() => {});
    }

    function selectSceneByIndex(idx) {
      if (idx < 0 || idx >= darkAcademiaLibraryScenes.length) return;
      clearCustomVideo();
      lastBgIndex = idx;
      applyBackgroundVideoUrl(darkAcademiaLibraryScenes[idx].url);
      closeSceneMenu();
      updateSceneBadge();
    }

    function handleCustomVideoSelect(inputEl) {
      const file = inputEl && inputEl.files ? inputEl.files[0] : null;
      if (!file) return;
      clearCustomVideo();
      const url = URL.createObjectURL(file);
      customVideo = { name: file.name, url: url };
      applyBackgroundVideoUrl(url);
      inputEl.value = '';
      closeSceneMenu();
      updateSceneBadge();
    }

    function updateSceneBadge() {
      const badge = document.getElementById('bg-scene-badge');
      if (!badge || lastBgIndex < 0) return;
      const scene = darkAcademiaLibraryScenes[lastBgIndex];
      if (isTestMode) {
        badge.className = 'inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-[#2a1c30] hover:bg-[#3a2542] text-[#f3e5ab] border border-[#d4af37]/70 hover:border-[#ffd700] tracking-wider transition shadow cursor-pointer';
        badge.title = 'クリックして背景動画を選択';
        if (customVideo) {
          badge.innerHTML = '<span class="max-w-[180px] sm:max-w-[240px] truncate">🎬 ' + escapeHtml(customVideo.name) + ' (任意)</span><span class="text-[9px] text-[#d4af37]">▼</span>';
        } else {
          badge.innerHTML = '<span class="max-w-[180px] sm:max-w-[240px] truncate">🏛️ ' + escapeHtml(scene.name) + ' (' + (lastBgIndex + 1) + '/' + darkAcademiaLibraryScenes.length + ')</span><span class="text-[9px] text-[#d4af37]">▼</span>';
        }
      } else {
        badge.className = 'hidden md:inline-block text-[11px] px-3 py-1 rounded-full bg-[#17121c]/90 text-[#c5a059] border border-[#c5a059]/30 tracking-wider';
        badge.title = '';
        badge.innerText = '🏛️ ' + scene.name;
      }
    }

    function updateTestModeUI() {
      updateSceneBadge();
      if (showSceneMenu) renderSceneMenuList();
      const homeBar = document.getElementById('test-mode-home-bar');
      if (homeBar) {
        if (isTestMode) homeBar.classList.remove('hidden');
        else homeBar.classList.add('hidden');
      }
      if (currentDataset && !document.getElementById('view-quiz').classList.contains('hidden')) {
        renderQuizProgress();
      }
    }

    function enterTestMode() {
      const wasActive = isTestMode;
      isTestMode = true;
      closeSecretInput();
      updateTestModeUI();
      if (!wasActive) {
        showMessage('✦ テストモードに切り替えました。');
      }
    }

    function exitTestMode() {
      isTestMode = false;
      testQuestionLimit = null;
      closeSceneMenu();
      const hadCustom = !!customVideo;
      clearCustomVideo();
      if (hadCustom && lastBgIndex >= 0) {
        applyBackgroundVideoUrl(darkAcademiaLibraryScenes[lastBgIndex].url);
      }
      closeSecretInput();
      keyBuffer = '';
      updateTestModeUI();
      showMessage('✦ テストモードを終了しました。');
    }

    function toggleSecretInput() {
      const wrap = document.getElementById('secret-input-wrap');
      const inp = document.getElementById('secret-input');
      if (!wrap || !inp) return;
      if (wrap.classList.contains('hidden')) {
        wrap.classList.remove('hidden');
        setTimeout(() => inp.focus(), 30);
      } else {
        closeSecretInput();
      }
    }

    function closeSecretInput() {
      const wrap = document.getElementById('secret-input-wrap');
      const inp = document.getElementById('secret-input');
      if (wrap) wrap.classList.add('hidden');
      if (inp) inp.value = '';
    }

    function handleSecretInput(val) {
      if (String(val || '').trim().toLowerCase() === 'test') {
        enterTestMode();
      }
    }

    function changeRandomLibraryBackground() {
      const bgVideo = document.getElementById('library-bg-video');
      if (!bgVideo) return;
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * darkAcademiaLibraryScenes.length);
      } while (nextIndex === lastBgIndex && darkAcademiaLibraryScenes.length > 1);
      lastBgIndex = nextIndex;
      if (!(isTestMode && customVideo)) {
        const scene = darkAcademiaLibraryScenes[nextIndex];
        applyBackgroundVideoUrl(scene.url);
      }
      updateSceneBadge();
      if (showSceneMenu) renderSceneMenuList();
    }

    document.addEventListener('mousedown', function(e) {
      if (!showSceneMenu) return;
      const container = document.getElementById('scene-menu-container');
      if (container && !container.contains(e.target)) {
        closeSceneMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isTestMode) {
        e.preventDefault();
        exitTestMode();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      let ch = '';
      if (/^Key[A-Z]$/.test(e.code)) ch = e.code.slice(3).toLowerCase();
      else if (e.key && e.key.length === 1) ch = e.key.toLowerCase();
      if (!ch) return;
      keyBuffer = (keyBuffer + ch).slice(-16);
      if (keyBuffer.endsWith('test')) {
        keyBuffer = '';
        enterTestMode();
      }
    }, true);

    function showMessage(msg) {
      const toast = document.getElementById('custom-toast');
      const toastMsg = document.getElementById('custom-toast-msg');
      toastMsg.innerText = msg;
      toast.classList.remove('hidden');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);
    }

    window.onload = function() {
      try {
        const params = new URLSearchParams(window.location.search);
        const saveParam = params.get('save');
        if (saveParam) {
          const imported = importReviewFromBase64Url(saveParam, quizDatasets);
          const merged = mergeReviewQuestions(reviewQuestions, imported);
          reviewQuestions = merged;
          saveStoredReviewQuestions(merged);
          params.delete('save');
          const nextQuery = params.toString();
          const nextUrl = window.location.pathname + (nextQuery ? '?' + nextQuery : '') + window.location.hash;
          window.history.replaceState({}, '', nextUrl);
          showMessage('✦ URLから復習データを引き継ぎました（合計 ' + merged.length + ' 問）。');
        }
      } catch (e) {
        showMessage('引継ぎURLの読み込みに失敗しました。');
      }
      renderHomeView();
    };

    function renderHomeView(folderId = null) {
      currentFolder = folderId;
      changeRandomLibraryBackground();
      document.getElementById('view-home').classList.remove('hidden');
      document.getElementById('view-quiz').classList.add('hidden');
      document.getElementById('view-result').classList.add('hidden');
      document.getElementById('view-transfer').classList.add('hidden');
      document.getElementById('home-btn-header').classList.add('hidden');

      const container = document.getElementById('file-list-container');
      container.innerHTML = '';

      const scrollNumbers = ['壱', '弐', '参', '肆', '伍', '陸'];

      if (currentFolder === 'practice_set_1_2') {
        const backBar = document.createElement('div');
        backBar.className = 'flex items-center justify-between mb-1';
        backBar.innerHTML = '<button onclick="renderHomeView(null)" class="px-4 py-2 rounded-xl border border-[#c5a059]/50 bg-[#1a151f] hover:bg-[#2a2133] text-[#d4af37] text-xs sm:text-sm font-bold transition shadow flex items-center space-x-2 cursor-pointer"><span>◀ ファイル一覧へ戻る</span></button><span class="text-xs text-[#c5a059] font-semibold tracking-wider">📁 演習問題集</span>';
        container.appendChild(backBar);

        const subDatasets = quizDatasets.filter(d => d.group === 'practice_set_1_2');
        subDatasets.forEach((dataset, index) => {
          const card = document.createElement('div');
          card.className = 'antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group';
          card.onclick = () => startQuiz(dataset.id);
          const scrollLabel = scrollNumbers[index] || (index + 1);
          card.innerHTML =
            '<div class="space-y-2">'
            + '<div class="flex items-center space-x-2.5">'
            + '<span class="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">御試みの書 ' + scrollLabel + '</span>'
            + '<span class="text-xs text-[#d4af37] font-bold tracking-wider">全 ' + dataset.questions.length + ' 問収録</span>'
            + '</div>'
            + '<h3 class="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">' + escapeHtml(dataset.title) + '</h3>'
            + '<p class="text-sm text-[#a69a8c] leading-relaxed">' + escapeHtml(dataset.description) + '</p>'
            + '</div>'
            + '<button class="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0"><span>試験へ挑む ▶</span></button>';
          container.appendChild(card);
        });
        return;
      }

      const transferCard = document.createElement('div');
      transferCard.className = 'antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group';
      transferCard.onclick = () => openTransferView();
      transferCard.innerHTML =
        '<div class="space-y-2">'
        + '<div class="flex items-center space-x-2.5">'
        + '<span class="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">御試みの書 壱</span>'
        + '<span class="text-xs text-[#d4af37] font-bold tracking-wider">Base64URL 形式対応</span>'
        + '</div>'
        + '<h3 class="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">データ引継ぎ</h3>'
        + '<p class="text-sm text-[#a69a8c] leading-relaxed">復習問題などの学習記録をBase64URLコードやURLで書き出し、別の端末やブラウザへ引き継ぎます。</p>'
        + '</div>'
        + '<button class="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0"><span>引継ぎを開く ▶</span></button>';
      container.appendChild(transferCard);

      const reviewCard = document.createElement('div');
      reviewCard.className = 'antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group';
      reviewCard.onclick = () => startQuiz(REVIEW_DATASET_ID);
      const hasReview = reviewQuestions.length > 0;
      reviewCard.innerHTML =
        '<div class="space-y-2">'
        + '<div class="flex items-center space-x-2.5">'
        + '<span class="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">御試みの書 弐</span>'
        + '<span class="text-xs text-[#d4af37] font-bold tracking-wider">全 ' + reviewQuestions.length + ' 問収録</span>'
        + '</div>'
        + '<h3 class="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">復習問題集</h3>'
        + '<p class="text-sm text-[#a69a8c] leading-relaxed">'
        + (hasReview
            ? 'これまでの試験や図問題で間違えた問題のみを収録した復習専用の書です。正解するとリストから外れます。'
            : 'これまで間違えた問題が自動的にここへ収録されます（現在は間違いがありません）。')
        + '</p>'
        + '</div>'
        + '<button class="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0' + (hasReview ? '' : ' opacity-50 cursor-not-allowed') + '"><span>' + (hasReview ? '復習へ挑む ▶' : '問題なし') + '</span></button>';
      container.appendChild(reviewCard);

      const groupedDatasets = quizDatasets.filter(d => d.group === 'practice_set_1_2');
      const totalGroupedQuestions = groupedDatasets.reduce((sum, d) => sum + d.questions.length, 0);

      const folderCard = document.createElement('div');
      folderCard.className = 'antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group';
      folderCard.onclick = () => {
        renderHomeView('practice_set_1_2');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      folderCard.innerHTML =
        '<div class="space-y-2">'
        + '<div class="flex items-center space-x-2.5">'
        + '<span class="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">御試みの書 参</span>'
        + '<span class="text-xs text-[#d4af37] font-bold tracking-wider">演習問題数：全 ' + totalGroupedQuestions + ' 問収録（' + groupedDatasets.length + '回分）</span>'
        + '</div>'
        + '<h3 class="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">演習問題集</h3>'
        + '<p class="text-sm text-[#a69a8c] leading-relaxed">選択問題や入力問題などをまとめた演習問題集です。</p>'
        + '</div>'
        + '<button class="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0"><span>問題集を開く ▶</span></button>';
      container.appendChild(folderCard);

      const standaloneDatasets = quizDatasets.filter(d => !d.group);
      standaloneDatasets.forEach((dataset, idx) => {
        const card = document.createElement('div');
        card.className = 'antique-card rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cursor-pointer hover:border-[#ffd700] transition duration-300 group';
        card.onclick = () => startQuiz(dataset.id);
        const scrollLabel = scrollNumbers[idx + 3] || (idx + 4);
        card.innerHTML =
          '<div class="space-y-2">'
          + '<div class="flex items-center space-x-2.5">'
          + '<span class="text-xs px-2.5 py-0.5 rounded bg-[#3a1c24] text-[#f3e5ab] border border-[#c5a059]/60 font-semibold tracking-wider">御試みの書 ' + scrollLabel + '</span>'
          + '<span class="text-xs text-[#d4af37] font-bold tracking-wider">全 ' + dataset.questions.length + ' 問収録' + escapeHtml(dataset.countSuffix || '') + '</span>'
          + '</div>'
          + '<h3 class="classic-title text-xl sm:text-2xl font-bold text-[#f3e5ab] group-hover:text-[#ffd700] transition">' + escapeHtml(dataset.title) + '</h3>'
          + '<p class="text-sm text-[#a69a8c] leading-relaxed">' + escapeHtml(dataset.description) + '</p>'
          + '</div>'
          + '<button class="antique-btn px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center space-x-2 shrink-0"><span>試験へ挑む ▶</span></button>';
        container.appendChild(card);
      });
    }

    function startQuizWithDataset(dataset) {
      currentDataset = dataset;
      currentIndex = 0;
      testQuestionLimit = null;
      userAnswers = new Array(currentDataset.questions.length).fill(null);
      isAnswered = false;
      changeRandomLibraryBackground();
      document.getElementById('view-home').classList.add('hidden');
      document.getElementById('view-result').classList.add('hidden');
      document.getElementById('view-transfer').classList.add('hidden');
      document.getElementById('view-quiz').classList.remove('hidden');
      document.getElementById('home-btn-header').classList.remove('hidden');
      document.getElementById('quiz-file-title').innerText = currentDataset.title;
      updateTestModeUI();
      loadQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function isReviewSessionDataset(ds) {
      return Boolean(ds && (ds.id === REVIEW_DATASET_ID || ds.isReview));
    }

    function startQuiz(datasetId) {
      if (datasetId === REVIEW_DATASET_ID) {
        if (reviewQuestions.length === 0) {
          showMessage('まだ間違えた問題はありません。');
          return;
        }
        startQuizWithDataset({
          id: REVIEW_DATASET_ID,
          isReview: true,
          title: '復習問題集',
          description: 'これまで間違えた問題のみを収録した復習専用の書です。正解するとリストから外れます。',
          questions: reviewQuestions.slice()
        });
        return;
      }
      const found = quizDatasets.find(d => d.id === datasetId);
      if (!found) return;
      startQuizWithDataset(found);
    }

    function renderQuizProgress() {
      const progressEl = document.getElementById('quiz-progress-text');
      if (!progressEl || !currentDataset) return;
      const total = getEffectiveTotal();
      if (isTestMode) {
        progressEl.className = 'bg-[#2a1c30] px-3.5 py-1 rounded-full font-bold text-xs sm:text-sm text-[#f3e5ab] border border-[#d4af37] shadow-inner inline-flex items-center gap-1.5';
        progressEl.innerHTML =
          '<span>第</span>'
          + '<input id="test-jump-input" type="number" min="1" max="' + total + '" value="' + (currentIndex + 1) + '" class="w-12 text-center bg-[#120e16] border border-[#c5a059]/70 rounded-md px-1 py-0.5 text-[#ffd700] font-bold focus:outline-none focus:border-[#ffd700]" />'
          + '<span>問 / 全</span>'
          + '<input id="test-total-input" type="number" min="1" max="' + currentDataset.questions.length + '" value="' + total + '" class="w-12 text-center bg-[#120e16] border border-[#c5a059]/70 rounded-md px-1 py-0.5 text-[#ffd700] font-bold focus:outline-none focus:border-[#ffd700]" />'
          + '<span>問</span>';
        const jumpInp = document.getElementById('test-jump-input');
        const totalInp = document.getElementById('test-total-input');
        if (jumpInp) {
          jumpInp.oninput = function() {
            if (jumpTimer) clearTimeout(jumpTimer);
            const val = parseInt(this.value, 10);
            const eff = getEffectiveTotal();
            if (!isNaN(val) && val >= 1 && val <= eff) {
              jumpTimer = setTimeout(() => {
                if (val - 1 !== currentIndex) {
                  currentIndex = val - 1;
                  changeRandomLibraryBackground();
                  loadQuestion();
                }
              }, 280);
            }
          };
          jumpInp.onblur = function() {
            if (jumpTimer) clearTimeout(jumpTimer);
            const eff = getEffectiveTotal();
            const val = parseInt(this.value, 10);
            const clamped = isNaN(val) ? currentIndex + 1 : Math.max(1, Math.min(val, eff));
            this.value = clamped;
            if (clamped - 1 !== currentIndex) {
              currentIndex = clamped - 1;
              changeRandomLibraryBackground();
              loadQuestion();
            }
          };
          jumpInp.onkeydown = function(e) {
            if (e.key === 'Enter') { e.preventDefault(); this.blur(); }
          };
        }
        if (totalInp) {
          totalInp.oninput = function() {
            if (totalTimer) clearTimeout(totalTimer);
            const val = parseInt(this.value, 10);
            const max = currentDataset.questions.length;
            if (!isNaN(val) && val >= 1 && val <= max) {
              totalTimer = setTimeout(() => {
                testQuestionLimit = val;
                if (currentIndex >= val) {
                  currentIndex = val - 1;
                  changeRandomLibraryBackground();
                  loadQuestion();
                } else {
                  document.getElementById('next-btn-text').innerText = (currentIndex >= val - 1) ? '✦ 最終結果へ ✦' : '次へ ▶';
                }
              }, 280);
            }
          };
          totalInp.onblur = function() {
            if (totalTimer) clearTimeout(totalTimer);
            const max = currentDataset.questions.length;
            const val = parseInt(this.value, 10);
            const clamped = isNaN(val) ? getEffectiveTotal() : Math.max(1, Math.min(val, max));
            testQuestionLimit = clamped;
            this.value = clamped;
            if (currentIndex >= clamped) {
              currentIndex = clamped - 1;
              changeRandomLibraryBackground();
            }
            loadQuestion();
          };
          totalInp.onkeydown = function(e) {
            if (e.key === 'Enter') { e.preventDefault(); this.blur(); }
          };
        }
      } else {
        progressEl.className = 'bg-[#2a1c30] px-4 py-1 rounded-full font-bold text-xs sm:text-sm text-[#f3e5ab] border border-[#c5a059]/60 shadow-inner';
        progressEl.innerText = '第 ' + (currentIndex + 1) + ' 問 / 全 ' + total + ' 問';
      }
      document.getElementById('next-btn-text').innerText = (currentIndex >= total - 1) ? '✦ 最終結果へ ✦' : '次へ ▶';
    }

    function loadQuestion() {
      const q = currentDataset.questions[currentIndex];
      const savedAnswer = userAnswers[currentIndex];
      isAnswered = (savedAnswer !== null);

      renderQuizProgress();
      document.getElementById('current-q-badge').innerHTML = '<span>❖ 問題 ' + (currentIndex + 1) + '</span>';
      document.getElementById('question-text').innerText = q.question;

      const diagramContainer = document.getElementById('question-diagram-container');
      if (q.diagram && diagramSvgs[q.diagram]) {
        diagramContainer.innerHTML = diagramSvgs[q.diagram];
        diagramContainer.classList.remove('hidden');
      } else {
        diagramContainer.innerHTML = '';
        diagramContainer.classList.add('hidden');
      }

      const optionsContainer = document.getElementById('options-container');
      optionsContainer.innerHTML = '';

      if (q.type === 'multi_fill') {
        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-3';
        const inputs = [];
        q.blanks.forEach((blank, bIdx) => {
          const row = document.createElement('div');
          row.className = 'flex items-center gap-3';
          const badge = document.createElement('span');
          badge.className = 'w-9 h-9 rounded-lg bg-[#261829] border border-[#c5a059]/60 text-[#f3e5ab] font-bold flex items-center justify-center shrink-0 text-sm';
          badge.innerText = blank.label;

          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = blank.placeholder || (blank.label + 'に入る用語を入力');
          input.autocomplete = 'off';
          input.className = 'flex-grow px-4 py-3 rounded-xl bg-[#120e16] border border-[#c5a059]/60 text-[#f5efe6] placeholder-[#7d7267] focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#d4af37]/30 text-base font-bold tracking-wide';

          if (isAnswered && Array.isArray(savedAnswer)) {
            const userVal = savedAnswer[bIdx] || '';
            input.value = userVal;
            input.disabled = true;
            const blankOk = isSingleBlankCorrect(userVal, blank);
            input.className += blankOk
              ? ' border-2 border-emerald-500 bg-emerald-950/50 text-emerald-200'
              : ' border-2 border-rose-500 bg-rose-950/50 text-rose-200';
          }
          inputs.push(input);
          row.appendChild(badge);
          row.appendChild(input);
          wrapper.appendChild(row);
        });

        if (!isAnswered) {
          const submitBtn = document.createElement('button');
          submitBtn.type = 'button';
          submitBtn.className = 'antique-btn w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base mt-2';
          submitBtn.innerText = '✦ 解答する';
          const handleMultiSubmit = () => {
            const vals = inputs.map(inp => inp.value.trim());
            const emptyIdx = vals.findIndex(v => !v);
            if (emptyIdx !== -1) {
              showMessage(q.blanks[emptyIdx].label + ' の空欄に用語を入力してください。');
              inputs[emptyIdx].focus();
              return;
            }
            selectOption(vals);
          };
          submitBtn.onclick = handleMultiSubmit;
          inputs.forEach((inp, idx) => {
            inp.onkeydown = (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (idx < inputs.length - 1) inputs[idx + 1].focus();
                else handleMultiSubmit();
              }
            };
          });
          wrapper.appendChild(submitBtn);
          setTimeout(() => inputs[0] && inputs[0].focus(), 50);
        }
        optionsContainer.appendChild(wrapper);
      } else if (q.type === 'fill') {
        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-4';
        const inputRow = document.createElement('div');
        inputRow.className = 'flex flex-col sm:flex-row gap-3';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = q.placeholder || '用語を入力してください';
        input.autocomplete = 'off';
        input.className = 'flex-grow px-4 py-3.5 rounded-xl bg-[#120e16] border border-[#c5a059]/60 text-[#f5efe6] placeholder-[#7d7267] focus:outline-none focus:border-[#ffd700] focus:ring-2 focus:ring-[#d4af37]/30 text-base sm:text-lg font-bold tracking-wide';

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'antique-btn px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap shrink-0';
        submitBtn.innerText = '✦ 解答する';

        if (isAnswered) {
          input.value = savedAnswer;
          input.disabled = true;
          submitBtn.disabled = true;
          submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
          const correct = isQuestionCorrect(savedAnswer, q);
          input.className += correct
            ? ' border-2 border-emerald-500 bg-emerald-950/50 text-emerald-200'
            : ' border-2 border-rose-500 bg-rose-950/50 text-rose-200';
        } else {
          const handleFillSubmit = () => {
            const val = input.value.trim();
            if (!val) {
              showMessage('空欄に用語を入力してください。');
              input.focus();
              return;
            }
            selectOption(val);
          };
          submitBtn.onclick = handleFillSubmit;
          input.onkeydown = (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleFillSubmit();
            }
          };
        }
        inputRow.appendChild(input);
        inputRow.appendChild(submitBtn);
        wrapper.appendChild(inputRow);
        optionsContainer.appendChild(wrapper);
        if (!isAnswered) setTimeout(() => input.focus(), 50);
      } else {
        q.options.forEach((opt, idx) => {
          const btn = document.createElement('button');
          btn.className = 'antique-option w-full text-left p-4 rounded-xl font-medium flex items-center justify-between transition';
          const iconText = String.fromCharCode(9312 + idx);
          btn.innerHTML = '<span class="flex items-start space-x-3"><span class="font-bold text-[#d4af37] text-lg leading-snug">' + iconText + '</span><span class="leading-snug">' + escapeHtml(opt) + '</span></span>';

          if (isAnswered) {
            btn.disabled = true;
            if (opt === q.correctAnswer) {
              btn.className = 'w-full text-left p-4 rounded-xl font-bold flex items-center justify-between border-2 border-emerald-500/80 bg-emerald-950/70 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
              btn.innerHTML += '<span class="text-xs px-2 py-0.5 rounded bg-emerald-800/80 text-emerald-100 ml-2 shrink-0">正解</span>';
            } else if (savedAnswer === opt && opt !== q.correctAnswer) {
              btn.className = 'w-full text-left p-4 rounded-xl font-bold flex items-center justify-between border-2 border-rose-500/80 bg-rose-950/70 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
              btn.innerHTML += '<span class="text-xs px-2 py-0.5 rounded bg-rose-800/80 text-rose-100 ml-2 shrink-0">あなたの選択</span>';
            } else {
              btn.className += ' opacity-45';
            }
          } else {
            btn.onclick = () => selectOption(opt);
          }
          optionsContainer.appendChild(btn);
        });
      }

      const expBox = document.getElementById('explanation-box');
      if (isAnswered) {
        showExplanationUI(savedAnswer, q);
      } else {
        expBox.classList.add('hidden');
      }

      const total = getEffectiveTotal();
      const prevBtn = document.getElementById('prev-btn');
      prevBtn.disabled = (currentIndex === 0);
      prevBtn.style.opacity = (currentIndex === 0) ? '0.4' : '1';
      prevBtn.style.cursor = (currentIndex === 0) ? 'not-allowed' : 'pointer';

      const nextBtnText = document.getElementById('next-btn-text');
      nextBtnText.innerText = (currentIndex >= total - 1) ? '✦ 最終結果へ ✦' : '次へ ▶';
    }

    function normalizeAnswer(str) {
      return String(str || '')
        .trim()
        .replace(/[Ａ-Ｚａ-ｚ０-９－]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        .replace(/[‐‑‒–—―ー]/g, '-')
        .replace(/\\s+/g, '')
        .toLowerCase();
    }

    function isSingleBlankCorrect(userVal, blank) {
      const normUser = normalizeAnswer(userVal);
      const list = blank.acceptedAnswers || [blank.correctAnswer];
      return list.some(ans => normalizeAnswer(ans) === normUser);
    }

    function isQuestionCorrect(userAns, q) {
      if (userAns === null || userAns === undefined) return false;
      if (q.type === 'multi_fill') {
        if (!Array.isArray(userAns)) return false;
        return q.blanks.every((blank, idx) => isSingleBlankCorrect(userAns[idx], blank));
      }
      if (q.type === 'fill') {
        const normUser = normalizeAnswer(userAns);
        const list = q.acceptedAnswers || [q.correctAnswer];
        return list.some(ans => normalizeAnswer(ans) === normUser);
      }
      return userAns === q.correctAnswer;
    }

    function selectOption(selectedOpt) {
      if (isAnswered) return;
      userAnswers[currentIndex] = selectedOpt;
      isAnswered = true;
      const q = currentDataset.questions[currentIndex];
      const correct = isQuestionCorrect(selectedOpt, q);
      const key = getQuestionKey(q);
      if (!correct) {
        if (!reviewQuestions.some(item => getQuestionKey(item) === key)) {
          reviewQuestions.push(q);
          saveStoredReviewQuestions(reviewQuestions);
        }
      } else if (isReviewSessionDataset(currentDataset)) {
        const nextList = reviewQuestions.filter(item => getQuestionKey(item) !== key);
        if (nextList.length !== reviewQuestions.length) {
          reviewQuestions = nextList;
          saveStoredReviewQuestions(reviewQuestions);
        }
      }
      loadQuestion();
    }

    function showExplanationUI(selectedOpt, q) {
      const expBox = document.getElementById('explanation-box');
      const expHeader = document.getElementById('explanation-header');
      const expText = document.getElementById('explanation-text');
      expBox.classList.remove('hidden');
      const isCorrect = isQuestionCorrect(selectedOpt, q);
      const displayCorrectAnswer = q.type === 'multi_fill'
        ? q.blanks.map(b => b.label + '：' + b.correctAnswer).join(' ／ ')
        : q.correctAnswer;

      if (isCorrect) {
        expBox.className = 'mt-6 p-5 rounded-xl border-l-4 border-emerald-500 bg-[#0f241d] text-emerald-100 shadow-inner animate-fadeIn';
        expHeader.innerHTML = '<svg class="w-6 h-6 text-emerald-400 shrink-0" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span class="text-lg text-emerald-300">見事、正解です！（正解：<strong class="text-[#f3e5ab]">' + escapeHtml(displayCorrectAnswer) + '</strong>）</span>';
      } else {
        expBox.className = 'mt-6 p-5 rounded-xl border-l-4 border-rose-500 bg-[#261117] text-rose-100 shadow-inner animate-fadeIn';
        expHeader.innerHTML = '<svg class="w-6 h-6 text-rose-400 shrink-0" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span class="text-lg text-rose-300">惜しくも不正解（正解：<strong class="underline text-[#f3e5ab]">' + escapeHtml(displayCorrectAnswer) + '</strong>）</span>';
      }

      const pointHtml = q.point
        ? '<div class="mt-3 p-3.5 rounded-lg bg-[#1a141e]/90 border border-[#c5a059]/50 text-[#f3e5ab]"><span class="text-xs tracking-wider text-[#ffd700] font-bold block mb-1">💡 覚えるポイント</span><span class="font-semibold">' + escapeHtml(q.point) + '</span></div>'
        : '';

      expText.innerHTML = '<div class="mt-2 pt-2 border-t border-white/10 text-[#e6dfd3]"><span class="text-xs uppercase tracking-wider text-[#d4af37] font-bold block mb-1">✦ 解説</span><p>' + escapeHtml(q.explanation) + '</p>' + pointHtml + '</div>';
    }

    function nextQuestion() {
      const total = getEffectiveTotal();
      const q = currentDataset.questions[currentIndex];
      if (!isAnswered && userAnswers[currentIndex] === null) {
        showMessage((q.type === 'fill' || q.type === 'multi_fill')
          ? '空欄に用語を入力して「解答する」を押してください。'
          : 'いずれかの選択肢を1つお選びください。');
        return;
      }
      if (currentIndex < total - 1) {
        currentIndex++;
        changeRandomLibraryBackground();
        loadQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showResult();
      }
    }

    function prevQuestion() {
      if (currentIndex > 0) {
        currentIndex--;
        changeRandomLibraryBackground();
        loadQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function showResult() {
      changeRandomLibraryBackground();
      document.getElementById('view-quiz').classList.add('hidden');
      document.getElementById('view-transfer').classList.add('hidden');
      document.getElementById('view-result').classList.remove('hidden');
      let correctCount = 0;
      const incorrectList = [];
      const total = getEffectiveTotal();
      currentDataset.questions.slice(0, total).forEach((q, idx) => {
        if (isQuestionCorrect(userAnswers[idx], q)) correctCount++;
        else incorrectList.push(q);
      });
      const incorrectCount = incorrectList.length;
      const percentage = Math.round((correctCount / total) * 100);
      document.getElementById('result-file-subtitle').innerText = '対象試験： ' + currentDataset.title;
      const resultHomeText = document.getElementById('result-home-btn-text');
      if (resultHomeText) {
        resultHomeText.innerText = isReviewSessionDataset(currentDataset)
          ? '🗝️ セーブしてホームに戻る'
          : '🗝️ ホームに戻る';
      }
      document.getElementById('stat-correct').innerText = correctCount + ' 回';
      document.getElementById('stat-incorrect').innerText = incorrectCount + ' 回';
      document.getElementById('stat-percentage').innerText = percentage + '%';
      const retryIncorrectBtn = document.getElementById('retry-incorrect-btn');
      const retryIncorrectText = document.getElementById('retry-incorrect-text');
      if (retryIncorrectBtn && retryIncorrectText) {
        if (incorrectCount > 0) {
          retryIncorrectBtn.classList.remove('hidden');
          retryIncorrectText.innerText = '🔄 間違えた問題だけをやり直す（' + incorrectCount + '問）';
        } else {
          retryIncorrectBtn.classList.add('hidden');
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function retryIncorrectOnly() {
      if (!currentDataset) return;
      const total = getEffectiveTotal();
      const incorrectList = currentDataset.questions.slice(0, total).filter((q, idx) => !isQuestionCorrect(userAnswers[idx], q));
      if (incorrectList.length === 0) return;
      const isReview = isReviewSessionDataset(currentDataset);
      const title = currentDataset.title.endsWith('（間違えた問題）')
        ? currentDataset.title
        : currentDataset.title + '（間違えた問題）';
      startQuizWithDataset({
        id: 'retry_incorrect_' + Date.now(),
        isReview: isReview,
        title: title,
        description: currentDataset.title + ' で間違えた ' + incorrectList.length + ' 問の復習用セットです。',
        questions: incorrectList
      });
    }

    function retryQuiz() {
      if (!currentDataset) return;
      if (currentDataset.id === REVIEW_DATASET_ID) {
        startQuiz(REVIEW_DATASET_ID);
        return;
      }
      startQuizWithDataset(currentDataset);
    }

    function handleResultHomeClick() {
      if (isReviewSessionDataset(currentDataset)) {
        const total = getEffectiveTotal();
        const answeredCorrectKeys = new Set();
        const answeredWrong = [];
        currentDataset.questions.slice(0, total).forEach((q, idx) => {
          const ans = userAnswers[idx];
          if (ans === null || ans === undefined) return;
          if (isQuestionCorrect(ans, q)) {
            answeredCorrectKeys.add(getQuestionKey(q));
          } else {
            answeredWrong.push(q);
          }
        });
        let updated = reviewQuestions.filter(item => !answeredCorrectKeys.has(getQuestionKey(item)));
        const existingKeys = new Set(updated.map(getQuestionKey));
        for (let i = 0; i < answeredWrong.length; i++) {
          const wq = answeredWrong[i];
          const wk = getQuestionKey(wq);
          if (!existingKeys.has(wk)) {
            existingKeys.add(wk);
            updated.push(wq);
          }
        }
        reviewQuestions = updated;
        saveStoredReviewQuestions(reviewQuestions);
        showMessage('✦ 復習データをセーブしました。');
      }
      goToHome();
    }

    function goToHome() {
      renderHomeView(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  </script>
</body>
</html>`;
}

export function downloadStandaloneBackupHtml(datasets: QuizDataset[]): string {
  const html = generateStandaloneBackupHtml(datasets);
  const totalQuestions = datasets.reduce(
    (sum, d) => sum + d.questions.length,
    0
  );
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const filename = `Daia_3次元CAD対策_バックアップ_全${totalQuestions}問_${yyyy}${mm}${dd}.html`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);

  return filename;
}
