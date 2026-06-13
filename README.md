# 射形コーチ 🏹（無料・スマホ最優先・完全クライアントサイド版）

アーチェリーの射形を**スマホのカメラでリアルタイムに分析**し、日本語でアドバイスを返すPWAアプリ。

**このプロジェクトは以下の最重要指示を厳守して開発されています。**

## 開発前提（厳守）
- スマホ使用を最優先（モバイルファースト）
- PWA必須（ホーム画面追加でネイティブアプリのように動作）
- タッチ操作最適化・レスポンシブ徹底
- iOS / Android ブラウザでの快適動作を最優先

## 無料制限（完全遵守）
- 有料API・サービス・ライブラリ・モデルは一切使用していません
- APIキー・アカウント登録が必要な外部サービスは一切使用していません
- npm install などは一切行っていません
- 商用pose estimationサービスは一切使用していません
- サーバーサイド課金・外部依存は一切ありません

## セキュリティ最優先ルール（完全遵守）
- すべての処理は**ブラウザ内（クライアントサイド）のみ**で完結
- カメラ映像・分析結果・ユーザー情報は**外部サーバーへ一切送信しません**
- カメラ映像は一時的な処理のみ。自動保存・ログ・外部送信は一切行いません
- デバイス上の永続保存は**ユーザーが明示的に「保存する」ボタンを押した場合のみ**行います
- 不要な外部リソースの読み込みを極力排除（Tailwind CDNなどは使用していません）

## 技術構成（無料範囲のみ）
- 単一HTMLファイル（必要最小限の追加ファイル：manifest, sw, icon）
- MediaPipe Pose Landmarker（ブラウザ版・CDN経由・公式無料公開モデル）
  - https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/...
  - Google公式無料公開モデル（storage.googleapis.com）
- 完全ローカル処理（簡易HTTPサーバーは開発確認用のみ）
- PWA: manifest.json + sw.js（自前アセットのみキャッシュ）
- 画面常時ON: Screen Wake Lock API（無料・標準Web API）

## 動作の特徴
- リリースを検知しても**自動では保存しません**
- 「保存する」ボタンをユーザーが押したときのみ localStorage に残ります
- ページ再読み込みで明示保存していないものは消えます
- 「スナップ」もユーザーがボタンを押したときのみPNG保存します

## 使い方（本番推奨：GitHub PagesでHTTPS公開）【これでモデル読み込み失敗を根本解決】

**GitHub Pages（HTTPS）を使うと、iOS/AndroidでPWAの完全オフライン・Cache API・Service Workerが正しく動作します。LAN HTTPサーバーは開発テスト用でiOSでは制限が多く、モデル読み込み失敗の原因になります。**

### 1. GitHubに**完全に新しいリポジトリ**を作成（重要：Claude Fable 5など既存のものに絶対干渉しない）
- GitHub.com にログイン
- 「New repository」をクリック
- Repository name: `archery-form` または `archery-pose-coach` など（**新しい名前を付けてください**。既存のClaude Fable 5リポジトリやサーバーには**絶対に**使わない・プッシュしない）
- Public または Private（PagesはPublicで無料）
- **Add a README file はチェックしない**（後で上書き）
- Create repository

### 2. このプロジェクトを新しいGitHubリポジトリにプッシュ（このフォルダのみ操作）
まず認証:
```powershell
cd C:\Users\eita2\Projects\archery-form
gh auth login
```
（ブラウザでログイン。claude fable 5とは無関係の新しいアカウント/トークンでOK）

次に新しいリポジトリ作成 + プッシュ（**新しい名前** "archery-form-pwa" を使用。claude fable 5に干渉しない）:
```powershell
gh repo create archery-form-pwa --public --source=. --remote=origin --push
```

これで自動的に https://あなたのユーザー名.github.io/archery-form-pwa/ が準備されます。

### 3. GitHub Pagesを有効化（HTTPSオン）
gh コマンドで自動設定も可能ですが、Webで:
- リポジトリページ（gh create 後に表示） → Settings → Pages
- Source: Deploy from a branch → `main` / root
- Save
- 1-2分後、URL: `https://あなたのユーザー名.github.io/archery-form-pwa/`

これがスマホで開く本番URLです。

### 4. スマホでアクセス・オフライン準備・PWAインストール
- スマホのブラウザ（Safari/Chrome）で **そのHTTPS URL** を開く（例: https://yourname.github.io/archery-form/）
- **「オフライン準備」ボタン** をタップ（初回のみ、モデルなどをキャッシュ）
- カメラ許可
- ページ下部やブラウザメニューから「ホーム画面に追加」（PWAインストール）
- 以後、ホーム画面のアイコンから起動可能。Wi-Fiオフでも完全オフラインで動作します。

**これでモデル読み込み失敗はHTTPSにより解決します。**

### ローカル開発/テスト用（任意、GitHub公開後不要）
ローカルサーバー例（PCブラウザ用）:
```powershell
cd Projects/archery-form
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1
```
→ http://localhost:8741/

