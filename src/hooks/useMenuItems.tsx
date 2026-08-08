import {
  Settings,
  Code,
  MessagesSquare,
  WandSparkles,
  AudioLinesIcon,
  SquareSlashIcon,
  MonitorIcon,
  HomeIcon,
  PowerIcon,
  BugIcon,
  MessageSquareTextIcon,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { GithubIcon } from "@/components";

export const useMenuItems = () => {
  const menu: {
    icon: React.ElementType;
    label: string;
    href: string;
    count?: number;
  }[] = [
    {
      icon: HomeIcon,
      label: "ダッシュボード",
      href: "/dashboard",
    },
    {
      icon: MessagesSquare,
      label: "チャット",
      href: "/chats",
    },
    {
      icon: WandSparkles,
      label: "システムプロンプト",
      href: "/system-prompts",
    },
    {
      icon: Settings,
      label: "アプリ設定",
      href: "/settings",
    },
    {
      icon: MessageSquareTextIcon,
      label: "回答",
      href: "/responses",
    },
    {
      icon: MonitorIcon,
      label: "スクリーンショット",
      href: "/screenshot",
    },
    {
      icon: AudioLinesIcon,
      label: "音声",
      href: "/audio",
    },
    {
      icon: SquareSlashIcon,
      label: "カーソル・ショートカット",
      href: "/shortcuts",
    },

    {
      icon: Code,
      label: "開発者スペース",
      href: "/dev-space",
    },
  ];

  const footerItems = [
    {
      icon: BugIcon,
      label: "バグを報告",
      href: "https://github.com/youfuku-sg/interview-assistant/issues/new?template=bug-report.yml",
    },
    {
      icon: PowerIcon,
      label: "Interview-Assistantを終了",
      action: async () => {
        await invoke("exit_app");
      },
    },
  ];

  const footerLinks: {
    title: string;
    icon: React.ElementType;
    link: string;
  }[] = [
    {
      title: "GitHub",
      icon: GithubIcon,
      link: "https://github.com/youfuku-sg/interview-assistant",
    },
  ];

  return {
    menu,
    footerItems,
    footerLinks,
  };
};
