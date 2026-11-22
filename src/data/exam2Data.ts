import type { QuizDataset } from '../types/quiz';

export const exam2Dataset: QuizDataset = {
  id: 'exam2_45',
  group: 'practice_set_1_2',
  title: '第2回 3次元CAD利用技術者試験',
  description: 'Part 1（選択問題30問）＋ Part 2（重要用語 穴埋め入力15問）を完全収録。',
  questions: [
    {
      question:
        '3次元CADで扱われるモデルのうち、頂点と稜線を中心に形状を表現し、面や内部の情報を持たないモデルはどれか。',
      options: [
        'ソリッドモデル',
        'サーフェスモデル',
        'ワイヤーフレームモデル',
        'アセンブリモデル',
      ],
      correctAnswer: 'ワイヤーフレームモデル',
      explanation:
        'ワイヤーフレームモデルは、点（頂点）と線（稜線）を使って形状を表現します。面や立体内部の情報を持たないため、構造が単純でデータ量を小さくできますが、複雑な形状では前後関係が分かりにくくなることがあります。',
      point: '点＋線＝ワイヤーフレーム。',
    },
    {
      question:
        '物体の表面を面によって表現するが、一般に内部が詰まった立体としての情報を持たないモデルはどれか。',
      options: [
        'ワイヤーフレームモデル',
        'サーフェスモデル',
        'ソリッドモデル',
        'ボクセルモデル',
      ],
      correctAnswer: 'サーフェスモデル',
      explanation:
        'サーフェスモデルは、物体の表面を「面」で表現するモデルです。複雑な曲面を表現するのに適していますが、ソリッドモデルのように内部まで含んだ立体として扱うものではありません。',
      point:
        'ワイヤーフレーム＝線 ／ サーフェス＝面 ／ ソリッド＝立体（この3つはセットで覚えましょう）',
    },
    {
      question:
        '物体の表面だけでなく内部・外部を区別でき、体積などの情報を扱えるモデルはどれか。',
      options: [
        'ソリッドモデル',
        'ワイヤーフレームモデル',
        '2次元モデル',
        'レイヤーモデル',
      ],
      correctAnswer: 'ソリッドモデル',
      explanation:
        'ソリッドモデルは、物体を中身の詰まった立体として表現します。そのため体積や質量、重心などを計算したり、部品同士の干渉を調べたりできます。',
      point: '内部・外部を区別できる立体＝ソリッドモデル。',
    },
    {
      question:
        '3次元空間を小さな立方体などの集合として分割し、形状を表現する方式として最も適切なものはどれか。',
      options: ['NURBS', 'ボクセル', 'B-reps', 'ベジェ曲線'],
      correctAnswer: 'ボクセル',
      explanation:
        'ボクセル（Voxel）は、3次元空間を小さな立方体状の要素に分割して表現する方法です。2次元画像の「ピクセル」を3次元にしたものと考えると分かりやすいです。',
      point: 'Pixel＝2次元の小さな要素 ／ Voxel＝3次元の小さな要素',
    },
    {
      question: '3次元CADにおける「フィーチャ」の説明として最も適切なものはどれか。',
      options: [
        'モデルの画面上の色だけを管理する機能',
        '穴、溝、突起など、形状に意味を持たせた構成要素',
        'CADデータを圧縮する方式',
        'ネットワーク上のコンピュータを識別する情報',
      ],
      correctAnswer: '穴、溝、突起など、形状に意味を持たせた構成要素',
      explanation:
        'フィーチャとは、穴、溝、突起など、設計上の意味を持った形状の構成要素です。現在の3次元CADでは、このフィーチャを組み合わせながらモデルを作成する方法が広く利用されています。',
      point: '穴・溝・突起など「意味を持った形状」＝フィーチャ。',
    },
    {
      question:
        '寸法などのパラメータを変更することで、それに応じてモデル形状を変更できる設計手法として最も適切なものはどれか。',
      options: [
        'パラメトリックモデリング',
        'レンダリング',
        'ラスタライズ',
        'リバースエンジニアリング',
      ],
      correctAnswer: 'パラメトリックモデリング',
      explanation:
        '寸法や角度などをパラメータとして設定し、その値を変更することでモデル形状を連動して変更できる方法です。例えば穴径を「10mm」から「15mm」に変更すると、それに合わせてモデルが再計算されます。',
      point: '数値を変更 → 形状も連動して変化＝パラメトリック。',
    },
    {
      question:
        'スケッチに対して「この2本の線は平行」「この線は水平」などの条件を設定することを何というか。',
      options: ['拘束', '属性', '干渉', '投影'],
      correctAnswer: '拘束',
      explanation:
        '拘束とは、スケッチなどの形状に幾何学的な条件を与えることです。平行、垂直、水平、一致、同心などの条件があります。',
      point: '形状の位置や関係を決めるルール＝拘束。',
    },
    {
      question:
        '円などの2次元断面を、ある軸を中心に回転させて立体形状を作る操作として最も適切なものはどれか。',
      options: ['押し出し', '回転', 'スイープ', 'ロフト'],
      correctAnswer: '回転',
      explanation:
        '断面形状を指定した軸の周囲に回転させて3次元形状を作ります。円筒状・軸対称の部品などを作る際によく利用されます。',
      point:
        '押し出し＝まっすぐ動かす ／ 回転＝軸を中心に回す ／ スイープ＝経路に沿って動かす ／ ロフト＝複数の断面をつなぐ',
    },
    {
      question: '立体の角に丸みを付けるモデリング機能はどれか。',
      options: ['フィレット', 'シェル', 'トリム', 'ミラー'],
      correctAnswer: 'フィレット',
      explanation:
        'フィレットは、形状の角や稜線に丸みを付ける機能です。機械部品などでも非常によく利用されます。',
      point: '角を丸くする＝フィレット。',
    },
    {
      question:
        'ソリッドモデルの内部をくり抜き、一定の肉厚を持つ薄肉形状を作成する機能はどれか。',
      options: ['ロフト', 'シェル', 'スイープ', 'オフセット'],
      correctAnswer: 'シェル',
      explanation:
        'シェルは、ソリッドモデルの内部をくり抜いて一定の肉厚を持たせる機能です。ケースや容器のような形状を作る際に利用できます。',
      point: '中身をくり抜いて一定の厚みを残す＝シェル。',
    },
    {
      question:
        '同じ穴や突起などを一定間隔で複数配置する際に利用する機能として最も適切なものはどれか。',
      options: ['パターン', 'トリム', 'マスプロパティ', 'シェーディング'],
      correctAnswer: 'パターン',
      explanation:
        '同じフィーチャや形状を規則的に複製する機能です。直線状に並べる場合や、円周上に並べる場合などがあります。',
      point: '同じ形を規則的に繰り返す＝パターン。',
    },
    {
      question: '作成した形状を基準面などに対して対称な位置へ複製する機能はどれか。',
      options: ['ミラー', 'スイープ', 'シェル', 'ロフト'],
      correctAnswer: 'ミラー',
      explanation:
        '基準となる面や平面に対して、鏡に映したような対称形状を作る機能です。',
      point: '左右対称にコピー＝ミラー。',
    },
    {
      question:
        'アセンブリモデルにおいて、部品同士が物理的に重なっている箇所を検出する機能はどれか。',
      options: ['干渉チェック', 'マスプロパティ', 'レンダリング', 'フィレット'],
      correctAnswer: '干渉チェック',
      explanation:
        '組み立てた部品同士が、本来存在できない位置で重なっていないかを確認します。製造前に設計上の問題を発見するために重要な機能です。',
      point: '部品同士がぶつかっていないか＝干渉チェック。',
    },
    {
      question: '3次元モデルから重心や体積などを求める機能として最も適切なものはどれか。',
      options: ['マスプロパティ', 'PDM', 'PDQ', 'DMU'],
      correctAnswer: 'マスプロパティ',
      explanation:
        '3次元モデルから体積、表面積、重心などの物理的特性を求めます。材質・密度などの情報が設定されていれば質量も求められます。',
      point: '体積・表面積・重心・質量＝マスプロパティ。',
    },
    {
      question:
        '異なるCADシステム間でデータを受け渡す際に使用される中間ファイル形式として最も適切なものはどれか。',
      options: ['STEP', 'DOCX', 'MP4', 'WAV'],
      correctAnswer: 'STEP',
      explanation:
        'STEPは、異なるCADシステム間で製品データを交換するための代表的な標準規格です。',
      point: '異なるCAD間のデータ交換＝STEP。',
    },
    {
      question:
        '製品データの品質を表し、異なるCAD間でのデータ交換時の形状欠落などにも関係する考え方はどれか。',
      options: ['PDQ', 'BOM', 'RAID', 'VPN'],
      correctAnswer: 'PDQ',
      explanation:
        'PDQ（Product Data Quality）は製品データの品質を意味します。CADデータを別システムへ渡した際の形状欠落や不正確な接続など、データ品質上の問題に関係します。',
      point: '製品データの品質＝PDQ。',
    },
    {
      question:
        'CADデータや設計文書、変更履歴など、製品開発に関係するデータを管理するシステムはどれか。',
      options: ['PDM', 'CAM', 'CAE', 'CAT'],
      correctAnswer: 'PDM',
      explanation:
        'PDM（Product Data Management）は、CADデータ、図面、設計文書、変更履歴などの製品データを管理する仕組みです。',
      point: '製品データを管理＝PDM。',
    },
    {
      question: '製品を構成する部品の種類、数量などを管理する部品表を何というか。',
      options: ['BOM', 'DMU', 'PDQ', 'NURBS'],
      correctAnswer: 'BOM',
      explanation:
        'BOM（Bill of Materials）は製品を構成する部品や材料を一覧化した部品表です。',
      point: '部品表＝BOM。',
    },
    {
      question:
        'コンピュータの主記憶装置として、実行中のプログラムやデータを一時的に保持するものはどれか。',
      options: ['RAM', 'SSD', 'CPU', 'GPU'],
      correctAnswer: 'RAM',
      explanation:
        'RAMは、CPUが処理するプログラムやデータを一時的に置いておく主記憶装置です。一般的なRAMは電源を切ると内容が失われます。SSDはデータを長期間保存する補助記憶装置です。',
      point: 'RAM＝作業中のデータを一時保存 ／ SSD＝データを長期保存',
    },
    {
      question: 'HDDと比較した一般的なSSDの特徴として、最も適切なものはどれか。',
      options: [
        '機械的に回転するディスクを使用する',
        '可動部がなく、高速なデータアクセスが可能',
        '必ずHDDより保存容量が大きい',
        '電源を切ると保存データが消える',
      ],
      correctAnswer: '可動部がなく、高速なデータアクセスが可能',
      explanation:
        'SSDは半導体メモリを利用するため、HDDのような回転ディスクや磁気ヘッドなどの機械的な可動部を持ちません。一般に高速なアクセスが可能です。',
      point: 'HDD＝磁気ディスク ／ SSD＝半導体メモリ',
    },
    {
      question: '情報セキュリティの基本的な3要素に含まれないものはどれか。',
      options: ['機密性', '完全性', '可用性', '生産性'],
      correctAnswer: '生産性',
      explanation:
        '情報セキュリティの基本的な3要素は、機密性（Confidentiality）、完全性（Integrity）、可用性（Availability）です。頭文字から「CIA」と呼ばれることもあります。',
      point: '情報セキュリティの3要素＝機密性・完全性・可用性。',
    },
    {
      question:
        '第三者に知られてはならない情報を、許可された人だけが利用できる状態にするという情報セキュリティ上の性質はどれか。',
      options: ['機密性', '完全性', '可用性', '拡張性'],
      correctAnswer: '機密性',
      explanation:
        '機密性とは、許可された人だけが情報にアクセスできる状態を維持することです。対して完全性は「データが勝手に改ざんされていないこと」、可用性は「必要なときに利用できること」を意味します。',
      point: '機密性＝見せない ／ 完全性＝変えさせない ／ 可用性＝使える',
    },
    {
      question:
        '設計した部品について、力を加えた際の応力や変形などをコンピュータ上で解析する技術はどれか。',
      options: ['CAE', 'CAM', 'CAT', 'PDM'],
      correctAnswer: 'CAE',
      explanation:
        'CAE（Computer Aided Engineering）は、コンピュータを利用して設計・解析を支援します。強度、応力、変形、熱、流体などのシミュレーションに利用されます。',
      point: '解析・シミュレーション＝CAE。',
    },
    {
      question:
        'CADモデルをもとに、工作機械による加工のための工具経路やNCデータの作成を支援する技術はどれか。',
      options: ['CAM', 'CAE', 'CAT', 'DMU'],
      correctAnswer: 'CAM',
      explanation:
        'CAM（Computer Aided Manufacturing）はコンピュータによる製造支援です。CADモデルをもとに工具経路を計算し、NC工作機械などで使用するデータを作成できます。',
      point: 'CAM＝製造。',
    },
    {
      question: '製品の検査・試験をコンピュータによって支援する技術はどれか。',
      options: ['CAT', 'CAM', 'CAE', 'CAD'],
      correctAnswer: 'CAT',
      explanation:
        'CAT（Computer Aided Testing）は、コンピュータを利用して製品の検査や試験を支援する技術です。',
      point:
        'CAD＝設計 ／ CAE＝解析 ／ CAM＝製造 ／ CAT＝検査・試験（4つまとめて覚えましょう）',
    },
    {
      question:
        '実際の製品を作る前に、3次元CADモデルを用いて組立性や干渉などを仮想空間で検証する考え方はどれか。',
      options: ['DMU', 'BOM', 'VPN', 'RAID'],
      correctAnswer: 'DMU',
      explanation:
        'DMU（Digital Mock-Up）は、3次元CADモデルを利用してコンピュータ上に仮想的な製品を構築し、組立性や干渉などを検証する方法です。',
      point: '実物の試作品を作る前にデジタルで検証＝DMU。',
    },
    {
      question:
        '実在する製品や部品を3次元スキャナなどで測定し、そのデータをもとにCADモデルを作成する手法はどれか。',
      options: [
        'リバースエンジニアリング',
        'コンカレント・エンジニアリング',
        'パラメトリックモデリング',
        'レンダリング',
      ],
      correctAnswer: 'リバースエンジニアリング',
      explanation:
        '通常は「設計データ→実物」という流れですが、リバースエンジニアリングでは既存の実物を測定・解析してデジタルモデルを作ります。',
      point: '実物 → CADデータ＝リバースエンジニアリング。',
    },
    {
      question:
        '3Dプリンタの方式のうち、熱可塑性樹脂などを加熱してノズルから押し出しながら積層する方式はどれか。',
      options: ['FDM', '光造形', '切削加工', '放電加工'],
      correctAnswer: 'FDM',
      explanation:
        'FDMは、樹脂などを加熱して溶かし、ノズルから押し出して一層ずつ積み上げる造形方式です。',
      point: '熱で溶かす → ノズルから出す → 積む＝FDM。',
    },
    {
      question:
        '3Dプリンタで使用するために、3次元モデルの表面形状を多数の三角形によって近似して表現する代表的なファイル形式はどれか。',
      options: ['STL', 'STEP', 'JPEG', 'PDF'],
      correctAnswer: 'STL',
      explanation:
        'STLは、3次元モデルの表面を多数の三角形（ポリゴン）によって近似して表現するファイル形式です。3Dプリンタへのデータ受け渡しで広く利用されています。STEPとは用途が違うので注意しましょう。',
      point:
        'STEP＝CAD間の製品データ交換 ／ STL＝三角形で表面を近似、3Dプリンタなどで利用',
    },
    {
      question: '3次元CADを製品開発で利用する効果として最も適切なものはどれか。',
      options: [
        'CADを導入すれば実物による試験は一切不要になる',
        '設計情報を3次元化することで、形状の把握や設計検証を行いやすくなる',
        'CADを利用すれば設計変更は発生しなくなる',
        'CADによって製造工程そのものが不要になる',
      ],
      correctAnswer:
        '設計情報を3次元化することで、形状の把握や設計検証を行いやすくなる',
      explanation:
        '3次元CADを利用することで、形状を視覚的に把握したり、干渉確認や解析などを行ったりしやすくなります。ただし、CADは設計や製造を「支援する」道具であり、実物による検証や設計者の知識、製造工程そのものを不要にするものではありません。',
      point: '3次元CAD＝設計・検証を支援する道具。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】製品を構成する一つひとつの部品を表現した3次元モデルを（　　　　　　）モデルという。',
      placeholder: '用語を入力してください',
      correctAnswer: 'パーツ',
      acceptedAnswers: ['パーツ', 'パーツモデル'],
      explanation:
        '一つひとつの部品を表現したものがパーツモデルです。複数のパーツモデルを組み合わせるとアセンブリモデルになります。',
      point: '1部品＝パーツ ／ 複数部品＝アセンブリ',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】複数の部品を組み合わせ、製品全体の構成や部品同士の位置関係を表現したものを（　　　　　　）モデルという。',
      placeholder: '用語を入力してください',
      correctAnswer: 'アセンブリ',
      acceptedAnswers: ['アセンブリ', 'アセンブリモデル'],
      explanation:
        '複数のパーツを組み立てて製品全体を表現したモデルです。部品同士の位置関係や干渉などを確認できます。',
      point: 'Assembly＝組み立て。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】2次元の断面形状を直線方向に移動させて3次元形状を作成する操作を（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: '押し出し',
      acceptedAnswers: ['押し出し', 'おしだし', '押出し'],
      explanation:
        '2次元形状をまっすぐ移動させて立体を作ります。例えば円を押し出すと円柱になります。',
      point: 'まっすぐ伸ばす＝押し出し（Extrude）。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】複数の異なる断面形状を滑らかにつないで立体や曲面を作成する機能を（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'ロフト',
      acceptedAnswers: ['ロフト', 'ろふと'],
      explanation:
        '複数の断面形状を滑らかにつなぎ、途中で形状が変化するような立体・曲面を作ります。',
      point: '複数の断面をつなぐ＝ロフト。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】断面形状を指定された経路に沿って移動させて立体や曲面を作成する機能を（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'スイープ',
      acceptedAnswers: ['スイープ', 'すいーぷ'],
      explanation:
        '断面を決められた経路に沿って移動させます。曲がったパイプなどをイメージすると分かりやすいです。',
      point: '押し出し＝直線方向 ／ スイープ＝経路に沿う ／ ロフト＝複数断面をつなぐ',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】複数の立体に対して「和・差・積」を行って新しい形状を作る演算を（　　　　　　）演算という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'ブーリアン',
      acceptedAnswers: ['ブーリアン', 'ブーリアン演算', 'ぶーりあん'],
      explanation:
        '立体同士を足したり、引いたり、共通部分だけを取り出したりする演算です。',
      point: '和＝合わせる ／ 差＝削る ／ 積＝重なったところ',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】自由曲線や自由曲面を数学的に表現するために3次元CADで広く利用される手法の一つを（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'NURBS',
      acceptedAnswers: ['NURBS', 'nurbs'],
      explanation:
        'NURBSは、滑らかな自由曲線・自由曲面を数学的に表現できる方法です。複雑な曲面を持つ製品のモデリングなどで利用されます。',
      point: '滑らかな自由曲線・自由曲面＝NURBS。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】立体を頂点・稜線・面などの「境界」によって表現する方式を（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'B-reps',
      acceptedAnswers: ['B-reps', 'b-reps', 'BREPS', 'breps', 'B-rep', 'b-rep'],
      explanation:
        'B-repsはBoundary Representationの略です。立体の境界を構成する頂点、稜線、面などによって形状を表現します。',
      point: 'Boundary＝境界 → B-reps。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】直方体、円柱、球などの基本立体を組み合わせてソリッドモデルを表現する方式を（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'CSG',
      acceptedAnswers: ['CSG', 'csg'],
      explanation:
        'CSGは基本立体をブーリアン演算などによって組み合わせて複雑な立体を作る方式です。',
      point: 'B-reps＝境界で表現 ／ CSG＝基本立体を組み合わせて表現',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】異なるCADシステム間で製品データを交換するための代表的な標準規格の一つを（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'STEP',
      acceptedAnswers: ['STEP', 'step'],
      explanation:
        'STEPは異なるCADシステム間で製品データを交換するために利用される代表的な標準規格です。',
      point: 'CAD ↔ CAD＝STEP。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】CADデータや設計文書、変更履歴などの製品データを管理する仕組みを、アルファベット3文字で（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'PDM',
      acceptedAnswers: ['PDM', 'pdm'],
      explanation:
        'PDM（Product Data Management）は、製品開発に関係するさまざまなデータを一元的に管理する仕組みです。',
      point: 'Product Data Management＝PDM。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】製品を構成する部品や材料などをまとめた「部品表」を、アルファベット3文字で（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'BOM',
      acceptedAnswers: ['BOM', 'bom'],
      explanation:
        'BOM（Bill of Materials）は、製品に必要な部品や材料、その数量などをまとめた部品表です。',
      point: 'Bill of Materials＝部品表＝BOM。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】コンピュータを利用して、製品の強度、変形、熱、流体などを解析・シミュレーションする技術を（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'CAE',
      acceptedAnswers: ['CAE', 'cae'],
      explanation:
        'CAE（Computer Aided Engineering）は、設計した製品の強度、変形、熱、流体などをコンピュータ上で解析するために利用されます。',
      point: 'CAE＝解析・シミュレーション。',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】コンピュータを利用して製造を支援し、CADデータから工作機械用の工具経路やNCデータを作成する技術を（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'CAM',
      acceptedAnswers: ['CAM', 'cam'],
      explanation:
        'CAM（Computer Aided Manufacturing）は製造支援の技術です。CADで作った形状を、実際に工作機械でどう加工するかにつなげます。',
      point: 'CAD＝設計 ／ CAM＝製造',
    },
    {
      type: 'fill',
      question:
        '【Part 2 重要用語 穴埋め問題】3次元CADモデルを使って仮想的な製品を構築し、実物を製作する前に組立性や干渉などを検証する仕組みを（　　　　　　）という。',
      placeholder: '用語を入力してください',
      correctAnswer: 'DMU',
      acceptedAnswers: ['DMU', 'dmu'],
      explanation:
        'DMU（Digital Mock-Up）は「デジタル上の試作品」と考えると分かりやすいです。実物の試作品を作る前に、組立性や部品同士の干渉などを検証できます。',
      point: 'Digital Mock-Up＝DMU＝デジタル上で試作・検証。',
    },
  ],
};
