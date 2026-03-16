"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function CountdownTimer({ expirationDate }: { expirationDate: string | Date }) {
  const [text, setText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const exp = new Date(expirationDate);
      const diff = exp.getTime() - now.getTime();

      if (diff <= 0) {
        setText("Expired");
        setIsUrgent(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 1) {
        setText(`${days}d left`);
        setIsUrgent(false);
      } else if (days === 1) {
        setText("1d left");
        setIsUrgent(false);
      } else if (hours > 1) {
        setText(`${hours}h left`);
        setIsUrgent(true);
      } else {
        setText("Expiring!");
        setIsUrgent(true);
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expirationDate]);

  if (!text) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
      <Clock className="size-3" />
      {text}
    </span>
  );
}
