import { Card, DragButton, CustomCursor, Button } from "@/components";
import {
  SystemAudio,
  Audio,
  AudioVisualizer,
  StatusIndicator,
  TranscriptionPanel,
  AIResponsePanel,
  SummaryPanel,
} from "./components";
import { useApp } from "@/hooks";
import { useApp as useAppContext } from "@/contexts";
import { useCompletion } from "@/hooks";
import { Settings, Power } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorLayout } from "@/layouts";
import { getPlatform } from "@/lib";

const App = () => {
  const { isHidden, systemAudio } = useApp();
  const { customizable, selectedSttProvider, selectedAIProvider, pluelyApiEnabled } = useAppContext();

  const sttReady = !!selectedSttProvider.provider || pluelyApiEnabled;
  const aiReady = !!selectedAIProvider.provider || pluelyApiEnabled;
  const completion = useCompletion();
  const platform = getPlatform();

  const openDashboard = async () => {
    try {
      await invoke("open_dashboard");
    } catch (error) {
      console.error("Failed to open dashboard:", error);
    }
  };

  const quitApp = async () => {
    try {
      await invoke("exit_app");
    } catch (error) {
      console.error("Failed to quit app:", error);
    }
  };

  return (
    <ErrorBoundary
      fallbackRender={() => {
        return <ErrorLayout isCompact />;
      }}
      resetKeys={["app-error"]}
      onReset={() => {
        console.log("Reset");
      }}
    >
      <div
        className={`w-screen h-screen flex overflow-hidden justify-center ${
          isHidden ? "hidden pointer-events-none" : ""
        }`}
      >
        <Card className="w-full flex flex-row gap-2 p-2">
          {/* 左カラム: アイコン縦並び */}
          <div className="w-10 flex flex-col items-center gap-2 py-1 shrink-0">
            <SystemAudio {...systemAudio} />
            <Audio {...completion} />
            <Button
              size={"icon"}
              className="cursor-pointer"
              title="設定を開く"
              onClick={openDashboard}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size={"icon"}
              className="cursor-pointer"
              title="アプリを終了"
              onClick={quitApp}
            >
              <Power className="h-4 w-4" />
            </Button>
            <DragButton />
          </div>

          {/* 右エリア: 3段構造（常時表示） */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 上段: 文字起こしパネル（常時表示）。文字起こし前のみ AudioVisualizer + StatusIndicator を表示 */}
            <div data-slot="top-panel" className="flex-1 border-b border-border/70 overflow-hidden">
              {systemAudio?.capturing && systemAudio.sessionTranscript.length === 0 ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 shrink-0">
                    <AudioVisualizer isRecording={systemAudio.capturing} />
                  </div>
                  <StatusIndicator
                    setupRequired={systemAudio.setupRequired}
                    error={systemAudio.error}
                    isProcessing={systemAudio.isProcessing}
                    isAIProcessing={systemAudio.isAIProcessing}
                    capturing={systemAudio.capturing}
                  />
                </div>
              ) : (
                <TranscriptionPanel
                  sessionTranscript={systemAudio.sessionTranscript}
                  isProcessing={systemAudio.isProcessing}
                  sttReady={sttReady}
                />
              )}
            </div>
            {/* 中段: 要約パネル */}
            <div data-slot="middle-panel" className="flex-1 border-b border-border/70 overflow-hidden">
              <SummaryPanel
                summary={systemAudio.sessionSummary}
                isSummaryProcessing={systemAudio.isSummaryProcessing}
                aiReady={aiReady}
              />
            </div>
            {/* 下段: AI回答パネル */}
            <div data-slot="bottom-panel" className="flex-1 overflow-hidden">
              <AIResponsePanel
                lastAIResponse={systemAudio.lastAIResponse}
                isAIProcessing={systemAudio.isAIProcessing}
                aiReady={aiReady}
              />
            </div>
          </div>
        </Card>
        {customizable.cursor.type === "invisible" && platform !== "linux" ? (
          <CustomCursor />
        ) : null}
      </div>
    </ErrorBoundary>
  );
};

export default App;
