import type { QuizDataset } from '../types/quiz';

export const exam6Dataset: QuizDataset = {
  id: 'exam6_45',
  group: 'practice_set_1_2',
  title: '第6回 3次元CAD利用技術者試験',
  description:
    'Part 1（選択問題30問）＋ Part 2（文章穴埋め問題15問・複数空欄対応）を完全収録。',
  questions: [
    // Part 1 選択問題（問題1〜30）
    {
      question:
        'コンピュータの中央処理装置であり、プログラムの命令を実行したり、各装置を制御したりする役割を持つものはどれか。',
      options: ['SSD', 'RAM', 'CPU', 'HDD'],
      correctAnswer: 'CPU',
      explanation:
        'CPUはコンピュータの中心的な処理装置です。プログラムの命令を実行し、さまざまな計算や制御を行います。',
      point: 'CPU＝コンピュータの頭脳。Central Processing Unitの略。',
    },
    {
      question:
        'CPUの動作周波数を表す単位として、最も適切なものはどれか。',
      options: ['Hz', 'Byte', 'dpi', 'pixel'],
      correctAnswer: 'Hz',
      explanation:
        'Hz（ヘルツ）は、1秒間に何回の周期があるかを表す単位です。CPUの動作周波数は、一般にGHzなどで表されます。',
      point:
        '1 GHz＝10億 Hz。ただし、動作周波数だけでCPUの性能が決まるわけではありません。',
    },
    {
      question:
        'CPUにおける「コア」の説明として、最も適切なものはどれか。',
      options: [
        'データを長期間保存する装置',
        '画面に画像を表示するための端子',
        'インターネットに接続するためのケーブル',
        '命令を処理する演算処理の中心となる部分',
      ],
      correctAnswer: '命令を処理する演算処理の中心となる部分',
      explanation:
        'コアはCPUの内部で命令を処理する部分です。複数のコアを持つCPUでは、複数の処理を並行して実行できます。',
      point: 'マルチコアCPU＝複数の処理コアを持つCPU。',
    },
    {
      question:
        '3次元CADで複雑なモデルを回転・拡大・縮小して表示する際、画像の描画処理を高速化するために利用されるものはどれか。',
      options: ['HDD', 'GPU', 'LAN', 'USB'],
      correctAnswer: 'GPU',
      explanation:
        'GPUは画像や図形の描画を得意とする処理装置です。3次元CADでは、複雑なモデルを滑らかに表示するために重要な役割を持ちます。',
      point: 'CPU＝主に計算・制御、GPU＝主に画像・図形の並列処理。',
    },
    {
      question:
        'コンピュータで実行中のプログラムや作業中のデータを一時的に保存する装置はどれか。',
      options: ['RAM', 'SSD', 'HDD', 'DVD'],
      correctAnswer: 'RAM',
      explanation:
        'RAMは主記憶装置として利用されます。CADソフトウェアの実行中に必要なプログラムやモデルのデータなどを一時的に保持します。',
      point:
        'RAM＝作業机のようなもの。容量が大きいほど、多くのデータを同時に扱いやすくなります。',
    },
    {
      question:
        '一般的なRAMの特徴として、最も適切なものはどれか。',
      options: [
        '電源を切っても必ずデータが保存される',
        '紙に印刷するための装置である',
        '電源を切ると記憶内容が失われる',
        'CAD専用の画像処理装置である',
      ],
      correctAnswer: '電源を切ると記憶内容が失われる',
      explanation:
        '一般的な主記憶用RAMは揮発性メモリです。電源が切れると保存していた内容が失われます。',
      point:
        'RAM＝揮発性。SSDやHDD＝電源を切ってもデータを保存できる。',
    },
    {
      question:
        'CPUが頻繁に使用するデータや命令を高速に読み出すため、CPUの近くや内部に設けられる記憶装置はどれか。',
      options: [
        '光学ディスク',
        'キャッシュメモリ',
        '外付けHDD',
        'USBメモリ',
      ],
      correctAnswer: 'キャッシュメモリ',
      explanation:
        'キャッシュメモリは、CPUがよく使用するデータを高速に読み出せるようにするための記憶装置です。',
      point:
        'キャッシュメモリは、CPUと主記憶装置の速度差を補う役割があります。',
    },
    {
      question:
        'コンピュータの主記憶装置の容量が不足した場合に、CADソフトウェアの動作に起こり得る現象として最も適切なものはどれか。',
      options: [
        'CADデータが自動的に高精度になる',
        'CPUのコア数が自動的に増加する',
        'ディスプレイの物理的な大きさが変わる',
        'データの読み書きが増えて処理速度が低下する場合がある',
      ],
      correctAnswer:
        'データの読み書きが増えて処理速度が低下する場合がある',
      explanation:
        'RAMが不足すると、SSDなどのストレージを仮想メモリとして使用する場合があります。ストレージはRAMより遅いため、CADの動作が重くなることがあります。',
      point: 'RAM不足は、ソフトウェアの動作速度低下の原因になります。',
    },
    {
      question:
        'コンピュータの基本ソフトウェアであり、ハードウェアやアプリケーションの動作を管理するものはどれか。',
      options: ['CAD', 'CAM', 'OS', 'BOM'],
      correctAnswer: 'OS',
      explanation:
        'OSは、コンピュータのハードウェアやアプリケーションを管理する基本ソフトウェアです。Windows、macOS、Linuxなどが代表例です。',
      point: 'OS＝Operating System（オペレーティングシステム）。',
    },
    {
      question:
        '3次元CADソフトウェアを実行するためのコンピュータを選ぶ際、最も適切な考え方はどれか。',
      options: [
        'CADソフトウェアが要求するCPU、メモリ、GPUなどの仕様を確認する',
        'ディスプレイの色だけで選ぶ',
        'ファイル名が短いコンピュータを選ぶ',
        'CPUの動作周波数だけで、すべての性能が決まると考える',
      ],
      correctAnswer:
        'CADソフトウェアが要求するCPU、メモリ、GPUなどの仕様を確認する',
      explanation:
        'CADソフトウェアによって必要な性能は異なります。使用するソフトウェアの推奨動作環境を確認することが重要です。',
      point:
        'PC選びではCPU・RAM・GPU・ストレージなどを総合的に確認します。',
    },
    {
      question: 'HDDの記憶方式として、最も適切なものはどれか。',
      options: [
        '光を使って紙に情報を印刷する',
        '回転する磁気ディスクにデータを記録する',
        'CPUの内部で演算結果だけを保存する',
        '液晶画面にデータを表示する',
      ],
      correctAnswer: '回転する磁気ディスクにデータを記録する',
      explanation:
        'HDDは、内部で回転する磁気ディスクにデータを記録します。大容量のデータ保存に利用されます。',
      point: 'HDD＝磁気ディスクを回転させる記憶装置。',
    },
    {
      question: 'SSDの一般的な特徴として、最も適切なものはどれか。',
      options: [
        '必ずHDDより容量が大きい',
        '電源を切ると保存したデータが消える',
        '回転する磁気ディスクを使用する',
        '半導体メモリを使用し、機械的な可動部を持たない',
      ],
      correctAnswer: '半導体メモリを使用し、機械的な可動部を持たない',
      explanation:
        'SSDは半導体メモリにデータを記録します。HDDのような回転ディスクがなく、一般に高速な読み書きが可能です。',
      point: 'SSD＝半導体メモリ。HDD＝磁気ディスク。',
    },
    {
      question:
        'コンピュータで扱うデータ容量の単位として、一般に最も大きいものはどれか。',
      options: ['TB', 'MB', 'KB', 'GB'],
      correctAnswer: 'TB',
      explanation:
        'データ容量の単位にはKB、MB、GB、TBなどがあります。一般に、この順番で容量が大きくなります。',
      point: 'KB ＜ MB ＜ GB ＜ TB',
    },
    {
      question:
        '3次元CADで作成したファイルを保存する目的として、最も適切なものはどれか。',
      options: [
        'GPUの性能を高めるため',
        'モデルの体積を自動的に減らすため',
        '作成した設計情報を後から再利用・編集できるようにするため',
        'ネットワークの通信速度を必ず高めるため',
      ],
      correctAnswer:
        '作成した設計情報を後から再利用・編集できるようにするため',
      explanation:
        'CADデータには形状や寸法、設計に関する情報などが含まれます。保存しておくことで、後から設計変更や再利用ができます。',
      point: 'CADデータは、形状だけでなく設計情報を保存するためにも重要です。',
    },
    {
      question:
        '異なるCADソフトウェア間でデータを受け渡す場合に、特に注意すべきことはどれか。',
      options: [
        '画面の背景色が一致しているか',
        '形状や属性などの情報が正しく変換されているか',
        '使用するマウスのメーカーが同じか',
        'ファイル名が必ず英語になっているか',
      ],
      correctAnswer: '形状や属性などの情報が正しく変換されているか',
      explanation:
        '異なるCADソフトウェア間でデータを変換すると、形状の欠落や属性情報の消失などが起こる場合があります。',
      point:
        'CADデータの交換後は、形状や必要な情報が正しく保持されているか確認します。',
    },
    {
      question: '設計データのバックアップを作成する主な目的はどれか。',
      options: [
        'モデルの寸法を自動修正するため',
        'CADソフトウェアの価格を下げるため',
        'ディスプレイの解像度を高めるため',
        '故障や誤操作などによるデータ消失に備えるため',
      ],
      correctAnswer: '故障や誤操作などによるデータ消失に備えるため',
      explanation:
        'バックアップは、機器の故障、誤操作、データ破損などが起こった場合に、データを復元できるようにするためのものです。',
      point: 'バックアップ＝データ消失に備えた複製。',
    },
    {
      question: 'RAID 1の一般的な特徴として、最も適切なものはどれか。',
      options: [
        '複数の記憶装置に同じデータを保存する',
        '複数のCPUで同時に計算する',
        'CADモデルを自動的に3Dプリントする',
        '画像データを三角形の集合に変換する',
      ],
      correctAnswer: '複数の記憶装置に同じデータを保存する',
      explanation:
        'RAID 1は、複数の記憶装置に同じデータを保存する方式です。これをミラーリングといいます。',
      point:
        'RAID 1＝ミラーリング。ただし、RAIDはバックアップの代わりにはなりません。',
    },
    {
      question: 'RAID 0の一般的な特徴として、最も適切なものはどれか。',
      options: [
        '同じデータを複数の装置に複製して保存する',
        'データを自動的に暗号化する',
        '複数の記憶装置にデータを分散して読み書きするが、冗長性はない',
        'ネットワークを通じてCADモデルを表示する',
      ],
      correctAnswer:
        '複数の記憶装置にデータを分散して読み書きするが、冗長性はない',
      explanation:
        'RAID 0は、複数の記憶装置にデータを分散して保存する方式です。読み書きの高速化が期待できますが、故障に対する冗長性はありません。',
      point: 'RAID 0＝ストライピング。RAID 1＝ミラーリング。',
    },
    {
      question:
        '製品を構成する部品の名称、種類、数量などをまとめた一覧表はどれか。',
      options: ['PDQ', 'BOM', 'CAE', 'NURBS'],
      correctAnswer: 'BOM',
      explanation:
        'BOMは部品表のことです。製品を構成する部品の種類や数量などを管理するために利用します。',
      point: 'BOM＝Bill of Materials（部品表）。',
    },
    {
      question:
        'CADデータ、設計図面、設計変更の履歴などを一元的に管理する仕組みはどれか。',
      options: ['CAM', 'CAT', 'STL', 'PDM'],
      correctAnswer: 'PDM',
      explanation:
        'PDMは、製品開発に関するデータを管理する仕組みです。CADデータ、設計図面、変更履歴などを管理できます。',
      point: 'PDM＝Product Data Management（製品データ管理）。',
    },
    {
      question:
        'PDMによって設計データの変更履歴を管理する主なメリットとして、最も適切なものはどれか。',
      options: [
        '誰がいつ、どのような変更を行ったかを確認しやすくなる',
        'CADソフトウェアが不要になる',
        '製品の重量が必ず軽くなる',
        'すべての設計ミスが自動的になくなる',
      ],
      correctAnswer:
        '誰がいつ、どのような変更を行ったかを確認しやすくなる',
      explanation:
        '変更履歴を管理することで、設計変更の内容や担当者、変更時期などを確認しやすくなります。',
      point: 'PDMは、複数人で設計データを管理するときに特に役立ちます。',
    },
    {
      question:
        '複数の設計者が同じ製品のCADデータを扱う際、ファイルの変更や更新による混乱を防ぐために重要なものはどれか。',
      options: [
        'シェーディング',
        'フィレット',
        'バージョン管理',
        'マスプロパティ',
      ],
      correctAnswer: 'バージョン管理',
      explanation:
        'バージョン管理は、ファイルの変更履歴や版を管理する仕組みです。古い設計データと新しい設計データの混同を防ぎます。',
      point: 'バージョン管理＝設計データの更新履歴を管理すること。',
    },
    {
      question:
        'ある設計者が編集中のCADファイルを、別の設計者が同時に上書きしてしまう問題を防ぐ仕組みとして、最も適切なものはどれか。',
      options: [
        'レンダリング',
        'チェックアウト・ロック管理',
        'ロフト',
        'スイープ',
      ],
      correctAnswer: 'チェックアウト・ロック管理',
      explanation:
        'チェックアウトやロック管理によって、編集中のデータが他の設計者によって不用意に上書きされることを防ぎます。',
      point:
        'チェックアウト＝編集のために取り出す。チェックイン＝編集したデータを管理システムに戻す。',
    },
    {
      question:
        '企業内や学校内など、比較的限られた範囲でコンピュータ同士を接続するネットワークはどれか。',
      options: ['WAN', 'VPN', 'WWW', 'LAN'],
      correctAnswer: 'LAN',
      explanation:
        'LANは、学校や企業、家庭などの比較的限られた範囲で利用されるネットワークです。',
      point: 'LAN＝Local Area Network。',
    },
    {
      question:
        'ネットワークに接続された機器を識別するために使用される論理的なアドレスはどれか。',
      options: [
        'IPアドレス',
        'CADファイル名',
        '画面解像度',
        'フィーチャ名',
      ],
      correctAnswer: 'IPアドレス',
      explanation:
        'IPアドレスは、ネットワーク上の機器を識別し、通信先を指定するために使用されます。',
      point: 'IPアドレス＝ネットワーク上の通信先を示すアドレス。',
    },
    {
      question:
        'ネットワーク機器の通信インターフェースに割り当てられる識別情報はどれか。',
      options: [
        'IPアドレス',
        'ファイル拡張子',
        'MACアドレス',
        'パスワード',
      ],
      correctAnswer: 'MACアドレス',
      explanation:
        'MACアドレスは、ネットワーク機器の通信インターフェースを識別するための情報です。',
      point:
        'IPアドレス＝論理的なアドレス。MACアドレス＝通信インターフェースの識別情報。',
    },
    {
      question:
        'インターネットなどの公衆ネットワーク上で、暗号化などを利用して安全な通信経路を構築する技術はどれか。',
      options: ['STL', 'VPN', 'BOM', 'NURBS'],
      correctAnswer: 'VPN',
      explanation:
        'VPNは、インターネットなどを利用して仮想的な専用ネットワークを構築する技術です。暗号化などによって通信の安全性を高めることができます。',
      point: 'VPN＝Virtual Private Network（仮想専用ネットワーク）。',
    },
    {
      question:
        '情報セキュリティの基本的な3要素として、正しい組み合わせはどれか。',
      options: [
        '速度・容量・解像度',
        '形状・寸法・質量',
        '設計・製造・検査',
        '機密性・完全性・可用性',
      ],
      correctAnswer: '機密性・完全性・可用性',
      explanation:
        '情報セキュリティでは、機密性・完全性・可用性の3つが重要です。',
      point:
        '機密性＝許可された人だけが使える。完全性＝情報が正確に保たれる。可用性＝必要なときに使える。',
    },
    {
      question:
        '設計データが、許可されていない第三者によって勝手に書き換えられていない状態を保つことは、情報セキュリティのどの性質に該当するか。',
      options: ['完全性', '機密性', '可用性', '拡張性'],
      correctAnswer: '完全性',
      explanation:
        '完全性は、情報が不正に変更されたり破壊されたりせず、正確な状態に保たれていることを意味します。',
      point: '完全性＝情報が正しく保たれていること。',
    },
    {
      question:
        '企業の重要なCADデータを管理する方法として、最も適切なものはどれか。',
      options: [
        '全員が同じパスワードを使用する',
        'バックアップを作成せず、1台のPCだけに保存する',
        '利用者ごとにアクセス権限を設定し、定期的にバックアップを取得する',
        '設計データを誰でも編集できるように公開する',
      ],
      correctAnswer:
        '利用者ごとにアクセス権限を設定し、定期的にバックアップを取得する',
      explanation:
        '重要な設計データを守るためには、利用者ごとに適切な権限を設定し、データ消失に備えてバックアップを取得することが重要です。',
      point:
        'データ管理の基本は、アクセス権限・バックアップ・変更履歴の管理。',
    },

    // Part 2 文章穴埋め問題（問題31〜45）
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】コンピュータの中央処理装置を（ A ）といい、3次元CADの画面描画などに利用される画像処理装置を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'CPU',
          acceptedAnswers: ['CPU', 'cpu'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'GPU',
          acceptedAnswers: ['GPU', 'gpu'],
        },
      ],
      explanation:
        'CPUはプログラムの命令を実行する中心的な処理装置です。GPUは画像や図形の描画処理などを得意とします。',
      point: 'CPU＝中央処理装置。GPU＝画像処理装置。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】コンピュータの処理装置で、実際に命令を処理する中心的な部分を（ A ）といい、その動作周波数は一般に（ B ）という単位で表される。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'コア',
          acceptedAnswers: ['コア', 'こあ'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る単位',
          correctAnswer: 'Hz',
          acceptedAnswers: ['Hz', 'hz', 'ヘルツ', 'Hz（ヘルツ）', 'GHz'],
        },
      ],
      explanation:
        'CPUのコアは命令を処理する部分です。動作周波数はHzで表され、一般にGHzなどの単位が使われます。',
      point: 'コア数と動作周波数は、CPUの性能を考える際の代表的な要素です。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】実行中のプログラムやデータを一時的に保存する主記憶装置を（ A ）という。また、CPUが頻繁に使用するデータを高速に読み出すための記憶装置を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'RAM',
          acceptedAnswers: ['RAM', 'ram', 'メモリ', '主記憶装置'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'キャッシュメモリ',
          acceptedAnswers: ['キャッシュメモリ', 'キャッシュ', 'きゃっしゅめもり'],
        },
      ],
      explanation:
        'RAMは作業中のデータを保持します。キャッシュメモリはCPUがよく使うデータを高速に読み出すために使われます。',
      point:
        'RAM＝主記憶装置。キャッシュメモリ＝CPUの処理を助ける高速な記憶装置。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】コンピュータのハードウェアやアプリケーションの動作を管理する基本ソフトウェアを、アルファベット2文字で（ A ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'OS',
          acceptedAnswers: ['OS', 'os', 'オペレーティングシステム'],
        },
      ],
      explanation:
        'OSはコンピュータの基本的な動作を管理するソフトウェアです。',
      point: 'Windows、macOS、LinuxなどはOSの例です。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】回転する磁気ディスクにデータを保存する装置を（ A ）といい、半導体メモリを利用してデータを保存する装置を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'HDD',
          acceptedAnswers: ['HDD', 'hdd', 'ハードディスク', 'ハードディスクドライブ'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'SSD',
          acceptedAnswers: ['SSD', 'ssd', 'ソリッドステートドライブ'],
        },
      ],
      explanation:
        'HDDは回転する磁気ディスクにデータを保存します。SSDは半導体メモリにデータを保存します。',
      point: 'HDD＝磁気ディスク。SSD＝半導体メモリ。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】複数のストレージを組み合わせて利用する技術を（ A ）という。そのうち、同じデータを複数の記憶装置に保存する方式を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'RAID',
          acceptedAnswers: ['RAID', 'raid'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る方式',
          correctAnswer: 'RAID 1',
          acceptedAnswers: ['RAID 1', 'RAID1', 'raid1', 'raid 1'],
        },
      ],
      explanation:
        'RAIDは複数のストレージを組み合わせて利用する技術です。RAID 1では、同じデータを複数の装置に保存します。',
      point: 'RAID 0＝ストライピング。RAID 1＝ミラーリング。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】設計データが消失した場合に備えて、別の場所や記憶装置にデータの複製を保存することを（ A ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'バックアップ',
          acceptedAnswers: ['バックアップ', 'ばっくあっぷ', 'backup'],
        },
      ],
      explanation:
        'バックアップは、データが消失した場合に復元できるようにするためのものです。',
      point:
        'バックアップは、機器の故障や誤操作などに備える基本的な対策です。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】製品を構成する部品の名称、種類、数量などをまとめた部品表を（ A ）という。また、CADデータや設計文書などを一元的に管理する仕組みを（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'BOM',
          acceptedAnswers: ['BOM', 'bom'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'PDM',
          acceptedAnswers: ['PDM', 'pdm'],
        },
      ],
      explanation:
        'BOMは部品表です。PDMはCADデータや設計文書、変更履歴などを管理する仕組みです。',
      point: 'BOM＝部品表。PDM＝製品データ管理。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】設計データの更新履歴を管理し、過去の状態を確認できるようにすることを（ A ）管理という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'バージョン',
          acceptedAnswers: ['バージョン', 'ばーじょん', 'バージョン管理'],
        },
      ],
      explanation:
        'バージョン管理によって、設計データの変更履歴や過去の状態を確認できます。',
      point: 'バージョン管理＝ファイルの変更履歴を管理すること。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】複数の設計者が同じCADデータを扱う際、編集対象のファイルを確保する操作を（ A ）、編集が完了したファイルを管理システムへ戻す操作を（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'チェックアウト',
          acceptedAnswers: ['チェックアウト', 'ちぇっくあうと'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'チェックイン',
          acceptedAnswers: ['チェックイン', 'ちぇっくいん'],
        },
      ],
      explanation:
        'チェックアウトは編集するためにファイルを取り出す操作です。チェックインは編集したファイルを管理システムに戻す操作です。',
      point: 'チェックアウト＝取り出す。チェックイン＝戻す。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】学校や企業などの限られた範囲で構築されるネットワークを（ A ）という。また、ネットワーク上の機器を識別するために使用する論理的なアドレスを（ B ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'LAN',
          acceptedAnswers: ['LAN', 'lan'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: 'IPアドレス',
          acceptedAnswers: ['IPアドレス', 'ipアドレス', 'IP'],
        },
      ],
      explanation:
        'LANは学校や企業などで利用されるネットワークです。IPアドレスはネットワーク上の機器を識別するために使用されます。',
      point:
        'LAN＝構内ネットワーク。IPアドレス＝通信先を識別するアドレス。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】ネットワーク機器の通信インターフェースに割り当てられる識別情報を（ A ）アドレスという。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'MAC',
          acceptedAnswers: ['MAC', 'mac', 'MACアドレス'],
        },
      ],
      explanation:
        'MACアドレスはネットワーク機器の通信インターフェースを識別するために使用されます。',
      point: 'MACアドレス＝ネットワークインターフェースの識別情報。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】インターネットなどを利用して、安全な仮想専用ネットワークを構築する技術を（ A ）という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'VPN',
          acceptedAnswers: ['VPN', 'vpn'],
        },
      ],
      explanation:
        'VPNは、インターネットなどの公衆ネットワークを利用して、仮想的な専用ネットワークを構築する技術です。',
      point: 'VPN＝Virtual Private Network。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】情報セキュリティの基本的な3要素は、許可された人だけが情報を利用できる（ A ）、情報が正確で不正に変更されていない（ B ）、必要なときに情報を利用できる（ C ）である。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: '機密性',
          acceptedAnswers: ['機密性', 'きみつせい'],
        },
        {
          label: 'B',
          placeholder: 'Bに入る用語',
          correctAnswer: '完全性',
          acceptedAnswers: ['完全性', 'かんぜんせい'],
        },
        {
          label: 'C',
          placeholder: 'Cに入る用語',
          correctAnswer: '可用性',
          acceptedAnswers: ['可用性', 'かようせい'],
        },
      ],
      explanation:
        '機密性は許可された人だけが情報を利用できること、完全性は情報が正確に保たれること、可用性は必要なときに利用できることを意味します。',
      point: '情報セキュリティの3要素＝機密性・完全性・可用性。',
    },
    {
      type: 'multi_fill',
      question:
        '【Part 2 文章穴埋め】CADデータの閲覧や編集を、許可された利用者だけが行えるように制限する仕組みを（ A ）管理という。',
      blanks: [
        {
          label: 'A',
          placeholder: 'Aに入る用語',
          correctAnswer: 'アクセス権限',
          acceptedAnswers: [
            'アクセス権限',
            'アクセス制御',
            'アクセスせいぎょ',
            'アクセス権限管理',
            'アクセス制御管理',
          ],
        },
      ],
      explanation:
        'アクセス権限を設定することで、利用者ごとに閲覧や編集などの操作を制限できます。',
      point: 'アクセス権限＝誰が何をできるかを決める仕組み。',
    },
  ],
};
