import { useEffect, useRef, useState } from "react";
import { getDevUser, setDevUser, type DevUser } from "./dev-user";

const OPTIONS: { label: string; value: DevUser }[] = [
  { label: "Logged out", value: null },
  { label: "eric", value: "eric" },
  { label: "anna", value: "anna" },
  { label: "steve", value: "steve" },
];

export function DevToolbar() {
  const [current, setCurrent] = useState<DevUser>(getDevUser());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function pick(value: DevUser) {
    setDevUser(value);
    setCurrent(value);
    setOpen(false);
    window.location.reload();
  }

  const label = current ?? "logged out";

  return (
    <div
      ref={ref}
      className="fixed bottom-4 right-4 z-[9999] font-mono text-xs"
    >
      {open && (
        <div className="mb-2 flex flex-col overflow-hidden rounded-md border border-white/20 bg-black/90 text-white shadow-lg">
          {OPTIONS.map((option) => {
            const active = option.value === current;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => pick(option.value)}
                className={`px-3 py-1.5 text-left transition-colors hover:bg-white/10 ${
                  active ? "bg-white/15" : ""
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-md border border-white/20 bg-black/90 px-3 py-1.5 text-white shadow-lg hover:bg-black"
      >
        DEV: {label}
      </button>
    </div>
  );
}
