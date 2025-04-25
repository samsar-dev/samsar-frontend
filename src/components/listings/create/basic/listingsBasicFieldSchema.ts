export interface ListingFieldSchema {
  name: string;
  type: "text" | "select" | "number" | "textarea";
  label: string;
  required: boolean;
  dependsOn?: string;
  options?: string[];
}

export const listingsFieldSchema: Record<string, ListingFieldSchema[]> = {
  cars: [
    { name: "make", type: "select", label: "Make", required: true },
    {
      name: "model",
      type: "select",
      label: "Model",
      required: true,
      dependsOn: "make",
    },

    { name: "year", type: "number", label: "Year", required: true },

    {
      name: "bodyType",
      type: "select",
      label: "Body Type",
      options: ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible"],
      required: false,
    },
  ],

  motorcycles: [
    { name: "make", type: "select", label: "Make", required: true },
    {
      name: "model",
      type: "select",
      label: "Model",
      required: true,
      dependsOn: "make",
    },
    { name: "year", type: "number", label: "Year", required: true },
    {
      name: "engineSize",
      type: "number",
      label: "Engine Size (cc)",
      required: true,
    },

    {
      name: "type",
      type: "select",
      label: "Type",
      options: ["Cruiser", "Sport", "Touring", "Off-road", "Scooter"],
      required: false,
    },
  ],

  trucks: [
    { name: "make", type: "select", label: "Make", required: true },
    {
      name: "model",
      type: "select",
      label: "Model",
      required: true,
      dependsOn: "make",
    },
    { name: "year", type: "number", label: "Year", required: true },
    {
      name: "payloadCapacity",
      type: "number",
      label: "Payload Capacity (kg)",
      required: false,
    },
    { name: "axles", type: "number", label: "Axles", required: false },
  ],

  buses: [
    { name: "make", type: "select", label: "Make", required: true },
    {
      name: "model",
      type: "select",
      label: "Model",
      required: true,
      dependsOn: "make",
    },
    { name: "year", type: "number", label: "Year", required: true },
    { name: "seats", type: "number", label: "Number of Seats", required: true },
  ],

  vans: [
    { name: "make", type: "select", label: "Make", required: true },
    {
      name: "model",
      type: "select",
      label: "Model",
      required: true,
      dependsOn: "make",
    },
    { name: "year", type: "number", label: "Year", required: true },
    {
      name: "cargoVolume",
      type: "number",
      label: "Cargo Volume (m³)",
      required: false,
    },
  ],

  tractors: [
    { name: "make", type: "select", label: "Make", required: true },
    {
      name: "model",
      type: "select",
      label: "Model",
      required: true,
      dependsOn: "make",
    },
    { name: "year", type: "number", label: "Year", required: true },
    {
      name: "horsepower",
      type: "number",
      label: "Horsepower (HP)",
      required: true,
    },
  ],

  construction: [
    { name: "make", type: "select", label: "Make", required: true },
    {
      name: "model",
      type: "select",
      label: "Model",
      required: true,
      dependsOn: "make",
    },
    { name: "year", type: "number", label: "Year", required: true },
    {
      name: "type",
      type: "select",
      label: "Machine Type",
      options: ["Excavator", "Bulldozer", "Crane", "Loader"],
      required: false,
    },
  ],
};
