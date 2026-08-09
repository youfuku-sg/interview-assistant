import { LoaderIcon } from "lucide-react";
import { Markdown } from "@/components";
import { ProviderWarning } from "./ProviderWarning";

type Props = {
  summary: string;
  isSummaryProcessing: boolean;
  aiReady: boolean;
};

export const SummaryPanel = ({
  summary,
  isSummaryProcessing,
  aiReady,
}: Props) => {
  if (!aiReady) {
    return <ProviderWarning message="AIプロバイダーが設定されていません" />;
  }

  if (isSummaryProcessing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 animate-pulse">
        <LoaderIcon className="w-4 h-4 animate-spin shrink-0" />
        <span className="text-xs font-medium">要約を生成中...</span>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="px-3 py-2 overflow-y-auto h-full">
        <Markdown>{summary}</Markdown>
      </div>
    );
  }

  return null;
};
