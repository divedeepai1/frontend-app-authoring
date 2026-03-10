export default function HeaderActionButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  loading = false,
  variant = "secondary",
  className = "",
}) {
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;
  const baseClassName = isPrimary
    ? "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    : "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none";
  const variantClassName = isPrimary
    ? isDisabled
      ? "border border-transparent bg-blue-400 text-white cursor-not-allowed"
      : "border border-transparent bg-blue-600 text-white hover:bg-blue-700"
    : isDisabled
    ? "border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50";

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`${baseClassName} ${variantClassName} ${className}`.trim()}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
