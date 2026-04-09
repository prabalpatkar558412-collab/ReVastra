import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export default function Sell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authFetch, isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);
  const entryMode = location.state?.entryMode;

  const [formData, setFormData] = useState({ deviceType: "", brand: "", model: "", age: "", condition: "", working: "", description: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (entryMode === "camera" && fileInputRef.current) {
      const timer = setTimeout(() => fileInputRef.current.click(), 500);
      return () => clearTimeout(timer);
    }
  }, [entryMode]);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setErrorMessage(""); setImageFile(file); setImageName(file.name); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { setErrorMessage("Please upload a clear image of the electronic device."); return; }
    setIsSubmitting(true);
    setErrorMessage("");
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
    payload.append("image", imageFile);
    try {
      const opts = { method: "POST", body: payload };
      const response = isAuthenticated ? await authFetch("/submissions", opts) : await fetch(`${apiBaseUrl}/submissions`, opts);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to create submission");
      navigate("/estimate", { state: { ...result.data, localImagePreview: imagePreview, imageName } });
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    } finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setFormData({ deviceType: "", brand: "", model: "", age: "", condition: "", working: "", description: "" });
    setImagePreview(null); setImageName(""); setImageFile(null); setErrorMessage("");
  };

  const step = !formData.deviceType ? 1 : !formData.brand || !formData.model ? 2 : !imageFile ? 3 : 4;
  const steps = [
    { num: 1, label: "Device Type" },
    { num: 2, label: "Details" },
    { num: 3, label: "Upload Photo" },
    { num: 4, label: "Submit" },
  ];

  const InputField = ({ label, name, type = "text", placeholder, required = true, children, span2 = false, hint }) => (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      {children || (
        <input type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} required={required}
          min={type === "number" ? "0" : undefined} step={type === "number" ? "0.1" : undefined}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" />
      )}
      {hint && <p className="mt-1.5 text-xs text-gray-600">{hint}</p>}
    </div>
  );

  const SelectField = ({ label, name, options, placeholder }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <select name={name} value={formData[name]} onChange={handleChange} required
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition appearance-none"
        style={{ colorScheme: "dark" }}>
        <option value="" className="bg-gray-900">{placeholder}</option>
        {options.map(o => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 py-10 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-10 w-72 h-72 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-green-400 text-xs font-semibold tracking-wide">{"\uD83D\uDCF1"} Smart Device Submission</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Sell Your <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">E-Waste</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">Enter device details and upload a photo. Our AI validates the image and generates a transparent value estimate.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.num ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-white/10 text-gray-600"}`}>
                {step > s.num ? "\u2713" : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? "text-green-400" : "text-gray-600"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${step > s.num ? "bg-green-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {errorMessage && (
              <div className="md:col-span-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {"\u26A0\uFE0F"} {errorMessage}
              </div>
            )}

            <SelectField label="Device Type" name="deviceType" placeholder="Select device" options={["Phone", "Laptop", "Tablet", "Headphones"]} />
            <InputField label="Brand" name="brand" placeholder="e.g. Apple, Samsung" />
            <InputField label="Model" name="model" placeholder="e.g. iPhone 11, Galaxy S21" />
            <InputField label="Age (Years)" name="age" type="number" placeholder="e.g. 2" hint="0.5 = 6 months, 2 = 2 years" />
            <SelectField label="Condition" name="condition" placeholder="Select condition" options={["Excellent", "Good", "Damaged", "Dead"]} />
            <SelectField label="Is It Working?" name="working" placeholder="Choose option" options={["Yes", "Partially", "No"]} />

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{"\uD83D\uDCF8"} Device Image</label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/15 hover:border-green-500/40 rounded-2xl p-8 cursor-pointer transition-all bg-white/3 group">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-3 group-hover:bg-green-500/20 transition">
                  <span className="text-2xl">{"\uD83D\uDCF7"}</span>
                </div>
                <span className="text-gray-300 font-semibold mb-1">Click to upload or take photo</span>
                <span className="text-xs text-gray-600">PNG, JPG, JPEG, WEBP, HEIC or HEIF</span>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif" capture="environment" onChange={handleImageChange} className="hidden" />
              </label>

              {imageName && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-green-400 font-medium">{imageName}</span>
                </div>
              )}

              {imagePreview && (
                <div className="mt-4 relative inline-block">
                  <img src={imagePreview} alt="Device Preview" className="max-w-xs rounded-2xl shadow-lg border border-white/10" />
                  <button type="button" onClick={() => { setImagePreview(null); setImageName(""); setImageFile(null); }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition shadow-lg">
                    {"\u2715"}
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description (Optional)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                placeholder="Describe damage, scratches, battery issues, screen cracks..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition" />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-60 hover:-translate-y-0.5">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing with AI...
                  </span>
                ) : "\uD83D\uDE80 Get Estimated Value"}
              </button>
              <button type="button" onClick={resetForm} disabled={isSubmitting}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 font-semibold px-8 py-3.5 rounded-xl transition-all">
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: "\uD83E\uDD16", title: "AI Validated", desc: "Gemini verifies your device photo" },
            { icon: "\uD83D\uDCB0", title: "Fair Pricing", desc: "Real-time material market rates" },
            { icon: "\uD83D\uDD12", title: "Secure", desc: "End-to-end encrypted uploads" },
          ].map(c => (
            <div key={c.title} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
              <span className="text-2xl mb-2 block">{c.icon}</span>
              <p className="text-white text-sm font-bold">{c.title}</p>
              <p className="text-gray-600 text-xs mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
