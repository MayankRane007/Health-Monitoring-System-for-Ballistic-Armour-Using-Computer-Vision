import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Shield,
  Upload,
  X,
} from "lucide-react";

import {
  Alert,
  Button,
  Card,
  Field,
  PageHeader,
  StatusBadge,
} from "../components/ui";
import { inputClassName } from "../lib/classes";
import { formatFileSize } from "../lib/format";
import {
  createInspection,
  getPanel,
  registerPanel,
  uploadInspectionImage,
} from "../services/api";

const MATERIALS = [
  "Ceramic",
  "Composite",
  "Steel",
  "Polyethylene",
  "Other",
];

function ImageField({
  id,
  title,
  description,
  image,
  onSelect,
  onRemove,
  disabled,
  error,
}) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted">{description}</p>
      <p className="mt-1 text-xs text-muted">JPG or PNG · 10 MB maximum</p>

      {image ? (
        <div className="relative mt-4">
          <img
            src={image.preview}
            alt={`${title} preview`}
            className="h-56 w-full rounded-lg bg-black/30 object-contain"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{image.file.name}</p>
              <p className="text-xs text-muted">{formatFileSize(image.file.size)}</p>
            </div>
            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-line px-3 py-2 text-xs hover:bg-white/5">
                Replace
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="sr-only"
                  disabled={disabled}
                  onChange={(event) => onSelect(event)}
                />
              </label>
              <Button
                variant="danger"
                className="px-3 py-2"
                disabled={disabled}
                onClick={onRemove}
                aria-label={`Remove ${title} image`}
              >
                <X size={14} />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`mt-4 flex h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 text-center ${
            error ? "border-danger/50" : "border-line hover:border-accent/50"
          }`}
        >
          <ImagePlus size={28} className="mb-3 text-accent" aria-hidden="true" />
          <span className="text-sm">Choose {title.toLowerCase()} image</span>
          <span className="mt-1 text-xs text-muted">Accepted: JPEG, PNG</span>
          <input
            id={id}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="sr-only"
            disabled={disabled}
            onChange={onSelect}
          />
        </label>
      )}
      {error ? (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}

function NewInspection() {
  const [panelId, setPanelId] = useState("");
  const [material, setMaterial] = useState("Ceramic");
  const [manufacturer, setManufacturer] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [panelLookup, setPanelLookup] = useState({
    status: "idle",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => {
      if (frontImage?.preview) URL.revokeObjectURL(frontImage.preview);
      if (backImage?.preview) URL.revokeObjectURL(backImage.preview);
    };
  }, [frontImage, backImage]);

  const assignImage = (event, current, setter, key) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        [key]: "Only JPG and PNG images are supported.",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        [key]: "Image size must not exceed 10 MB.",
      }));
      return;
    }

    if (current?.preview) URL.revokeObjectURL(current.preview);
    setter({ file, preview: URL.createObjectURL(file) });
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setError("");
    setResult(null);
  };

  const lookupPanel = async () => {
    const id = panelId.trim();
    if (!id) {
      setPanelLookup({ status: "idle", message: "" });
      return;
    }

    setPanelLookup({ status: "loading", message: "Checking panel register…" });

    try {
      const panel = await getPanel(id);
      setMaterial(panel.material || material);
      setManufacturer(panel.manufacturer || "");
      setManufactureDate(
        panel.manufacture_date ? String(panel.manufacture_date).slice(0, 10) : ""
      );
      setPanelLookup({
        status: "found",
        message: `Panel ${panel.panel_id} is already registered. A new inspection will be added to it.`,
      });
    } catch (err) {
      const notFound =
        err.message.toLowerCase().includes("panel not found") ||
        err.message.toLowerCase().includes("404");

      if (notFound) {
        setPanelLookup({
          status: "new",
          message:
            "This panel ID is not registered yet. Submitting will register it, then create the inspection.",
        });
      } else {
        setPanelLookup({ status: "error", message: err.message });
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setResult(null);

    const nextErrors = {};
    if (!panelId.trim()) nextErrors.panelId = "Enter a panel ID.";
    else if (panelId.trim().length > 50) {
      nextErrors.panelId = "Panel ID must be 50 characters or fewer.";
    }
    if (!frontImage) nextErrors.front = "Upload a front image.";
    if (!backImage) nextErrors.back = "Upload a back image.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    let inspection = null;
    let frontUploaded = false;
    let backUploaded = false;

    try {
      setMessage("Checking panel registration…");
      let panelExists = false;

      try {
        await getPanel(panelId.trim());
        panelExists = true;
      } catch (err) {
        if (
          err.message.toLowerCase().includes("panel not found") ||
          err.message.toLowerCase().includes("404")
        ) {
          panelExists = false;
        } else {
          throw err;
        }
      }

      if (!panelExists) {
        setMessage("Registering new armour panel…");
        await registerPanel({
          panel_id: panelId.trim(),
          material: material || null,
          manufacturer: manufacturer.trim() || null,
          manufacture_date: manufactureDate || null,
        });
      }

      setMessage("Creating inspection record…");
      inspection = await createInspection({
        panel_id: panelId.trim(),
        inspector_name: inspectorName.trim() || null,
      });

      setMessage("Uploading front image…");
      await uploadInspectionImage(inspection.id, "front", frontImage.file);
      frontUploaded = true;

      setMessage("Uploading back image…");
      await uploadInspectionImage(inspection.id, "back", backImage.file);
      backUploaded = true;

      setResult({
        inspectionId: inspection.id,
        panelId: inspection.panel_id,
        status: inspection.status,
        frontUploaded,
        backUploaded,
      });
      setMessage("Inspection record and both images uploaded successfully.");
    } catch (err) {
      setError(
        inspection
          ? `Inspection #${inspection.id} was created, but image upload was incomplete: ${err.message}`
          : err.message
      );
      if (inspection) {
        setResult({
          inspectionId: inspection.id,
          panelId: inspection.panel_id,
          status: inspection.status,
          frontUploaded,
          backUploaded,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Capture"
        title="New inspection"
        description="Identify or register a panel, add inspector details, then upload front and back photos. The API does not return damage predictions."
      />

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
              <Shield size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold">Panel and inspector</h2>
              <p className="text-sm text-muted">
                Panel ID is required. Other fields are stored when registering a new panel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Panel ID *"
              htmlFor="panel-id"
              error={fieldErrors.panelId}
              hint="Used to look up an existing panel or register a new one."
            >
              <input
                id="panel-id"
                required
                maxLength={50}
                value={panelId}
                onChange={(event) => {
                  setPanelId(event.target.value);
                  setPanelLookup({ status: "idle", message: "" });
                }}
                onBlur={lookupPanel}
                placeholder="e.g. ARM-2026-001"
                disabled={loading}
                className={inputClassName(fieldErrors.panelId)}
              />
            </Field>

            <Field label="Material" htmlFor="material">
              <select
                id="material"
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
                disabled={loading || panelLookup.status === "found"}
                className={inputClassName(false)}
              >
                {MATERIALS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                {material && !MATERIALS.includes(material) ? (
                  <option value={material}>{material}</option>
                ) : null}
              </select>
            </Field>

            <Field label="Manufacturer" htmlFor="manufacturer">
              <input
                id="manufacturer"
                value={manufacturer}
                onChange={(event) => setManufacturer(event.target.value)}
                placeholder="Manufacturer name"
                disabled={loading || panelLookup.status === "found"}
                className={inputClassName(false)}
              />
            </Field>

            <Field label="Manufacture date" htmlFor="manufacture-date">
              <input
                id="manufacture-date"
                type="date"
                value={manufactureDate}
                onChange={(event) => setManufactureDate(event.target.value)}
                disabled={loading || panelLookup.status === "found"}
                className={inputClassName(false)}
              />
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Inspector name"
                htmlFor="inspector-name"
                hint="Stored on the inspection record. Optional."
              >
                <input
                  id="inspector-name"
                  value={inspectorName}
                  onChange={(event) => setInspectorName(event.target.value)}
                  placeholder="Name of the inspecting officer"
                  disabled={loading}
                  className={inputClassName(false)}
                />
              </Field>
            </div>
          </div>

          {panelLookup.message ? (
            <p
              className={`mt-4 text-sm ${
                panelLookup.status === "error" ? "text-danger" : "text-muted"
              }`}
            >
              {panelLookup.status === "loading" ? (
                <Loader2
                  size={14}
                  className="mr-2 inline animate-spin motion-reduce:animate-none"
                />
              ) : null}
              {panelLookup.message}
            </p>
          ) : null}
        </Card>

        <div>
          <h2 className="font-semibold">Surface images</h2>
          <p className="mt-1 mb-4 text-sm text-muted">
            Both images are required. Files stay on this device until you submit.
          </p>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ImageField
              id="front-image"
              title="Front"
              description="Photograph of the front face of the panel."
              image={frontImage}
              disabled={loading}
              error={fieldErrors.front}
              onSelect={(event) =>
                assignImage(event, frontImage, setFrontImage, "front")
              }
              onRemove={() => {
                if (frontImage?.preview) URL.revokeObjectURL(frontImage.preview);
                setFrontImage(null);
              }}
            />
            <ImageField
              id="back-image"
              title="Back"
              description="Photograph of the rear face of the panel."
              image={backImage}
              disabled={loading}
              error={fieldErrors.back}
              onSelect={(event) =>
                assignImage(event, backImage, setBackImage, "back")
              }
              onRemove={() => {
                if (backImage?.preview) URL.revokeObjectURL(backImage.preview);
                setBackImage(null);
              }}
            />
          </div>
        </div>

        {error ? <Alert title="Inspection did not finish">{error}</Alert> : null}

        {loading ? (
          <Alert tone="ok" title="Working">
            <span className="inline-flex items-center gap-2">
              <Loader2
                size={16}
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              {message}
            </span>
          </Alert>
        ) : null}

        {result ? (
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2 text-accent">
              <CheckCircle2 size={20} aria-hidden="true" />
              <p className="font-semibold">Inspection #{result.inspectionId}</p>
              <StatusBadge status={result.status} />
            </div>
            <p className="mt-3 text-sm text-muted">Panel ID: {result.panelId}</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li className={result.frontUploaded ? "text-accent" : "text-warning"}>
                {result.frontUploaded ? "Front image uploaded" : "Front image not uploaded"}
              </li>
              <li className={result.backUploaded ? "text-accent" : "text-warning"}>
                {result.backUploaded ? "Back image uploaded" : "Back image not uploaded"}
              </li>
            </ul>
            {!loading && message ? (
              <p className="mt-3 text-sm text-muted">{message}</p>
            ) : null}
          </Card>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin motion-reduce:animate-none"
                />
                Processing…
              </>
            ) : (
              <>
                <Upload size={16} />
                Create inspection and upload images
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewInspection;
