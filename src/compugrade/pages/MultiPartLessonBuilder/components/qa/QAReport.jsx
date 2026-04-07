import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function QAReport({ report }) {
  const [failuresCollapsed, setFailuresCollapsed] = useState(false);
  const [warningsCollapsed, setWarningsCollapsed] = useState(false);
  const isPass = report.result === "PASS";
  const hasFailures = report.failures && report.failures.length > 0;
  const hasWarnings = report.warnings && report.warnings.length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 px-2 py-1 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {report.lessonTitle || "Lesson"}
            </h3>
            <p className="text-sm text-gray-600 mt-1.5">
              {report.timestamp} · {report.statesEvaluated || 0} states evaluated
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-base ${
              isPass
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isPass ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {report.result}
          </div>
        </div>
      </div>

      {hasFailures && (
        <div className="bg-white rounded-lg border border-red-200  overflow-hidden">
          <div
            className="bg-red-50 px-3 py-2 border-b border-red-200 flex items-center justify-between cursor-pointer"
            onClick={() => setFailuresCollapsed((v) => !v)}
          >
            <h4 className="text-base font-semibold text-red-900">
              Failures ({report.failures.length})
            </h4>
            {failuresCollapsed ? (
              <ChevronDown className="w-5 h-5 text-red-800" />
            ) : (
              <ChevronUp className="w-5 h-5 text-red-800" />
            )}
          </div>
          {!failuresCollapsed && (
            <div className="p-3 space-y-4">
              {report.failures.map((failure, index) => (
                <FailureItem key={index} failure={failure} />
              ))}
            </div>
          )}
        </div>
      )}

      {hasWarnings && (
        <div className="bg-white rounded-lg border border-yellow-200  overflow-hidden">
          <div
            className="bg-yellow-50 px-3 py-2 border-b border-yellow-200 flex items-center justify-between cursor-pointer"
            onClick={() => setWarningsCollapsed((v) => !v)}
          >
            <h4 className="text-base font-semibold text-yellow-900">
              Warnings ({report.warnings.length})
            </h4>
            {warningsCollapsed ? (
              <ChevronDown className="w-5 h-5 text-yellow-800" />
            ) : (
              <ChevronUp className="w-5 h-5 text-yellow-800" />
            )}
          </div>
          {!warningsCollapsed && (
            <div className="p-3 space-y-4">
              {report.warnings.map((warning, index) => (
                <WarningItem key={index} warning={warning} />
              ))}
            </div>
          )}
        </div>
      )}

      {!hasFailures && !hasWarnings && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-sm font-medium text-green-900">
              No failures or warnings detected. All tests passed successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FailureItem({ failure }) {
  return (
    <div className="bg-pink-50 rounded border border-pink-200 px-3 py-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-red-200 text-red-800">
            {failure.type}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            Instruction {failure.instructionNumber}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{failure.description}</p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="w-3.5 h-3.5" />
          <span><span className="font-medium">State: </span>{failure.stateDocument}</span>
        </div>
        {failure.errorCodes && failure.errorCodes.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Error Codes: </span>
            {failure.errorCodes.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

function WarningItem({ warning }) {
  return (
    <div className="bg-yellow-50 rounded-lg border border-yellow-200 px-3 py-3">
      <div className="flex items-start gap-1">
       
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-yellow-200 text-yellow-800">
              {warning.type}
            </span>
            <span className="text-sm font-medium text-gray-900">
              Instruction {warning.instructionNumber}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{warning.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FileText className="w-3 h-3" />
            <span>State: {warning.stateDocument}</span>
          </div>
          {warning.errorCodes && warning.errorCodes.length > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-700">
                Error Codes:{" "}
              </span>
              <span className="text-xs text-gray-600">
                {warning.errorCodes.join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
