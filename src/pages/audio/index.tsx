import { AudioSelection } from "./components";
import { PageLayout } from "@/layouts";
import { getPlatform } from "@/lib";

const getOsInstructions = () => {
  const platform = getPlatform();

  switch (platform) {
    case "macos":
      return {
        mic: "システム環境設定 → サウンド → 入力",
        audio: "システム環境設定 → サウンド → 出力",
      };
    case "windows":
      return {
        mic: "設定 → システム → サウンド → 入力",
        audio: "設定 → システム → サウンド → 出力",
      };
    case "linux":
      return {
        mic: "サウンド設定 → 入力デバイス",
        audio: "サウンド設定 → 出力デバイス",
      };
    default:
      return {
        mic: "お使いのシステムのサウンド設定",
        audio: "お使いのシステムのサウンド設定",
      };
  }
};

const Audio = () => {
  const osInstructions = getOsInstructions();

  return (
    <PageLayout
      title="音声設定"
      description="音声入力・システム音声キャプチャで使用する入出力デバイスを設定します。"
    >
      <AudioSelection />

      <div className="text-xs text-amber-600 bg-amber-500/10 p-3 rounded-md mb-4 space-y-2">
        <p>
          <strong>⚠️ 選択したデバイスが動作しない場合:</strong>{" "}
          システムのデフォルト音声設定をご確認ください。マイクは{" "}
          <strong>{osInstructions.mic}</strong>、スピーカー/ヘッドフォンは{" "}
          <strong>{osInstructions.audio}</strong>{" "}
          から、OS上で正しいデバイスがデフォルトに設定されているか確認してください。
        </p>
        <p className="text-amber-600/80">
          <strong>注記:</strong>{" "}
          選択したデバイスが失敗または利用できない場合、Interview-Assistantは自動的にシステムのデフォルト音声デバイスにフォールバックします。
        </p>
      </div>
    </PageLayout>
  );
};

export default Audio;
