## Why

設定画面の「オーディオ」タブ（`src/pages/audio/components/AudioSelection.tsx`）では、マイク（入力）とシステム音声（出力）のデバイス選択が別々の `Select` として並んでいる。現状すでにトリガーには `MicIcon` / `HeadphonesIcon` が表示されているが、両セクションの見た目（枠線・配色・アイコンサイズ）が同一で、折りたたまれた状態や斜め読みでは「今どちらのデバイスを選んでいるか」を瞬時に判別しづらい（Issue #5）。ドロップダウンを開いた際の各項目についても、セクション内の全項目が同一アイコンの繰り返しになっており、種別を示す情報としての機能を果たせていない。マイクとシステム音声を明確に見分けられるようにする。

## What Changes

- マイク（入力）用セクションとシステム音声（出力）用セクションで、アイコンに加えて配色（アクセントカラー）を変え、閉じた状態のトリガーだけを見ても種別が判別できるようにする。
- `SelectItem` 側のアイコン表示は維持しつつ、選択中デバイスの行に現在の種別アイコン＋色を強調表示し、視覚的な手がかりを増やす。
- アイコンには `aria-hidden` とスクリーンリーダー向けのラベル（例: 「マイク」「システム音声」）を明示し、視覚だけに依存しないようにする。
- 対象は `src/pages/audio/components/AudioSelection.tsx` の設定画面のみ（他画面でのデバイス表示は対象外）。

## Capabilities

### New Capabilities
- `audio-device-selection-ui`: 設定画面の録音デバイス（マイク／システム音声）選択UIにおける、デバイス種別の視覚的な判別性（アイコン・配色・アクセシビリティラベル）に関する要件を定義する。

### Modified Capabilities
(none)

## Impact

- `src/pages/audio/components/AudioSelection.tsx`: マイク用・システム音声用の `Select` トリガーと `SelectItem` の見た目（アイコン・配色・aria属性）を変更。
- 既存のデバイス列挙ロジック（`get_input_devices` / `get_output_devices` の呼び出し、`selectedAudioDevices` の状態管理）は変更しない。見た目のみの変更。
