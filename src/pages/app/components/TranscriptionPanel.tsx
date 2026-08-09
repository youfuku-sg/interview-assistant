import { LoaderIcon } from "lucide-react";
import { ProviderWarning } from "./ProviderWarning";

type Props = {
  sessionTranscript: string[];
  isProcessing: boolean;
  sttReady: boolean;
};

export const TranscriptionPanel = ({
  sessionTranscript,
  isProcessing,
  sttReady,
}: Props) => {
  if (!sttReady) {
    return <ProviderWarning message="STTプロバイダーが選択されていません" />;
  }

  if (sessionTranscript.length > 0) {
    return (
      <div className="h-full px-3 py-2 overflow-y-auto">
        {sessionTranscript.map((line, i) => (
          <p key={i} className="text-xs leading-relaxed mb-1">
            {line}
          </p>
        ))}
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 animate-pulse">
        <LoaderIcon className="w-4 h-4 animate-spin shrink-0" />
        <span className="text-xs font-medium">文字起こし中...</span>
      </div>
    );
  }

  return null;
};
