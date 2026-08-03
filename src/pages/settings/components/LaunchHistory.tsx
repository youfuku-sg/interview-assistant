import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Header } from "@/components";

interface AppLaunchEntry {
  id: number;
  launched_at: number;
}

interface LaunchHistoryProps {
  className?: string;
}

export const LaunchHistory = ({ className }: LaunchHistoryProps) => {
  const [entries, setEntries] = useState<AppLaunchEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    invoke<AppLaunchEntry[]>("get_app_launch_history")
      .then((result) => {
        if (isMounted) {
          setEntries(result);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch app launch history:", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div id="launch-history" className={`space-y-2 ${className}`}>
      <Header
        title="起動履歴"
        description="アプリを起動した直近の日時を表示します(最大10件)"
        isMainTitle
      />
      {isLoading ? (
        <p className="text-xs text-muted-foreground">読み込み中...</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">履歴がありません</p>
      ) : (
        <ul className="space-y-1">
          {entries.map((entry) => (
            <li key={entry.id} className="text-sm">
              {new Date(entry.launched_at * 1000).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
