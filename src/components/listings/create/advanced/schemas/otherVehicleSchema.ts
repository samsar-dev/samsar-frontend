import { ListingFieldSchema } from "@/types/listings";
import { Condition, FuelType, TransmissionType } from "@/types/enums";

export const commonVehicleFields: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "color",
    label: "fields.exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
  },
  {
    name: "interiorColor",
    label: "fields.interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
  },
  {
    name: "condition",
    label: "fields.condition",
    type: "select",
    options: Object.values(Condition).map((value) => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.condition.${value.toUpperCase()}`,
    })),
    section: "essential",
    required: true,
  },
  {
    name: "previousOwners",
    label: "fields.previousOwners",
    type: "number",
    section: "essential",
    required: false,
  },
  {
    name: "registrationStatus",
    label: "fields.registrationStatus",
    type: "select",
    options: [
      {
        value: "valid",
        label: "VALID",
        translationKey: "enums.registrationStatus.VALID",
      },
      {
        value: "expired",
        label: "EXPIRED",
        translationKey: "enums.registrationStatus.EXPIRED",
      },
      {
        value: "not_registered",
        label: "NOT_REGISTERED",
        translationKey: "enums.registrationStatus.NOT_REGISTERED",
      },
      {
        value: "other",
        label: "OTHER",
        translationKey: "enums.registrationStatus.OTHER",
      },
    ],
    section: "essential",
    required: false,
  },
  {
    name: "engine",
    label: "fields.engine",
    type: "text",
    section: "essential",
    required: false,
  },
  {
    name: "fuelType",
    label: "fields.fuelType",
    type: "select",
    options: Object.values(FuelType).map((value) => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.fuelType.${value.toUpperCase()}`,
    })),
    section: "essential",
    required: false,
  },
  {
    name: "transmissionType",
    label: "fields.transmissionType",
    type: "select",
    options: Object.values(TransmissionType).map((value) => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.transmission.${value.toUpperCase()}`,
    })),
    section: "essential",
    required: false,
  },
  {
    name: "serviceHistory",
    label: "fields.serviceHistory",
    type: "multiselect",
    options: [
      {
        value: "full",
        label: "FULL",
        translationKey: "enums.serviceHistory.FULL",
      },
      {
        value: "partial",
        label: "PARTIAL",
        translationKey: "enums.serviceHistory.PARTIAL",
      },
      {
        value: "no_history",
        label: "NO_HISTORY",
        translationKey: "enums.serviceHistory.NO_HISTORY",
      },
      {
        value: "unknown",
        label: "UNKNOWN",
        translationKey: "enums.serviceHistory.UNKNOWN",
      },
    ],
    section: "essential",
    required: false,
  },
  {
    name: "hours",
    label: "fields.hours",
    type: "number",
    section: "essential",
    required: false,
  },
  {
    name: "horsepower",
    label: "fields.horsepower",
    type: "number",
    section: "essential",
    required: false,
  },
  {
    name: "driveSystem",
    label: "fields.driveSystem",
    type: "select",
    options: [
      { value: "2WD", label: "2WD", translationKey: "enums.driveSystem.2WD" },
      { value: "4WD", label: "4WD", translationKey: "enums.driveSystem.4WD" },
      {
        value: "MFWD",
        label: "MFWD",
        translationKey: "enums.driveSystem.MFWD",
      },
      { value: "AWD", label: "AWD", translationKey: "enums.driveSystem.AWD" },
      {
        value: "tracked",
        label: "TRACKED",
        translationKey: "enums.driveSystem.TRACKED",
      },
    ],
    section: "essential",
    required: false,
  },
  {
    name: "emissions",
    label: "fields.emissions",
    type: "select",
    options: [
      {
        value: "Euro 6",
        label: "EURO_6",
        translationKey: "enums.emissions.EURO_6",
      },
      {
        value: "Euro 5",
        label: "EURO_5",
        translationKey: "enums.emissions.EURO_5",
      },
      {
        value: "Euro 4",
        label: "EURO_4",
        translationKey: "enums.emissions.EURO_4",
      },
      {
        value: "Euro 3",
        label: "EURO_3",
        translationKey: "enums.emissions.EURO_3",
      },
      {
        value: "Other",
        label: "OTHER",
        translationKey: "enums.emissions.OTHER",
      },
      {
        value: "Unknown",
        label: "UNKNOWN",
        translationKey: "enums.emissions.UNKNOWN",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "fields.warranty",
    type: "text",
    section: "advanced",
    required: false,
  },
];