スマホLANテスト用（開発時のみ）:
- `start-iphone-server.bat` をダブルクリック
- スマホから表示されたIP:8742を開く（ただしHTTPSでないのでiOS制限あり）

### 更新時
- コード変更 → `git add . ; git commit -m "update" ; git push`
- Pagesが自動再デプロイされます。

## 完全オフライン対応
- Service Worker が MediaPipeのJSバンドル、WASMランタイム、poseモデルをキャッシュします。
- 1回「オフライン準備」を実行すれば、以後インターネットなしの場所（練習場など）でも起動・リアルタイム分析が可能です。
- 準備ボタンは「再ダウンロード」でも使えます（モデル更新時など）。
- モデルデータは準備時に IndexedDB に保存され、以降は blob URL でオフライン読み込みします（Cache API が使えない環境でもモデルロードが安定するよう強化）。

### ローカルサーバー例（PCブラウザ用）
```powershell
cd Projects/archery-form
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1
```
→ http://localhost:8741/

### スマホ（iPhone/Android）で起動する方法（実用的な手順）

スマホで使うのが前提なので、**PCを簡易サーバーにして同じWi-Fi内のスマホからアクセス**します。

**重要警告（PWA/オフラインの制限）**:
- このLANサーバー（http://192.168.x.x:8742/）は**非セキュアHTTP**です。
- Service Worker と Cache API（完全なPWAオフライン、インストールの信頼性）は、**HTTPS または localhost** のセキュアコンテキストでしかフルに動作しません。
- したがって、スマホからLAN経由で開いた場合、「オフライン準備」は成功しても `caches.match` によるUI確認が失敗し「キャッシュ確認不可」になることがあります。
- しかし、**実際のオフライン動作**（SWがリクエストをキャッシュから返す）は、準備中にフェッチが成功していれば多くの場合働きます。
- **本番推奨**: GitHub Pages / Netlify / Vercel などの無料HTTPSホスティングにデプロイしてください。HTTPSならPWAインストールとオフラインが確実になります。

**PC側でサーバーを起動**
1. `start-iphone-server.bat` をダブルクリック（一番簡単）
   - または PowerShell で:
     ```powershell
     cd C:\Users\eita2\Projects\archery-form
     powershell -NoProfile -ExecutionPolicy Bypass -File serve-iphone.ps1
     ```
2. コンソールに PC のローカルIPアドレスが表示されます（例: `http://192.168.11.5:8742/`）。
   - 複数のIPが出てきたら、Wi-Fiに繋がっている方のIPを選んでください。

**スマホ側**
1. スマホとPCが**同じWi-Fi**に接続されていることを確認（スマホのモバイルデータはオフ）。
2. スマホのブラウザで PC のIPアドレス + ポートを開く  
   例: `http://192.168.11.5:8742/`
3. ページが開いたら、すぐに **「オフライン準備」** ボタンをタップ（初回のみ必要。モデルをダウンロードします）。
   - 成功しても「キャッシュ確認不可」が出る場合があります。これはLANのHTTP制限によるもので、実際のオフライン動作には影響しないことが多いです。
4. カメラの許可を出す。
5. 分析を試す。

**ホーム画面に追加してPWAとして使う（強く推奨）**
- **iPhone (Safari)**:
  1. 共有ボタン（□↑）をタップ
  2. 「ホーム画面に追加」を選択
  3. 名前を「射形コーチ」にして追加
- **Android (Chrome)**:
  1. 右上メニュー → 「ホーム画面に追加」または「アプリをインストール」
  2. 追加後、ドロワーやホーム画面から起動

**完全オフラインで使う**
- 上記の「オフライン準備」をWi-Fi接続中に済ませる
- ホーム画面に追加する
- Wi-Fiを切る（または練習場に行く）
- ホーム画面のアイコンをタップして起動 → カメラが使えて分析可能（準備が効いていれば）

### 注意
- 初回だけはWi-Fi（インターネット）が必要です。以降は完全オフライン。
- ファイアウォールでブロックされる場合は、Windowsファイアウォールでポート8742を「プライベートネットワーク」で許可してください。
- より安定して使うには、GitHub PagesなどにデプロイしてHTTPSで公開することをおすすめします（その場合はURLを直接スマホで開くだけ）。

**現在のローカルサーバー（テスト用）**  
PCブラウザ: http://localhost:8741/  
スマホ: 上記の iPhone用サーバー（8742番ポート）を使ってください。

## セキュリティ表示
アプリ上部・設定内・READMEで常に「外部送信ゼロ」「明示保存のみ」を明記しています。

## 更新・拡張時のルール
- 有料要素やセキュリティに影響する変更が必要になった場合は、**必ず事前にユーザーに確認**を取る
- 迷った場合は「無料・スマホ最適・セキュリティ最優先」で実現可能な代替を優先

---

**このアプリは完全に無料の範囲・最高レベルのプライバシーで動作するよう設計されています。**

ご質問や改善リクエストはいつでもどうぞ。
