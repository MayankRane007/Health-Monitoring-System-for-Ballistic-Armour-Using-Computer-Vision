import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Alert, Button, LoadingBlock, StatusBadge } from "./ui";
import { displayName, formatDateTime } from "../lib/format";
import { getInspection } from "../services/api";

function InspectionDetail({ inspection, onClose }) {
  const [record, setRecord] = useState(inspection);
  const [loading, setLoading] = useState(Boolean(inspection?.id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inspection) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspection, onClose]);

  useEffect(() => {
    if (!inspection?.id) return undefined;
    let cancelled = false;

    getInspection(inspection.id)
      .then((data) => {
        if (!cancelled) setRecord(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setRecord(inspection);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inspection]);

  if (!inspection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close inspection details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspection-detail-title"
        className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-forest-800 p-5 sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="inspection-detail-title" className="text-lg font-semibold">
              Inspection #{record?.id}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Fields returned by GET /inspections/{`{id}`}. Images are stored on
              the server and are not listed by this endpoint.
            </p>
          </div>
          <Button variant="ghost" className="px-2" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        {loading ? <LoadingBlock label="Loading inspection…" /> : null}
        {error ? (
          <div className="mt-4">
            <Alert title="Could not refresh this record">
              Showing the list data instead. {error}
            </Alert>
          </div>
        ) : null}

        {!loading && record ? (
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="text-muted">Panel ID</dt>
              <dd>{record.panel_id || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="text-muted">Inspector</dt>
              <dd>{displayName(record.inspector_name)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="text-muted">Date</dt>
              <dd>{formatDateTime(record.inspection_date)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Status</dt>
              <dd>
                <StatusBadge status={record.status} />
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
    </div>
  );
}

export default InspectionDetail;
