import statesData from "./states-and-districts.json";

export const CROPS = [
  { id: "rice", name: "Rice" },
  { id: "wheat", name: "Wheat" },
  { id: "maize", name: "Maize" },
  { id: "cotton", name: "Cotton" },
  { id: "sugarcane", name: "Sugarcane" },
  { id: "pulses", name: "Pulses" },
  { id: "potato", name: "Potato" },
  { id: "vegetables", name: "Vegetables" }
];

export const STATES_AND_DISTRICTS: Record<string, string[]> = statesData.states.reduce<Record<string, string[]>>((acc, stateObj) => {
  acc[stateObj.state] = stateObj.districts;
  return acc;
}, {});

export const GROWTH_STAGES = [
  "Sowing",
  "Vegetative",
  "Flowering",
  "Fruiting",
  "Harvesting"
];
