import { AlertCircleIcon } from "lucide-react";

type Props = {
  message: string;
};

export const ProviderWarning = ({ message }: Props) => (
  <div
    role="alert"
    className="flex items-center justify-center gap-2 px-3 py-2 text-center text-destructive"
  >
    <AlertCircleIcon aria-hidden="true" className="w-5 h-5 shrink-0" />
    <span className="text-sm font-semibold">{message}</span>
  </div>
);
