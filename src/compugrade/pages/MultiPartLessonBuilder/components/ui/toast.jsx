import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export default function ToastContainer({ toasts = [], removeToast }) {
  if (!Array.isArray(toasts) || toasts.length === 0) return null;

  const variantStyles = {
    success: {
      wrapper: "border-green-200 bg-green-50",
      iconClass: "text-green-600",
      Icon: CheckCircle2,
    },
    error: {
      wrapper: "border-red-200 bg-red-50",
      iconClass: "text-red-600",
      Icon: AlertTriangle,
    },
    info: {
      wrapper: "border-blue-200 bg-blue-50",
      iconClass: "text-blue-600",
      Icon: Info,
    },
  };

  return (
    <div className="fixed top-20 right-4 z-[1100] space-y-2 max-w-sm w-[92vw] sm:w-96">
      {toasts.map((t) => {
        const variant = variantStyles[t.variant] || variantStyles.info;
        const Icon = variant.Icon;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-3 rounded-lg border shadow-sm ${variant.wrapper}`}
          >
            <div className="pt-0.5">
              <Icon className={`w-5 h-5 ${variant.iconClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              {t.title && (
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {t.title}
                </div>
              )}
              {t.message && (
                <div className="text-xs text-gray-700 break-words mt-0.5">
                  {t.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast && removeToast(t.id)}
              className="p-1 rounded bg-transparent border-none hover:bg-black/5"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
}


