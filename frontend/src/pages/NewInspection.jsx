
import { useState } from "react";
import {
  Shield,
  Upload,
  ImagePlus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getPanel,
  registerPanel,
  createInspection,
  uploadInspectionImage,
} from "../services/api";

function NewInspection() {
  const [panelId, setPanelId] = useState("");
  const [material, setMaterial] = useState("Ceramic");
  const [manufacturer, setManufacturer] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [inspectorName, setInspectorName] = useState("");

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleImage = (event, setter) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG, JPEG and PNG images are supported.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must not exceed 10 MB.");
      event.target.value = "";
      return;
    }

    setter({
      file,
      preview: URL.createObjectURL(file),
    });

    setError("");
    setResult(null);
    event.target.value = "";
  };

  const removeImage = (image, setter) => {
    if (image?.preview) {
      URL.revokeObjectURL(image.preview);
    }

    setter(null);
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setResult(null);

    if (!panelId.trim()) {
      setError("Please enter a Panel ID.");
      return;
    }

    if (!frontImage || !backImage) {
      setError("Please upload both front and back images.");
      return;
    }

    setLoading(true);

    let inspection = null;
    let frontUploaded = false;
    let backUploaded = false;

    try {
      // Step 1: Check whether the panel already exists
      setMessage("Checking panel registration...");

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

      // Step 2: Register the panel if it is new
      if (!panelExists) {
        setMessage("Registering new armour panel...");

        await registerPanel({
          panel_id: panelId.trim(),
          material: material || null,
          manufacturer: manufacturer.trim() || null,
          manufacture_date: manufactureDate || null,
        });
      }

      // Step 3: Create inspection
      setMessage("Creating inspection record...");

      inspection = await createInspection({
        panel_id: panelId.trim(),
        inspector_name: inspectorName.trim() || null,
      });

      // Step 4: Upload front image
      setMessage("Uploading front surface image...");

      await uploadInspectionImage(
        inspection.id,
        "front",
        frontImage.file
      );

      frontUploaded = true;

      // Step 5: Upload back image
      setMessage("Uploading back surface image...");

      await uploadInspectionImage(
        inspection.id,
        "back",
        backImage.file
      );

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

  const UploadBox = ({ title, description, image, setter }) => (
    <div className="bg-[#10231b] border border-emerald-900/50 rounded-xl p-5">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">{description}</p>

      {image ? (
        <div className="relative">
          <img
            src={image.preview}
            alt={title}
            className="w-full h-56 object-contain bg-black/30 rounded-lg"
          />

          <button
            type="button"
            disabled={loading}
            onClick={() => removeImage(image, setter)}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg disabled:opacity-50"
          >
            <X size={16} />
          </button>

          <p className="text-xs text-emerald-400 mt-3 truncate">
            {image.file.name}
          </p>
        </div>
      ) : (
        <label className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-emerald-900 rounded-lg cursor-pointer hover:border-emerald-500 transition">
          <ImagePlus size={34} className="text-emerald-400 mb-3" />
          <span className="text-sm text-gray-300">
            Click to upload image
          </span>
          <span className="text-xs text-gray-500 mt-2">
            JPG or PNG · Maximum 10 MB
          </span>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="hidden"
            disabled={loading}
            onChange={(event) => handleImage(event, setter)}
          />
        </label>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07130f] text-white p-5 md:p-8">

      {/* Heading */}
      <div className="flex items-center gap-3 mb-7">
        <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
          <Shield size={25} />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            New Armour Inspection
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Register a panel and upload inspection images
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Panel Information */}
        <section className="bg-[#10231b] border border-emerald-900/50 rounded-xl p-5 md:p-6">
          <h2 className="font-semibold mb-5">Panel Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Panel ID *
              </label>
              <input
                required
                value={panelId}
                onChange={(e) => setPanelId(e.target.value)}
                placeholder="e.g. ARM-2026-001"
                disabled={loading}
                className="w-full bg-[#07130f] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Material
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                disabled={loading}
                className="w-full bg-[#07130f] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="Ceramic">Ceramic</option>
                <option value="Composite">Composite</option>
                <option value="Steel">Steel</option>
                <option value="Polyethylene">Polyethylene</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Manufacturer
              </label>
              <input
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Enter manufacturer"
                disabled={loading}
                className="w-full bg-[#07130f] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Manufacture Date
              </label>
              <input
                type="date"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                disabled={loading}
                className="w-full bg-[#07130f] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 block mb-2">
                Inspector Name
              </label>
              <input
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Enter inspector name"
                disabled={loading}
                className="w-full bg-[#07130f] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section>
          <h2 className="font-semibold mb-1">Surface Images</h2>
          <p className="text-xs text-gray-500 mb-4">
            Upload both images to create the inspection
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <UploadBox
              title="Front Surface"
              description="Front-facing armour panel image"
              image={frontImage}
              setter={setFrontImage}
            />

            <UploadBox
              title="Back Surface"
              description="Rear-facing armour panel image"
              image={backImage}
              setter={setBackImage}
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-300">
            <AlertCircle size={19} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Progress */}
        {loading && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-sm text-emerald-300">
            <Loader2 size={19} className="animate-spin" />
            {message}
          </div>
        )}

        {/* Success / Upload Result */}
        {result && (
          <div className="bg-[#10231b] border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
              <CheckCircle2 size={20} />
              Inspection record #{result.inspectionId}
            </div>

            <p className="text-sm text-gray-300 mb-3">
              Panel ID: {result.panelId}
            </p>

            <div className="space-y-2 text-sm">
              <p className={result.frontUploaded ? "text-emerald-400" : "text-yellow-400"}>
                {result.frontUploaded ? "✓" : "○"} Front image uploaded
              </p>
              <p className={result.backUploaded ? "text-emerald-400" : "text-yellow-400"}>
                {result.backUploaded ? "✓" : "○"} Back image uploaded
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Backend inspection status: {result.status}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-lg text-sm transition"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload size={18} />
                Create Inspection & Upload Images
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default NewInspection;

