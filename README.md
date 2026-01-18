# 3dbox

Vite + Vue, Three.js を使用したシンプルな3D boxの描画ウェブアプリ。

## 概要

Web画面にて指定したサイズ(比率)の3Dの箱を描画する。


## 主な機能

- 高さ、幅、奥行を指定し、3Dの箱を画面に描画する。
- 描画した箱をドラッグで回転できる。
- 縦方向・横方向の回転の角度を指定できる。
- カメラとの距離を指定できる。
- JSONファイルにてdefaultを含む各値(高さ、幅、奥行、角度、距離)のプリセットを定義できる。
- プリセットを選択して各種値を読み込むことが出来る。
- 箱の前面、側面、上面にそれぞれ画像を指定できる。
- 背景色を指定できる。
- 箱の下に鏡面エフェクトを表示できる。
- PNGファイルとして描画した箱をexport出来る。


## 使い方

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```


## プリセット設定

`public/presets.json` を編集してプリセットを追加・変更できます。

```json
{
  "presets": [
    {
      "name": "default",
      "label": "デフォルト",
      "width": 1,
      "height": 1,
      "depth": 1,
      "rotationX": 0.5,
      "rotationY": 0.5,
      "cameraDistance": 2.0
    }
  ]
}
```

各プロパティ:
- `name`: プリセットの内部識別子
- `label`: 画面に表示される名前
- `width`, `height`, `depth`: 箱のサイズ（比率）
- `rotationX`, `rotationY`: 初期回転角度（ラジアン）
- `cameraDistance`: カメラと箱の距離
