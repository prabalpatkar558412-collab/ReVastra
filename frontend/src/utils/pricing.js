export function calculateDeviceEstimate(device) {
  const age = Number(device.age || 0);
  const deviceType = String(device.deviceType || "").trim();
  const brand = String(device.brand || "").trim().toLowerCase();
  const condition = String(device.condition || "").trim();
  const working = String(device.working || "").trim();

  const deviceBasePrices = {
    Phone: 18000,
    Laptop: 32000,
    Tablet: 14000,
    Headphones: 5000,
  };

  const brandMultipliers = {
    apple: 1.25,
    samsung: 1.12,
    oneplus: 1.08,
    xiaomi: 1.0,
    redmi: 0.95,
    oppo: 0.93,
    vivo: 0.92,
    dell: 1.08,
    hp: 1.0,
    lenovo: 0.98,
    asus: 1.02,
    acer: 0.96,
    sony: 1.08,
    boat: 0.9,
    jbl: 1.0,
  };

  const conditionMultipliers = {
    Excellent: 1.0,
    Good: 0.88,
    Damaged: 0.62,
    Dead: 0.35,
  };

  const workingMultipliers = {
    Yes: 1.0,
    Partially: 0.82,
    No: 0.55,
  };

  const depreciationRates = {
    Phone: 0.14,
    Laptop: 0.12,
    Tablet: 0.13,
    Headphones: 0.16,
  };

  const defaultBasePrice = 4000;
  const basePrice = deviceBasePrices[deviceType] || defaultBasePrice;

  const brandMultiplier = brandMultipliers[brand] || 0.9;
  const conditionMultiplier = conditionMultipliers[condition] || 0.75;
  const workingMultiplier = workingMultipliers[working] || 0.85;
  const yearlyDepreciation = depreciationRates[deviceType] || 0.14;

  const ageMultiplier = Math.max(0.35, 1 - age * yearlyDepreciation);

  const rawEstimate =
    basePrice *
    brandMultiplier *
    conditionMultiplier *
    workingMultiplier *
    ageMultiplier;

  const estimatedValue = Math.max(500, Math.round(rawEstimate / 100) * 100);

  let suggestion = "Resale or recycle both possible";
  if (condition === "Dead" || working === "No") {
    suggestion = "Best suited for recycling";
  } else if (condition === "Damaged" || working === "Partially") {
    suggestion = "Repair and resale may be possible";
  }

  let impactScore = 65;
  if (condition === "Dead") impactScore = 92;
  else if (condition === "Damaged") impactScore = 80;
  else if (condition === "Good") impactScore = 72;

  return {
    estimatedValue,
    suggestion,
    impactScore,
    breakdown: {
      basePrice,
      brandMultiplier,
      conditionMultiplier,
      workingMultiplier,
      ageMultiplier,
    },
  };
}