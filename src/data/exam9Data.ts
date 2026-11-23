import type { QuizDataset } from '../types/quiz';

export const exam9Dataset: QuizDataset = {
  id: 'exam9_45',
  group: 'practice_set_1_2',
  title: '第9回 3次元CAD利用技術者試験',
  description:
    'Part 1（選択問題30問）＋ Part 2（文章穴埋め問題15問・複数空欄対応）を完全収録。',
  questions: [
    // Part 1 選択問題（問題1〜30）
    {
      question:
        '3次元CADで作成したモデルの寸法を変更したところ、関連する形状も自動的に更新された。このような設計方法の特徴として、最も適切なものはどれか。',
      options: [
        'ポリゴンモデリング',
        'レンダリング',
        'パラメトリックモデリング',
        'リバースエンジニアリング',
      ],
      correctAnswer: 'パラメトリックモデリング',
      explanation:
        'パラメトリックモデリングは、寸法や拘束条件などを利用して形状を定義する設計方法です。例えば、Fusionで長方形の幅を60mmから80mmに変更すると、そのスケッチを利用した押し出し形状も更新されます。設計変更が多い製品開発で特に役立ちます。',
      point:
        'パラメトリックモデリング＝寸法や条件の変更に連動して形状が更新される設計方法。',
    },
    {
      question:
        'Fusionで長方形のスケッチを作成した。長方形の幅を変更しても、左右の辺が平行な状態を維持したい。このとき重要となる機能はどれか。',
      options: [
        'スケッチ拘束',
        'レンダリング',
        '干渉チェック',
        'メッシュ分割',
      ],
      correctAnswer: 'スケッチ拘束',
      explanation:
        'スケッチ拘束は、線や円などの図形に幾何学的な条件を与える機能です。例えば、水平・垂直・平行・一致などの拘束を設定することで、寸法を変更しても意図した形状を維持できます。',
      point: 'スケッチ拘束＝図形の位置や形状の関係を定義する機能。',
    },
    {
      question:
        '円柱状の部品を作成するため、長方形の断面を中心軸の周りに360度回転させて立体を作りたい。最も適切なモデリング機能はどれか。',
      options: ['スイープ', 'シェル', 'ロフト', '回転'],
      correctAnswer: '回転',
      explanation:
        '回転（Revolve）は、スケッチの断面を指定した軸の周りに回転させて立体を作る機能です。円柱、円すい、コマ、滑車など、回転対称の形状を作成する際に便利です。',
      point: '回転＝断面を軸の周りに回して立体を作る。',
    },
    {
      question:
        '一定の断面形状を、曲がった経路に沿って移動させることで立体を作成したい。最も適切な機能はどれか。',
      options: ['ミラー', 'スイープ', 'フィレット', 'パターン'],
      correctAnswer: 'スイープ',
      explanation:
        'スイープ（Sweep）は、断面形状を指定した経路に沿って移動させて立体を作る機能です。例えば、曲がったパイプ、ケーブル、手すりなどの形状を作成できます。',
      point: 'スイープ＝断面形状＋経路。',
    },
    {
      question:
        '円形の断面から四角形の断面へ、徐々に形状が変化する立体を作成したい。最も適切な機能はどれか。',
      options: ['シェル', '面取り', 'ロフト', '押し出し'],
      correctAnswer: 'ロフト',
      explanation:
        'ロフト（Loft）は、異なる複数の断面形状をつないで立体を作る機能です。例えば、円形の入口から四角形の出口へ変化するダクトなどを作成できます。',
      point: 'ロフト＝異なる断面形状をつないで立体を作る。',
    },
    {
      question:
        '直方体の内部を空洞にし、一定の肉厚を持つ箱を作成したい。最も適切な機能はどれか。',
      options: ['シェル', 'ミラー', 'レンダリング', '干渉チェック'],
      correctAnswer: 'シェル',
      explanation:
        'シェル（Shell）は、立体の内部を空洞にし、指定した肉厚を残す機能です。例えば、Fusionで直方体を作り、上面を開口面としてシェルを適用すると、一定の壁厚を持つ箱を作れます。',
      point: 'シェル＝立体を中空にする機能。',
    },
    {
      question:
        '部品の角を丸くして、鋭いエッジをなくしたい。最も適切な機能はどれか。',
      options: ['ロフト', 'スイープ', 'パターン', 'フィレット'],
      correctAnswer: 'フィレット',
      explanation:
        'フィレット（Fillet）は、角やエッジを丸くする機能です。例えば、ケースの角を丸めることで、手で触れたときの安全性や外観を改善できます。',
      point: 'フィレット＝角を丸くする。面取り＝角を斜めに削る。',
    },
    {
      question:
        '円形の部品に、中心軸の周りへ等間隔で6個の穴を配置したい。最も適切な機能はどれか。',
      options: [
        'シェル',
        '円形状パターン',
        'レンダリング',
        'チェックアウト',
      ],
      correctAnswer: '円形状パターン',
      explanation:
        '円形状パターンは、指定した軸の周りに形状やフィーチャを一定の規則で繰り返し配置する機能です。例えば、最初に1つの穴を作成し、円形状パターンで6個に増やすことができます。',
      point: '円形状パターン＝軸の周りに繰り返し配置する。',
    },
    {
      question:
        '既存の立体から、別の立体と重なっている部分だけを取り除きたい。最も適切なブーリアン演算はどれか。',
      options: [
        '和（Union）',
        '積（Intersection）',
        '差（Difference）',
        'ミラー（Mirror）',
      ],
      correctAnswer: '差（Difference）',
      explanation:
        'ブーリアン演算には、主に和（Union：複数の立体を結合する）、差（Difference：一方の立体から他方と重なる部分を取り除く）、積（Intersection：複数の立体が共通して重なる部分を残す）の3種類があります。Fusionでは結合（Join）、切り取り（Cut）、交差（Intersect）に対応します。',
      point: '和＝結合、差＝削除、積＝共通部分。',
    },
    {
      question:
        '3次元CADで作成したモデルについて、材料を設定し、質量や重心位置などを確認したい。利用する機能として最も適切なものはどれか。',
      options: [
        'マスプロパティ',
        'スケッチ拘束',
        'スイープ',
        'レンダリング',
      ],
      correctAnswer: 'マスプロパティ',
      explanation:
        'マスプロパティは、3Dモデルの体積、質量、重心、慣性モーメントなどの物理的な特性です。例えば、ロボットの部品の質量や重心を調べることで、モータの選定やバランスの検討に役立ちます。質量を計算するには、材料の密度が必要です。',
      point: 'マスプロパティ＝質量・体積・重心などの物理的特性。',
    },
    {
      question:
        'ロボットのアームを構成する複数の部品を、1つの製品として組み合わせて確認したい。最も適切な作業はどれか。',
      options: [
        'メッシュ分割',
        'テクスチャ設定',
        'ファイル圧縮',
        'アセンブリ',
      ],
      correctAnswer: 'アセンブリ',
      explanation:
        'アセンブリは、複数の部品を組み合わせて製品全体を構成することです。例えば、ロボットアームでは、リンク、モータ、軸、ねじなどの部品を組み合わせて1つの機構を作ります。',
      point: 'アセンブリ＝複数の部品を組み合わせること。',
    },
    {
      question:
        'アセンブリ内で、2つの部品が意図せず同じ空間を占めているか確認したい。最も適切な機能はどれか。',
      options: ['レンダリング', '干渉チェック', 'シェル', 'パターン'],
      correctAnswer: '干渉チェック',
      explanation:
        '干渉チェックは、組み立てた部品同士が意図せず重なっていないか確認する機能です。CAD上では組み立てられたように見えても、実際には部品同士がぶつかって組み立てられない場合があります。干渉チェックは、このような問題の発見に役立ちます。',
      point: '干渉チェック＝部品同士の重なりを確認する。',
    },
    {
      question:
        'ロボットの回転関節について、部品同士の相対的な回転運動を設定したい。最も適切な機能はどれか。',
      options: ['フィレット', 'ロフト', 'ジョイント', 'メッシュ変換'],
      correctAnswer: 'ジョイント',
      explanation:
        'ジョイント（Joint）は、アセンブリ内の部品同士の位置関係や動きを定義する機能です。Fusionでは回転ジョイントを使用することで、ロボットの関節のような回転運動を設定できます。',
      point: 'ジョイント＝部品同士の位置関係や動きを設定する。',
    },
    {
      question:
        '製品を構成する部品の名称、番号、数量などを一覧表として管理したい。最も適切なものはどれか。',
      options: ['BOM', 'CAE', 'STL', 'VPN'],
      correctAnswer: 'BOM',
      explanation:
        'BOM（Bill of Materials）は、製品を構成する部品の情報をまとめた部品表です。例えば、ロボット1台に必要なモータ、ねじ、フレームなどの種類や数量を管理できます。',
      point: 'BOM＝部品表。',
    },
    {
      question:
        '設計者Aが変更した部品データを、設計者Bが誤って古いデータで上書きしてしまった。このような問題を防ぐために重要な仕組みはどれか。',
      options: ['レンダリング', '熱解析', 'フィレット', 'バージョン管理'],
      correctAnswer: 'バージョン管理',
      explanation:
        'バージョン管理は、設計データの変更履歴や版を管理する仕組みです。どのデータが最新版なのか、誰がどのような変更を行ったのかを確認できます。共同設計では、バージョン管理に加えて編集権限やチェックアウトなどの仕組みも重要です。',
      point: 'バージョン管理＝設計変更の履歴と版を管理する。',
    },
    {
      question:
        '複数の設計者が同じCADデータを編集する際、他の人による同時編集を制限するための操作として最も適切なものはどれか。',
      options: ['スイープ', 'チェックアウト', 'ロフト', '面取り'],
      correctAnswer: 'チェックアウト',
      explanation:
        'チェックアウトは、管理システムからデータを編集するために取得する操作です。システムによっては、チェックアウト中に他の利用者の編集を制限する機能があります。編集後にデータを管理システムへ登録する操作をチェックインといいます。',
      point: 'チェックアウト＝編集のために取得、チェックイン＝編集後に登録。',
    },
    {
      question:
        '企業でCADデータ、図面、部品情報、設計変更履歴などを一元的に管理したい。最も適切な仕組みはどれか。',
      options: ['DNS', 'FDM', 'PDM', 'GPU'],
      correctAnswer: 'PDM',
      explanation:
        'PDM（Product Data Management）は、製品の設計データや関連情報を管理する仕組みです。複数人で設計する際に、データの共有、変更履歴の管理、部品情報の整理などに役立ちます。',
      point: 'PDM＝製品データ管理。',
    },
    {
      question:
        'Fusionで作成した3次元モデルを、異なるCADソフトウェアを使用する取引先に渡したい。形状データの交換に適した代表的な形式はどれか。',
      options: ['STEP', 'MP3', 'PNG', 'WAV'],
      correctAnswer: 'STEP',
      explanation:
        'STEPは、異なるCADソフトウェア間で3次元形状などの製品データを交換するための標準的な形式です。ただし、元のCADで作成したフィーチャ履歴が、そのまま引き継がれるとは限りません。',
      point: 'STEP＝CAD間のデータ交換形式。',
    },
    {
      question:
        '3Dプリンタで造形するため、モデルの表面を三角形メッシュで表現したファイルを書き出したい。最も適切な形式はどれか。',
      options: ['PDF', 'CSV', 'DOCX', 'STL'],
      correctAnswer: 'STL',
      explanation:
        'STLは、物体の表面形状を主に三角形メッシュで表現するファイル形式です。3Dプリンタでの造形データとして広く利用されています。',
      point: 'STL＝三角形メッシュによる形状データ。',
    },
    {
      question:
        '企業の重要な設計データを管理する方法として、最も適切なものはどれか。',
      options: [
        '全員が同じパスワードを使用する',
        '利用者ごとに権限を設定し、定期的にバックアップを取得する',
        '設計データを1台のPCにだけ保存する',
        '社外の人が自由に編集できるようにする',
      ],
      correctAnswer:
        '利用者ごとに権限を設定し、定期的にバックアップを取得する',
      explanation:
        '設計データは企業の重要な資産です。利用者ごとに適切なアクセス権限を設定することで、不正な閲覧や変更のリスクを減らせます。また、バックアップを取得することで、誤削除や機器の故障などによるデータ消失に備えられます。',
      point: '設計データの管理には、アクセス制御とバックアップが重要。',
    },
    {
      question:
        'ロボットの部品を設計した。実際に製作する前に、荷重による変形や応力を予測したい。最も適切な技術はどれか。',
      options: ['CAM', 'DNS', 'CAE', 'BOM'],
      correctAnswer: 'CAE',
      explanation:
        'CAE（Computer Aided Engineering）は、コンピュータを利用して製品の強度や変形などを解析・評価する技術です。例えば、ロボットアームの部品に荷重を加えたとき、どの部分に大きな応力が生じるかを予測できます。',
      point: 'CAE＝製品の解析・評価。',
    },
    {
      question:
        'CAEで複雑な形状の部品を小さな要素に分割し、各要素の関係を計算して変形などを解析する方法はどれか。',
      options: [
        '有限要素法',
        'レンダリング',
        'リバースエンジニアリング',
        'ラピッドプロトタイピング',
      ],
      correctAnswer: '有限要素法',
      explanation:
        '有限要素法（FEM）は、解析対象を多数の小さな要素に分割して計算する手法です。分割した要素の集合をメッシュと呼びます。',
      point: 'FEM＝有限要素法、メッシュ＝小さな要素の集合。',
    },
    {
      question:
        'CAEによる構造解析で、実際には固定されている部品を、固定条件なしで解析した。この場合の問題として、最も適切なものはどれか。',
      options: [
        '3Dモデルの表示色が変わる',
        'CADファイルが自動的に削除される',
        'モデルの体積が必ず増える',
        '実際の使用状態を適切に再現できず、解析結果が不適切になる可能性がある',
      ],
      correctAnswer:
        '実際の使用状態を適切に再現できず、解析結果が不適切になる可能性がある',
      explanation:
        'CAEでは、部品の形状だけでなく、固定条件や荷重条件などを適切に設定する必要があります。例えば、片側を固定して使用する部品なのに固定条件を設定しなければ、実際の使用状態を正しく表現できません。解析が正常に成立しない場合もあります。',
      point: 'CAEでは境界条件の設定が重要。',
    },
    {
      question:
        'CADで作成した部品を切削加工するため、工具の移動経路を作成したい。最も適切な技術はどれか。',
      options: ['PDM', 'CAM', 'VPN', 'DMU'],
      correctAnswer: 'CAM',
      explanation:
        'CAM（Computer Aided Manufacturing）は、コンピュータを利用して加工工程や加工データの作成を支援する技術です。例えば、Fusionの製造機能を利用すると、3Dモデルをもとに切削工具の移動経路を作成できます。',
      point: 'CAM＝加工データの作成を支援する技術。',
    },
    {
      question:
        '3Dプリンタで、樹脂フィラメントを加熱して溶かし、ノズルから押し出して造形する方式はどれか。',
      options: ['光造形方式', '切削加工方式', 'FDM方式', '放電加工方式'],
      correctAnswer: 'FDM方式',
      explanation:
        'FDM（熱溶解積層）方式は、樹脂フィラメントを加熱して溶かし、ノズルから押し出して積み重ねる方式です。PLAやABSなどの樹脂材料が利用されます。',
      point: 'FDM＝溶かした樹脂を押し出して積み重ねる方式。',
    },
    {
      question:
        '3Dプリンタで張り出した形状を造形したところ、途中で形状が崩れてしまった。対策として、最も適切なものはどれか。',
      options: [
        '必要な部分にサポート材を設定する',
        'CADファイル名を短くする',
        'モデルの表示色を変更する',
        'ディスプレイの解像度を上げる',
      ],
      correctAnswer: '必要な部分にサポート材を設定する',
      explanation:
        '3Dプリンタでは、張り出した部分などを造形する際、下から支える構造が必要になる場合があります。サポート材を設定することで、造形中の形状を支えることができます。',
      point: 'サポート材＝造形中に支えが必要な部分を支持する材料。',
    },
    {
      question:
        '古い機械部品を交換したいが、設計図面が残っていない。実物を測定し、3Dモデルを再作成する方法として、最も適切なものはどれか。',
      options: [
        'バージョン管理',
        'ネットワーク解析',
        'レンダリング',
        'リバースエンジニアリング',
      ],
      correctAnswer: 'リバースエンジニアリング',
      explanation:
        'リバースエンジニアリングは、既存の製品や部品を調査・測定し、その形状や構造などを把握する手法です。例えば、3Dスキャナで部品を測定し、取得したデータをもとにCADモデルを作成できます。',
      point: 'リバースエンジニアリング＝実物から形状や構造を調べる。',
    },
    {
      question:
        '3Dスキャナで実物の形状を測定した結果、多数の3次元座標が得られた。このデータは何と呼ばれるか。',
      options: [
        'BOMデータ',
        '点群データ',
        'ツールパス',
        'フィーチャ履歴',
      ],
      correctAnswer: '点群データ',
      explanation:
        '点群データは、3次元空間上の多数の点の位置情報を集めたデータです。これらの点をもとに、メッシュや曲面などの3Dモデルを作成できます。',
      point: '点群データ＝多数の3次元座標の集合。',
    },
    {
      question:
        '新製品の3Dモデルを使い、実物を作る前に部品の組み合わせや干渉を確認したい。最も適切な技術はどれか。',
      options: ['DNS', 'VPN', 'DMU', 'FDM'],
      correctAnswer: 'DMU',
      explanation:
        'DMU（Digital Mock-Up）は、3次元データを利用して、製品の組み立て状態や部品同士の干渉などを確認する技術です。実物の試作品を製作する前に、設計上の問題を発見することに役立ちます。',
      point: 'DMU＝デジタル上で製品を検証する技術。',
    },
    {
      question:
        'ある企業では、新しいロボット部品を開発している。まず3次元CADで部品の形状を設計し、強度を解析した。その後、切削加工用の工具経路を作成し、試作品を製作する予定である。この開発工程を表す組み合わせとして、最も適切なものはどれか。',
      options: [
        'CAD → CAE → CAM',
        'CAD → DNS → VPN',
        'PDM → LAN → GPU',
        'STL → BOM → DNS',
      ],
      correctAnswer: 'CAD → CAE → CAM',
      explanation:
        'CADは製品の形状を設計する技術です。CAEは製品の強度や変形などを解析する技術です。CAMは加工工程や工具経路などの作成を支援する技術です。',
      point: 'CAD＝設計、CAE＝解析、CAM＝製造支援。',
    },

    // Part 2 文章穴埋め問題（問題31〜45）
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】寸法や拘束条件などのパラメータを利用して形状を定義し、数値の変更に応じてモデルを更新する設計方法を（ A ）モデリングという。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'パラメトリック',
          acceptedAnswers: [
            'パラメトリック',
            'ぱらめとりっく',
            'パラメトリックモデリング',
          ],
        },
      ],
      explanation:
        'パラメトリックモデリングは、寸法や拘束条件などを利用して形状を定義する設計方法です。寸法を変更すると、関連する形状も更新されるため、設計変更に対応しやすくなります。',
      point: 'パラメトリック＝寸法や条件を使って形状を定義する。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】スケッチの断面形状を中心軸の周りに回転させて立体を作成する機能を（ A ）という。また、断面形状を経路に沿って移動させて立体を作成する機能を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る機能名',
          correctAnswer: '回転',
          acceptedAnswers: ['回転', 'かいてん', 'Revolve', 'revolve'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る機能名',
          correctAnswer: 'スイープ',
          acceptedAnswers: ['スイープ', 'すいーぷ', 'Sweep', 'sweep'],
        },
      ],
      explanation:
        '回転は、断面形状を指定した軸の周りに回転させて立体を作る機能です。スイープは、断面形状を指定した経路に沿って移動させて立体を作る機能です。',
      point: '回転＝軸の周り、スイープ＝経路に沿う。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】異なる複数の断面形状を滑らかにつないで立体を作成する機能を（ A ）という。また、立体の内部を空洞にして一定の肉厚を持たせる機能を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る機能名',
          correctAnswer: 'ロフト',
          acceptedAnswers: ['ロフト', 'ろふと', 'Loft', 'loft'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る機能名',
          correctAnswer: 'シェル',
          acceptedAnswers: ['シェル', 'しぇる', 'Shell', 'shell'],
        },
      ],
      explanation:
        'ロフトは、複数の断面形状をつないで立体を作る機能です。シェルは、立体の内部を空洞にして、指定した肉厚を残す機能です。',
      point: 'ロフト＝断面をつなぐ、シェル＝中空にする。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】部品の角を丸くする機能を（ A ）という。また、形状を一定の規則に従って繰り返し配置する機能を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る機能名',
          correctAnswer: 'フィレット',
          acceptedAnswers: ['フィレット', 'ふぃれっと', 'Fillet', 'fillet'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る機能名',
          correctAnswer: 'パターン',
          acceptedAnswers: ['パターン', 'ぱたーん', 'Pattern', 'pattern'],
        },
      ],
      explanation:
        'フィレットは、角やエッジを丸くする機能です。パターンは、同じ形状やフィーチャを一定の規則で繰り返し配置する機能です。',
      point: 'フィレット＝角を丸める、パターン＝繰り返し配置する。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】2つの立体を組み合わせるブーリアン演算のうち、立体同士を結合する演算を（ A ）、一方の立体から他方の立体が重なる部分を取り除く演算を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る演算名',
          correctAnswer: '和（Union）',
          acceptedAnswers: [
            '和（Union）',
            '和(Union)',
            '和',
            'わ',
            'Union',
            'union',
            '結合',
          ],
        },
        {
          label: 'B',
          placeholder: 'Bに入る演算名',
          correctAnswer: '差（Difference）',
          acceptedAnswers: [
            '差（Difference）',
            '差(Difference)',
            '差',
            'さ',
            'Difference',
            'difference',
            '切り取り',
          ],
        },
      ],
      explanation:
        '和は、複数の立体を結合する演算です。差は、一方の立体から他方と重なっている部分を取り除く演算です。なお、重なっている共通部分だけを残す演算は積（Intersection）です。',
      point: '和＝結合、差＝削除、積＝共通部分。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】3次元CADモデルの体積、質量、重心位置などの物理的な特性を（ A ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'マスプロパティ',
          acceptedAnswers: ['マスプロパティ', 'ますぷろぱてぃ'],
        },
      ],
      explanation:
        'マスプロパティは、3Dモデルの体積、質量、重心、慣性モーメントなどの物理的な特性です。ロボットや機械部品の設計では、重量や重心位置の検討に役立ちます。',
      point: 'マスプロパティ＝質量・体積・重心などの物理的特性。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】複数の部品を組み合わせて製品を構成することを（ A ）という。また、部品同士が意図せず重なっていないか確認することを（ B ）チェックという。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'アセンブリ',
          acceptedAnswers: ['アセンブリ', 'あせんぶり', 'assembly'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: '干渉',
          acceptedAnswers: ['干渉', 'かんしょう', '干渉チェック'],
        },
      ],
      explanation:
        'アセンブリは、複数の部品を組み合わせて製品を構成することです。干渉チェックは、組み合わせた部品同士が意図せず重なっていないか確認することです。',
      point: 'アセンブリ＝組み立て、干渉チェック＝重なりの確認。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】製品を構成する部品の名称や数量などをまとめた部品表を（ A ）という。また、製品の設計データや関連情報を一元的に管理する仕組みを（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'BOM',
          acceptedAnswers: ['BOM', 'bom', 'Bill of Materials'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'PDM',
          acceptedAnswers: ['PDM', 'pdm', 'Product Data Management'],
        },
      ],
      explanation:
        'BOM（Bill of Materials）は、製品を構成する部品の名称、番号、数量などをまとめた部品表です。PDM（Product Data Management）は、製品の設計データや関連情報を管理する仕組みです。',
      point: 'BOM＝部品表、PDM＝製品データ管理。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】設計データの変更履歴を管理することを（ A ）管理という。また、管理システムから編集のためにデータを取得する操作を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'バージョン',
          acceptedAnswers: ['バージョン', 'ばーじょん', 'バージョン管理', 'version'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る操作名',
          correctAnswer: 'チェックアウト',
          acceptedAnswers: ['チェックアウト', 'ちぇっくあうと'],
        },
      ],
      explanation:
        'バージョン管理は、設計データの変更履歴や版を管理することです。チェックアウトは、管理システムからデータを編集するために取得する操作です。',
      point: 'バージョン管理＝変更履歴、チェックアウト＝編集のための取得。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】異なるCADソフトウェア間で3次元形状データを交換する代表的な中間ファイル形式を（ A ）形式という。また、主に三角形メッシュで物体の表面形状を表現するファイル形式を（ B ）形式という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る形式',
          correctAnswer: 'STEP',
          acceptedAnswers: ['STEP', 'step', 'STEP形式'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る形式',
          correctAnswer: 'STL',
          acceptedAnswers: ['STL', 'stl', 'STL形式'],
        },
      ],
      explanation:
        'STEPは、異なるCADソフトウェア間で製品データを交換するための標準的な形式です。STLは、主に三角形メッシュで表面形状を表現する形式です。',
      point: 'STEP＝CAD間のデータ交換、STL＝三角形メッシュ。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】コンピュータを利用して製品の強度や変形などを解析・評価する技術を（ A ）という。また、コンピュータを利用して加工工程や加工データの作成を支援する技術を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'CAE',
          acceptedAnswers: ['CAE', 'cae', 'Computer Aided Engineering'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'CAM',
          acceptedAnswers: ['CAM', 'cam', 'Computer Aided Manufacturing'],
        },
      ],
      explanation:
        'CAE（Computer Aided Engineering）は、製品の解析・評価を支援する技術です。CAM（Computer Aided Manufacturing）は、製品の製造・加工を支援する技術です。',
      point: 'CAE＝解析、CAM＝製造支援。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】解析対象を小さな要素に分割して計算する方法を（ A ）法という。また、材料内部に生じる単位面積あたりの力を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: '有限要素',
          acceptedAnswers: ['有限要素', 'ゆうげんようそ', '有限要素法', 'FEM', 'fem'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: '応力',
          acceptedAnswers: ['応力', 'おうりょく'],
        },
      ],
      explanation:
        '有限要素法（FEM）は、解析対象を小さな要素に分割して計算する方法です。応力は、材料内部に生じる力を単位面積あたりで表したものです。',
      point: 'FEM＝有限要素法、応力＝単位面積あたりの内部の力。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】数値情報によって工作機械を制御する方式を（ A ）という。また、加工時に工具が移動する経路を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'NC',
          acceptedAnswers: ['NC', 'nc', '数値制御', 'Numerical Control'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'ツールパス',
          acceptedAnswers: ['ツールパス', 'つーるぱす', '工具経路'],
        },
      ],
      explanation:
        'NC（Numerical Control）は、数値情報によって工作機械を制御する方式です。ツールパスは、切削加工などで工具が移動する経路です。',
      point: 'NC＝数値制御、ツールパス＝工具の移動経路。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】材料を積み重ねて立体を作る製造方法を（ A ）造形という。また、熱で溶かした樹脂を押し出して積み重ねる3Dプリンタの方式を（ B ）方式という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: '積層',
          acceptedAnswers: ['積層', 'せきそう', '積層造形'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る方式',
          correctAnswer: 'FDM',
          acceptedAnswers: ['FDM', 'fdm', '熱溶解積層', 'FDM方式'],
        },
      ],
      explanation:
        '積層造形は、材料を層状に積み重ねて立体を作る製造方法です。FDM（熱溶解積層）方式は、熱で溶かした樹脂をノズルから押し出して積み重ねる方式です。',
      point: '積層造形＝材料を積み重ねる、FDM＝溶かした樹脂を押し出す。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】既存の製品や部品を測定・調査して形状や構造を把握する手法を（ A ）という。また、3次元CADデータ上で製品の組み立て状態や干渉などを確認する手法を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'リバースエンジニアリング',
          acceptedAnswers: [
            'リバースエンジニアリング',
            'りばーすえんじにありんぐ',
          ],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'DMU',
          acceptedAnswers: [
            'DMU',
            'dmu',
            'Digital Mock-Up',
            'デジタルモックアップ',
          ],
        },
      ],
      explanation:
        'リバースエンジニアリングは、既存の製品や部品を調査・測定し、その形状や構造などを把握する手法です。DMU（Digital Mock-Up）は、3次元データを利用して、製品の組み立て状態や部品同士の干渉などを確認する技術です。',
      point: 'リバースエンジニアリング＝実物から調べる、DMU＝デジタル上で検証する。',
    },
  ],
};
