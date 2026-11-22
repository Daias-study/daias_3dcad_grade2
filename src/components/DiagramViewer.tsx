import type { DiagramId } from '../types/quiz';

interface DiagramViewerProps {
  diagramId: DiagramId;
}

export function DiagramViewer({ diagramId }: DiagramViewerProps) {
  switch (diagramId) {
    case 'fig1':
      return (
        <svg viewBox="0 0 760 560" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="552" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="45" y="38" fontSize="15" fontWeight="bold" fill="#0f172a">【初期スケッチ】</text>
          <text x="35" y="68" fontSize="12" fill="#1e293b">プロファイル1</text>
          <text x="38" y="84" fontSize="12" fill="#1e293b">(中心軸)</text>
          <line x1="115" y1="55" x2="115" y2="175" stroke="#0f172a" strokeWidth="2" strokeDasharray="10,4,2,4" />
          <line x1="115" y1="65" x2="180" y2="65" stroke="#0f172a" strokeWidth="2" />
          <line x1="180" y1="65" x2="168" y2="160" stroke="#0f172a" strokeWidth="2" />
          <line x1="168" y1="160" x2="115" y2="160" stroke="#0f172a" strokeWidth="2" />
          <text x="188" y="75" fontSize="12" fill="#1e293b">プロファイル2</text>
          <text x="190" y="91" fontSize="12" fill="#1e293b">(断面線)</text>
          <path d="M 178 82 C 232 82, 232 145, 170 145" fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
          <text x="218" y="114" fontSize="12" fill="#1e293b">プロファイル3</text>
          <text x="220" y="130" fontSize="12" fill="#1e293b">(曲線)</text>
          <path d="M 135 182 L 135 215" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(65, 222)">
            <path d="M 10 15 L 130 15 L 112 105 L 28 105 Z" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="70" cy="15" rx="60" ry="11" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <path d="M 28 105 A 42 8 0 0 0 112 105" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
          </g>
          <rect x="42" y="340" width="185" height="54" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
          <text x="50" y="358" fontSize="12" fill="#0f172a">①プロファイル1を軸に</text>
          <text x="50" y="374" fontSize="12" fill="#0f172a">
            プロファイル2を<tspan fontWeight="bold" fill="#b91c1c">（問1）</tspan>
          </text>
          <text x="50" y="390" fontSize="12" fill="#0f172a">してソリッド1を作成。</text>
          <path d="M 135 400 L 135 426" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(65, 430)">
            <path d="M 10 15 L 130 15 L 112 95 L 28 95 Z" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="70" cy="15" rx="60" ry="11" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="70" cy="15" rx="50" ry="8" fill="#e4e4e7" stroke="#18181b" strokeWidth="1.5" />
            <path d="M 28 95 A 42 8 0 0 0 112 95" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
          </g>
          <rect x="35" y="502" width="205" height="42" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
          <text x="45" y="520" fontSize="12" fill="#0f172a">②ソリッド1の上面を指定し</text>
          <text x="45" y="536" fontSize="12" fill="#0f172a">
            <tspan fontWeight="bold" fill="#b91c1c">（問2）</tspan>を行い中空にする。
          </text>
          <path d="M 255 510 L 385 510" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(425, 415)">
            <path d="M 125 25 C 185 25, 185 88, 114 88 L 112 78 C 170 78, 170 35, 123 35 Z" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <path d="M 10 15 L 130 15 L 112 95 L 28 95 Z" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="70" cy="15" rx="60" ry="11" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="70" cy="15" rx="50" ry="8" fill="#e4e4e7" stroke="#18181b" strokeWidth="1.5" />
            <path d="M 28 95 A 42 8 0 0 0 112 95" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
          </g>
          <rect x="405" y="495" width="235" height="52" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
          <text x="415" y="512" fontSize="12" fill="#0f172a">③プロファイル3に沿って円を</text>
          <text x="415" y="527" fontSize="12" fill="#0f172a">
            <tspan fontWeight="bold" fill="#b91c1c">（問3）</tspan>し取っ手を作成。
          </text>
          <text x="415" y="542" fontSize="12" fill="#0f172a">本体と和のブーリアン演算を行う。</text>
          <path d="M 515 405 L 515 355" stroke="#64748b" strokeWidth="3" />
          <rect x="415" y="315" width="195" height="30" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
          <text x="428" y="335" fontSize="12" fill="#0f172a">
            ④最後に<tspan fontWeight="bold" fill="#b91c1c">（問4）</tspan>を行う。
          </text>
          <path d="M 515 305 L 515 255" stroke="#64748b" strokeWidth="3" />
          <text x="445" y="45" fontSize="16" fontWeight="bold" fill="#0f172a">モデル B（完成）</text>
          <g transform="translate(425, 85)">
            <path d="M 124 26 C 186 26, 186 92, 113 92 L 111 81 C 171 81, 171 36, 122 36 Z" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <path d="M 10 15 Q 10 10, 18 10 L 122 10 Q 130 10, 130 15 L 112 98 Q 110 105, 102 105 L 38 105 Q 30 105, 28 98 Z" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="70" cy="14" rx="59" ry="11" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="70" cy="14" rx="49" ry="8" fill="#e4e4e7" stroke="#18181b" strokeWidth="1.5" />
            <path d="M 29 98 A 41 8 0 0 0 111 98" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
          </g>
          <text x="355" y="78" fontSize="12" fill="#0f172a">稜線1(口元)</text>
          <line x1="422" y1="75" x2="465" y2="92" stroke="#0f172a" strokeWidth="1.5" />
          <text x="615" y="88" fontSize="12" fill="#0f172a">稜線2(取っ手根元)</text>
          <line x1="610" y1="88" x2="555" y2="112" stroke="#0f172a" strokeWidth="1.5" />
          <text x="580" y="215" fontSize="12" fill="#0f172a">稜線3(底面外周)</text>
          <line x1="575" y1="210" x2="532" y2="195" stroke="#0f172a" strokeWidth="1.5" />
        </svg>
      );
    case 'fig2':
      return (
        <svg viewBox="0 0 760 560" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="552" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <rect x="42" y="20" width="215" height="44" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
          <text x="52" y="38" fontSize="12" fill="#0f172a">①プロファイル1（L字型）を</text>
          <text x="52" y="54" fontSize="12" fill="#0f172a">
            <tspan fontWeight="bold" fill="#b91c1c">（問5）</tspan>してソリッド1を作成。
          </text>
          <g transform="translate(65, 78)">
            <polygon points="0,35 35,15 80,15 45,35" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <polygon points="45,35 80,15 80,115 45,135" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <polygon points="45,115 80,95 165,95 130,115" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <polygon points="130,115 165,95 165,120 130,140" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <polygon points="0,35 45,35 45,115 130,115 130,140 0,140" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
          </g>
          <path d="M 145 235 L 145 290" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(65, 305)">
            <polygon points="0,35 35,15 80,15 45,35" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <polygon points="45,35 80,15 80,115 45,135" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <polygon points="45,115 80,95 165,95 130,115" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <polygon points="130,115 165,95 165,120 130,140" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <polygon points="0,35 45,35 45,115 130,115 130,140 0,140" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <polygon points="62,48 62,105 118,105" fill="#52525b" stroke="#18181b" strokeWidth="1.8" />
          </g>
          <rect x="40" y="485" width="225" height="44" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
          <text x="50" y="503" fontSize="12" fill="#0f172a">②中央にプロファイル2（斜線）を描き</text>
          <text x="50" y="519" fontSize="12" fill="#0f172a">
            <tspan fontWeight="bold" fill="#b91c1c">（問6）</tspan>機能で補強板を作成。
          </text>
          <path d="M 285 415 L 385 415" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(410, 305)">
            <polygon points="0,35 35,15 80,15 45,35" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <polygon points="45,35 80,15 80,115 45,135" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <polygon points="45,115 80,95 165,95 130,115" fill="#d4d4d8" stroke="#18181b" strokeWidth="2" />
            <polygon points="130,115 165,95 165,120 130,140" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <polygon points="0,35 45,35 45,115 130,115 130,140 0,140" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <polygon points="62,48 62,105 118,105" fill="#52525b" stroke="#18181b" strokeWidth="1.8" />
            <ellipse cx="122" cy="105" rx="13" ry="6" fill="#3f3f46" stroke="#18181b" strokeWidth="1.8" />
          </g>
          <rect x="405" y="485" width="235" height="44" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
          <text x="415" y="503" fontSize="12" fill="#0f172a">③円柱ソリッドを作成し、本体から</text>
          <text x="415" y="519" fontSize="12" fill="#0f172a">
            <tspan fontWeight="bold" fill="#b91c1c">（問7）</tspan>のブーリアン演算で穴をあける。
          </text>
          <path d="M 495 295 L 495 245" stroke="#64748b" strokeWidth="3" />
          <rect x="405" y="195" width="195" height="42" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
          <text x="415" y="213" fontSize="12" fill="#0f172a">④背面を対称面として全体を</text>
          <text x="415" y="229" fontSize="12" fill="#0f172a">
            <tspan fontWeight="bold" fill="#b91c1c">（問8）</tspan>してモデルCを完成させる。
          </text>
          <text x="425" y="45" fontSize="16" fontWeight="bold" fill="#0f172a">モデル C（左右対称の完成形）</text>
          <g transform="translate(425, 75)">
            <rect x="45" y="0" width="32" height="65" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <rect x="0" y="65" width="122" height="22" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <polygon points="45,20 45,65 12,65" fill="#52525b" stroke="#18181b" strokeWidth="2" />
            <polygon points="77,20 77,65 110,65" fill="#52525b" stroke="#18181b" strokeWidth="2" />
          </g>
        </svg>
      );
    case 'fig3':
      return (
        <svg viewBox="0 0 760 440" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="432" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="35" y="36" fontSize="15" fontWeight="bold" fill="#0f172a">【練習問題3】異形ダクト（トランジション管）のモデリング手順</text>
          <g transform="translate(45, 70)">
            <rect x="10" y="95" width="100" height="55" fill="none" stroke="#1d4ed8" strokeWidth="2" />
            <ellipse cx="60" cy="25" rx="32" ry="14" fill="none" stroke="#1d4ed8" strokeWidth="2" />
            <line x1="60" y1="25" x2="60" y2="122" stroke="#64748b" strokeDasharray="4,4" />
            <text x="0" y="170" fontSize="12">①平行な2平面に円と四角形を描き</text>
            <text x="0" y="186" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問9）</tspan>機能で滑らかにつなぐ。
            </text>
          </g>
          <path d="M 215 140 L 265 140" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(285, 70)">
            <polygon points="15,95 105,95 88,28 32,28" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="60" cy="28" rx="28" ry="10" fill="#e4e4e7" stroke="#18181b" strokeWidth="2" />
            <text x="-10" y="170" fontSize="12">②上下の端面を指定して</text>
            <text x="-10" y="186" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問10）</tspan>を行い中空ダクトにする。
            </text>
          </g>
          <path d="M 455 140 L 505 140" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(525, 65)">
            <rect x="0" y="95" width="130" height="22" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <polygon points="20,95 110,95 93,28 37,28" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="65" cy="28" rx="28" ry="10" fill="#e4e4e7" stroke="#18181b" strokeWidth="2" />
            <circle cx="15" cy="106" r="4" fill="#18181b" />
            <circle cx="115" cy="106" r="4" fill="#18181b" />
            <text x="-25" y="175" fontSize="12">
              ③底面にフランジを<tspan fontWeight="bold" fill="#b91c1c">（問11）</tspan>で追加し、
            </text>
            <text x="-25" y="191" fontSize="12">
              ④四隅のボルト穴を<tspan fontWeight="bold" fill="#b91c1c">（問12）</tspan>で配置。
            </text>
          </g>
          <text x="45" y="340" fontSize="13" fill="#334155">※異なる断面形状（円と長方形）を連続的に変化させて立体化する操作と、規則的な穴配置を問う問題です。</text>
        </svg>
      );
    case 'fig4':
      return (
        <svg viewBox="0 0 760 440" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="432" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="35" y="36" fontSize="15" fontWeight="bold" fill="#0f172a">【練習問題4】樹脂ケース（抜き勾配付き筐体）のモデリング手順</text>
          <g transform="translate(45, 75)">
            <rect x="15" y="25" width="110" height="85" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <text x="0" y="155" fontSize="12">①長方形スケッチを押し出し、</text>
            <text x="0" y="171" fontSize="12">
              側面へ金型離型用の<tspan fontWeight="bold" fill="#b91c1c">（問13）</tspan>を付与。
            </text>
          </g>
          <path d="M 225 130 L 275 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(295, 75)">
            <polygon points="10,25 120,25 110,110 20,110" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <polygon points="22,35 108,35 100,100 30,100" fill="#e4e4e7" stroke="#18181b" strokeWidth="1.5" />
            <text x="-10" y="155" fontSize="12">②上面を開口面として指定し、</text>
            <text x="-10" y="171" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問14）</tspan>機能で均一肉厚にする。
            </text>
          </g>
          <path d="M 465 130 L 515 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(535, 75)">
            <polygon points="10,25 120,25 110,110 20,110" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <circle cx="45" cy="65" r="10" fill="#71717a" stroke="#18181b" strokeWidth="1.5" />
            <circle cx="85" cy="65" r="10" fill="#71717a" stroke="#18181b" strokeWidth="1.5" />
            <text x="-15" y="155" fontSize="12">
              ③底面にねじ止め用<tspan fontWeight="bold" fill="#b91c1c">（問15）</tspan>を立て、
            </text>
            <text x="-15" y="171" fontSize="12">
              ④外周角部に丸み<tspan fontWeight="bold" fill="#b91c1c">（問16）</tspan>を付ける。
            </text>
          </g>
          <text x="45" y="335" fontSize="13" fill="#334155">※射出成形部品で必須となる「抜き勾配」や、円筒状の突起（ボス）の作成手順を確認します。</text>
        </svg>
      );
    case 'fig5':
      return (
        <svg viewBox="0 0 760 440" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="432" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="35" y="36" fontSize="15" fontWeight="bold" fill="#0f172a">【練習問題5】フランジ継手（円形ボルト穴）のモデリング手順</text>
          <g transform="translate(45, 70)">
            <line x1="65" y1="10" x2="65" y2="125" stroke="#0f172a" strokeDasharray="8,3,2,3" strokeWidth="1.8" />
            <polygon points="65,20 95,20 95,85 125,85 125,110 65,110" fill="#cbd5e1" stroke="#18181b" strokeWidth="2" />
            <text x="0" y="155" fontSize="12">
              ①T字断面を軸周りに<tspan fontWeight="bold" fill="#b91c1c">（問17）</tspan>して
            </text>
            <text x="0" y="171" fontSize="12">円筒フランジのベースを作成する。</text>
          </g>
          <path d="M 225 130 L 275 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(295, 70)">
            <ellipse cx="65" cy="95" rx="60" ry="20" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <rect x="35" y="30" width="60" height="65" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="65" cy="30" rx="30" ry="10" fill="#e4e4e7" stroke="#18181b" strokeWidth="2" />
            <circle cx="22" cy="95" r="5" fill="#18181b" />
            <text x="-10" y="155" fontSize="12">②基準穴を1つあけた後、中心軸基準で</text>
            <text x="-10" y="171" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問18）</tspan>を行い6等分配置する。
            </text>
          </g>
          <path d="M 465 130 L 515 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(535, 70)">
            <ellipse cx="65" cy="95" rx="60" ry="20" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <rect x="35" y="30" width="60" height="65" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="65" cy="30" rx="30" ry="10" fill="#e4e4e7" stroke="#18181b" strokeWidth="2" />
            <circle cx="22" cy="95" r="4" fill="#18181b" />
            <circle cx="108" cy="95" r="4" fill="#18181b" />
            <circle cx="42" cy="83" r="4" fill="#18181b" />
            <circle cx="88" cy="83" r="4" fill="#18181b" />
            <text x="-15" y="155" fontSize="12">
              ③上端エッジにC面を付ける<tspan fontWeight="bold" fill="#b91c1c">（問19）</tspan>、
            </text>
            <text x="-15" y="171" fontSize="12">
              ④根元角部に<tspan fontWeight="bold" fill="#b91c1c">（問20）</tspan>を付加する。
            </text>
          </g>
          <text x="45" y="335" fontSize="13" fill="#334155">※円周上の等間隔配置と、角を斜めに削る「面取り」・丸める「フィレット」の使い分けを問います。</text>
        </svg>
      );
    case 'fig6':
      return (
        <svg viewBox="0 0 760 440" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="432" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="35" y="36" fontSize="15" fontWeight="bold" fill="#0f172a">【練習問題6】曲面カバー（サーフェスからソリッド化）の手順</text>
          <g transform="translate(45, 75)">
            <path d="M 10 90 Q 65 15, 120 90" fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
            <path d="M 30 110 Q 85 35, 140 110" fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
            <line x1="10" y1="90" x2="30" y2="110" stroke="#64748b" />
            <line x1="120" y1="90" x2="140" y2="110" stroke="#64748b" />
            <text x="0" y="155" fontSize="12">①ガイド曲線に沿って自由曲面となる</text>
            <text x="0" y="171" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問21）</tspan>モデルを作成する。
            </text>
          </g>
          <path d="M 225 130 L 275 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(295, 75)">
            <path d="M 10 85 Q 65 15, 120 85 L 120 100 Q 65 30, 10 100 Z" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <text x="-10" y="155" fontSize="12">②作成した曲面に一定の厚みを与える</text>
            <text x="-10" y="171" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問22）</tspan>機能でソリッド化する。
            </text>
          </g>
          <path d="M 465 130 L 515 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(535, 75)">
            <path d="M 10 85 Q 65 15, 120 85 L 120 100 Q 65 30, 10 100 Z" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <ellipse cx="65" cy="52" rx="16" ry="9" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
            <text x="-15" y="155" fontSize="12">
              ③不要な開口部を<tspan fontWeight="bold" fill="#b91c1c">（問23）</tspan>で切り取り、
            </text>
            <text x="-15" y="171" fontSize="12">
              ④複数面を<tspan fontWeight="bold" fill="#b91c1c">（問24）</tspan>して隙間を閉じる。
            </text>
          </g>
          <text x="45" y="335" fontSize="13" fill="#334155">※意匠曲面設計で用いられるサーフェス編集（厚み付け・トリム・縫合/ステッチ）の重要用語です。</text>
        </svg>
      );
    case 'fig7':
      return (
        <svg viewBox="0 0 760 440" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="432" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="35" y="36" fontSize="15" fontWeight="bold" fill="#0f172a">【練習問題7】集合演算（CSGブーリアン演算）による部品生成</text>
          <g transform="translate(45, 75)">
            <rect x="15" y="25" width="75" height="75" fill="#94a3b8" stroke="#18181b" strokeWidth="2" />
            <circle cx="80" cy="62" r="35" fill="#cbd5e1" fillOpacity="0.8" stroke="#18181b" strokeWidth="2" />
            <text x="0" y="150" fontSize="12">①直方体Aと円柱Bを1つの立体に</text>
            <text x="0" y="166" fontSize="12">
              合体させる演算は<tspan fontWeight="bold" fill="#b91c1c">（問25）</tspan>。
            </text>
          </g>
          <g transform="translate(285, 75)">
            <path d="M 15 25 L 90 25 L 90 30 A 35 35 0 0 0 90 95 L 90 100 L 15 100 Z" fill="#94a3b8" stroke="#18181b" strokeWidth="2" />
            <text x="0" y="150" fontSize="12">②直方体Aから円柱Bの領域を</text>
            <text x="0" y="166" fontSize="12">
              削り取る演算は<tspan fontWeight="bold" fill="#b91c1c">（問26）</tspan>。
            </text>
          </g>
          <g transform="translate(525, 75)">
            <path d="M 90 30 A 35 35 0 0 0 90 95 Z" fill="#64748b" stroke="#18181b" strokeWidth="2" />
            <text x="-10" y="150" fontSize="12">③AとBが重なり合う共通部分だけを</text>
            <text x="-10" y="166" fontSize="12">
              残す演算は<tspan fontWeight="bold" fill="#b91c1c">（問27）</tspan>、この総称は<tspan fontWeight="bold" fill="#b91c1c">（問28）</tspan>。
            </text>
          </g>
          <text x="45" y="335" fontSize="13" fill="#334155">※ソリッドモデリングの根幹である集合演算（和・差・積＝ブーリアン演算）の視覚的理解を問います。</text>
        </svg>
      );
    case 'fig8':
      return (
        <svg viewBox="0 0 760 440" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="432" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="35" y="36" fontSize="15" fontWeight="bold" fill="#0f172a">【練習問題8】3次元空間パイプ（ヘリカル・配管）のモデリング手順</text>
          <g transform="translate(45, 75)">
            <path d="M 15 95 C 15 35, 115 85, 115 20" fill="none" stroke="#1d4ed8" strokeWidth="3" />
            <circle cx="15" cy="95" r="10" fill="none" stroke="#b91c1c" strokeWidth="2" />
            <text x="0" y="150" fontSize="12">①軌道（パス）に沿って円断面を</text>
            <text x="0" y="166" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問29）</tspan>して丸棒形状を作る。
            </text>
          </g>
          <path d="M 225 130 L 275 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(295, 75)">
            <path d="M 15 95 C 15 35, 115 85, 115 20" fill="none" stroke="#71717a" strokeWidth="16" strokeLinecap="round" />
            <path d="M 15 95 C 15 35, 115 85, 115 20" fill="none" stroke="#e4e4e7" strokeWidth="8" strokeLinecap="round" />
            <text x="-10" y="150" fontSize="12">②両端面を開口面として指定し、</text>
            <text x="-10" y="166" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問30）</tspan>で中空パイプ化する。
            </text>
          </g>
          <path d="M 465 130 L 515 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(535, 75)">
            <path d="M 25 25 C 75 25, 75 95, 25 95" fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
            <text x="-15" y="150" fontSize="12">③円筒面上に文字や溝の曲線を</text>
            <text x="-15" y="166" fontSize="12">
              写し取る<tspan fontWeight="bold" fill="#b91c1c">（問31）</tspan>と螺旋<tspan fontWeight="bold" fill="#b91c1c">（問32）</tspan>。
            </text>
          </g>
          <text x="45" y="335" fontSize="13" fill="#334155">※配管のスイープ中空化や、曲面への曲線投影（プロジェクション）、ねじ山・ばねのヘリカルスイープを扱います。</text>
        </svg>
      );
    case 'fig9':
      return (
        <svg viewBox="0 0 760 440" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="432" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="35" y="36" fontSize="15" fontWeight="bold" fill="#0f172a">【練習問題9】階段状段付きシャフトのモデリングと干渉検証</text>
          <g transform="translate(45, 75)">
            <line x1="10" y1="65" x2="140" y2="65" stroke="#0f172a" strokeDasharray="8,3,2,3" strokeWidth="1.8" />
            <polygon points="20,65 20,40 55,40 55,22 100,22 100,45 130,45 130,65" fill="#cbd5e1" stroke="#18181b" strokeWidth="2" />
            <text x="0" y="145" fontSize="12">
              ①段付き断面を軸周りに<tspan fontWeight="bold" fill="#b91c1c">（問33）</tspan>して
            </text>
            <text x="0" y="161" fontSize="12">一発で段付き丸軸を生成する。</text>
          </g>
          <path d="M 225 130 L 275 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(295, 75)">
            <rect x="15" y="40" width="35" height="50" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <rect x="50" y="22" width="45" height="86" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <rect x="95" y="45" width="30" height="40" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <rect x="60" y="22" width="25" height="10" fill="#3f3f46" />
            <text x="-10" y="145" fontSize="12">②基準面をオフセット作成してキー溝を</text>
            <text x="-10" y="161" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問34）</tspan>カットで削り出す。
            </text>
          </g>
          <path d="M 465 130 L 515 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(535, 75)">
            <rect x="25" y="22" width="80" height="86" fill="none" stroke="#18181b" strokeWidth="2" />
            <rect x="45" y="15" width="40" height="100" fill="#94a3b8" fillOpacity="0.6" stroke="#b91c1c" strokeWidth="2" />
            <text x="-15" y="145" fontSize="12">
              ③軸受と組み合わせて<tspan fontWeight="bold" fill="#b91c1c">（問35）</tspan>し、
            </text>
            <text x="-15" y="161" fontSize="12">
              ④重なりがないか<tspan fontWeight="bold" fill="#b91c1c">（問36）</tspan>を行う。
            </text>
          </g>
          <text x="45" y="335" fontSize="13" fill="#334155">※回転体の効率的なモデリング手順と、アセンブリ拘束・干渉チェックによる検証フローを問います。</text>
        </svg>
      );
    case 'fig10':
      return (
        <svg viewBox="0 0 760 440" className="w-full max-w-2xl mx-auto h-auto text-slate-900">
          <rect x="4" y="4" width="752" height="432" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
          <text x="35" y="36" fontSize="15" fontWeight="bold" fill="#0f172a">【練習問題10】フィレットの適用順序とパラメトリック履歴編集</text>
          <g transform="translate(45, 75)">
            <rect x="15" y="35" width="100" height="65" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <rect x="45" y="10" width="40" height="25" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <text x="0" y="145" fontSize="12">①ベースとボスが交わる根元の稜線に</text>
            <text x="0" y="161" fontSize="12">
              先に<tspan fontWeight="bold" fill="#b91c1c">（問37）</tspan>をかけるのが定石。
            </text>
          </g>
          <path d="M 225 130 L 275 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(295, 75)">
            <rect x="15" y="35" width="100" height="65" rx="8" fill="#a1a1aa" stroke="#18181b" strokeWidth="2" />
            <rect x="45" y="10" width="40" height="25" rx="4" fill="#71717a" stroke="#18181b" strokeWidth="2" />
            <text x="-10" y="145" fontSize="12">②各フィーチャの操作順序を管理する</text>
            <text x="-10" y="161" fontSize="12">
              設計木を<tspan fontWeight="bold" fill="#b91c1c">（問38）</tspan>ツリーと呼ぶ。
            </text>
          </g>
          <path d="M 465 130 L 515 130" stroke="#64748b" strokeWidth="3" />
          <g transform="translate(535, 75)">
            <rect x="20" y="20" width="90" height="80" fill="#e4e4e7" stroke="#18181b" strokeWidth="2" />
            <text x="32" y="55" fontSize="11" fill="#0f172a">R = 5 → 8mm</text>
            <text x="32" y="75" fontSize="11" fill="#1d4ed8">自動再計算</text>
            <text x="-15" y="145" fontSize="12">③寸法値を変えると形状が連動する</text>
            <text x="-15" y="161" fontSize="12">
              <tspan fontWeight="bold" fill="#b91c1c">（問39）</tspan>機能と<tspan fontWeight="bold" fill="#b91c1c">（問40）</tspan>の考慮。
            </text>
          </g>
          <text x="45" y="335" fontSize="13" fill="#334155">※フィレットの順序によるエラー回避、フィーチャ履歴（ヒストリー）、親子関係の理解を問う総仕上げ問題です。</text>
        </svg>
      );
  }
}
