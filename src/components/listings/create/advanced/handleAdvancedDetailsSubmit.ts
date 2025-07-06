import {
  Condition,
  FuelType,
  ListingCategory,
  PropertyType,
  TransmissionType,
  VehicleType,
} from "@/types/enums";
import { toast } from "react-hot-toast";
import type {
  FormState,
  RealEstateDetails,
  VehicleDetails,
} from "../../../../types/listings";
import type { ExtendedFormState } from "../steps/AdvancedDetailsForm";
import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "i18next";
import { cleanLocationString } from "@/utils/locationUtils";

export const handleAdvancedDetailsSubmit = (
  data: ExtendedFormState,
  isValid: boolean,
  setFormData: Dispatch<SetStateAction<FormState>>,
  setStep: Dispatch<SetStateAction<number>>,
  t: TFunction<"translation", undefined>
) => {
  console.log("Advanced details form data:", data);
  console.log("Advanced details form validity:", isValid);
  if (isValid) {
    console.log("Advanced details submitted:", data);
    // Ensure we preserve all feature values

    setFormData((prev) => {
      // Clean location data if it exists
      const cleanedData = {
        ...data,
        location: data.location ? cleanLocationString(data.location) : prev.location,
      };
      // Deep merge the details objects
      const mergedVehicles =
        cleanedData.category.mainCategory === ListingCategory.VEHICLES
          ? {
              ...prev.details?.vehicles,
              ...cleanedData.details?.vehicles,
              // Ensure all fields have proper fallback values
              vehicleType:
                cleanedData.details?.vehicles?.vehicleType ||
                prev.details?.vehicles?.vehicleType ||
                VehicleType.CAR,
              make:
                cleanedData.details?.vehicles?.make ||
                prev.details?.vehicles?.make ||
                "",
              model:
                cleanedData.details?.vehicles?.model ||
                prev.details?.vehicles?.model ||
                "",
              mileage:
                data.details?.vehicles?.mileage ||
                prev.details?.vehicles?.mileage ||
                0,
              fuelType:
                data.details?.vehicles?.fuelType ||
                prev.details?.vehicles?.fuelType ||
                FuelType.GASOLINE,
              transmissionType:
                data.details?.vehicles?.transmissionType ||
                prev.details?.vehicles?.transmissionType ||
                TransmissionType.AUTOMATIC,
              color:
                data.details?.vehicles?.color ||
                prev.details?.vehicles?.color ||
                "#000000",
              condition:
                data.details?.vehicles?.condition ||
                prev.details?.vehicles?.condition ||
                Condition.GOOD,
              // Handle vehicle features as a properly typed object
              features: {
                ...prev.details?.vehicles?.features,
                // Convenience features
                keylessEntry:
                  data.details?.vehicles?.features?.keylessEntry ??
                  prev.details?.vehicles?.features?.keylessEntry ??
                  false,
                sunroof:
                  data.details?.vehicles?.features?.sunroof ??
                  prev.details?.vehicles?.features?.sunroof ??
                  false,
                spareKey:
                  data.details?.vehicles?.features?.spareKey ??
                  prev.details?.vehicles?.features?.spareKey ??
                  false,
                remoteStart:
                  data.details?.vehicles?.features?.remoteStart ??
                  prev.details?.vehicles?.features?.remoteStart ??
                  false,
                powerTailgate:
                  data.details?.vehicles?.features?.powerTailgate ??
                  prev.details?.vehicles?.features?.powerTailgate ??
                  false,
                autoDimmingMirrors:
                  data.details?.vehicles?.features?.autoDimmingMirrors ??
                  prev.details?.vehicles?.features?.autoDimmingMirrors ??
                  false,
                rainSensingWipers:
                  data.details?.vehicles?.features?.rainSensingWipers ??
                  prev.details?.vehicles?.features?.rainSensingWipers ??
                  false,
                // Safety features
                blindSpotMonitor:
                  data.details?.vehicles?.features?.blindSpotMonitor ??
                  prev.details?.vehicles?.features?.blindSpotMonitor ??
                  false,
                laneAssist:
                  data.details?.vehicles?.features?.laneAssist ??
                  prev.details?.vehicles?.features?.laneAssist ??
                  false,
                adaptiveCruiseControl:
                  data.details?.vehicles?.features?.adaptiveCruiseControl ??
                  prev.details?.vehicles?.features?.adaptiveCruiseControl ??
                  false,
                tractionControl:
                  data.details?.vehicles?.features?.tractionControl ??
                  prev.details?.vehicles?.features?.tractionControl ??
                  false,
                abs:
                  data.details?.vehicles?.features?.abs ??
                  prev.details?.vehicles?.features?.abs ??
                  false,
                emergencyBrakeAssist:
                  data.details?.vehicles?.features?.emergencyBrakeAssist ??
                  prev.details?.vehicles?.features?.emergencyBrakeAssist ??
                  false,
                tirePressureMonitoring:
                  data.details?.vehicles?.features?.tirePressureMonitoring ??
                  prev.details?.vehicles?.features?.tirePressureMonitoring ??
                  false,
                // Camera features
                rearCamera:
                  data.details?.vehicles?.features?.rearCamera ??
                  prev.details?.vehicles?.features?.rearCamera ??
                  false,
                camera360:
                  data.details?.vehicles?.features?.camera360 ??
                  prev.details?.vehicles?.features?.camera360 ??
                  false,
                dashCam:
                  data.details?.vehicles?.features?.dashCam ??
                  prev.details?.vehicles?.features?.dashCam ??
                  false,
                nightVision:
                  data.details?.vehicles?.features?.nightVision ??
                  prev.details?.vehicles?.features?.nightVision ??
                  false,
                parkingSensors:
                  data.details?.vehicles?.features?.parkingSensors ??
                  prev.details?.vehicles?.features?.parkingSensors ??
                  false,
                // Climate features
                climateControl:
                  data.details?.vehicles?.features?.climateControl ??
                  prev.details?.vehicles?.features?.climateControl ??
                  false,
                heatedSeats:
                  data.details?.vehicles?.features?.heatedSeats ??
                  prev.details?.vehicles?.features?.heatedSeats ??
                  false,
                ventilatedSeats:
                  data.details?.vehicles?.features?.ventilatedSeats ??
                  prev.details?.vehicles?.features?.ventilatedSeats ??
                  false,
                dualZoneClimate:
                  data.details?.vehicles?.features?.dualZoneClimate ??
                  prev.details?.vehicles?.features?.dualZoneClimate ??
                  false,
                rearAC:
                  data.details?.vehicles?.features?.rearAC ??
                  prev.details?.vehicles?.features?.rearAC ??
                  false,
                airQualitySensor:
                  data.details?.vehicles?.features?.airQualitySensor ??
                  prev.details?.vehicles?.features?.airQualitySensor ??
                  false,
                // Lighting features
                ledHeadlights:
                  data.details?.vehicles?.features?.ledHeadlights ??
                  prev.details?.vehicles?.features?.ledHeadlights ??
                  false,
                adaptiveHeadlights:
                  data.details?.vehicles?.features?.adaptiveHeadlights ??
                  prev.details?.vehicles?.features?.adaptiveHeadlights ??
                  false,
                ambientLighting:
                  data.details?.vehicles?.features?.ambientLighting ??
                  prev.details?.vehicles?.features?.ambientLighting ??
                  false,
                fogLights:
                  data.details?.vehicles?.features?.fogLights ??
                  prev.details?.vehicles?.features?.fogLights ??
                  false,
                automaticHighBeams:
                  data.details?.vehicles?.features?.automaticHighBeams ??
                  prev.details?.vehicles?.features?.automaticHighBeams ??
                  false,
                // Entertainment features
                bluetooth:
                  data.details?.vehicles?.features?.bluetooth ??
                  prev.details?.vehicles?.features?.bluetooth ??
                  false,
                appleCarPlay:
                  data.details?.vehicles?.features?.appleCarPlay ??
                  prev.details?.vehicles?.features?.appleCarPlay ??
                  false,
                androidAuto:
                  data.details?.vehicles?.features?.androidAuto ??
                  prev.details?.vehicles?.features?.androidAuto ??
                  false,
                premiumSound:
                  data.details?.vehicles?.features?.premiumSound ??
                  prev.details?.vehicles?.features?.premiumSound ??
                  false,
                wirelessCharging:
                  data.details?.vehicles?.features?.wirelessCharging ??
                  prev.details?.vehicles?.features?.wirelessCharging ??
                  false,
                usbPorts:
                  data.details?.vehicles?.features?.usbPorts ??
                  prev.details?.vehicles?.features?.usbPorts ??
                  false,
                cdPlayer:
                  data.details?.vehicles?.features?.cdPlayer ??
                  prev.details?.vehicles?.features?.cdPlayer ??
                  false,
                dvdPlayer:
                  data.details?.vehicles?.features?.dvdPlayer ??
                  prev.details?.vehicles?.features?.dvdPlayer ??
                  false,
                rearSeatEntertainment:
                  data.details?.vehicles?.features?.rearSeatEntertainment ??
                  prev.details?.vehicles?.features?.rearSeatEntertainment ??
                  false,
              },
              interiorColor:
                data.details?.vehicles?.interiorColor ||
                prev.details?.vehicles?.interiorColor ||
                "#000000",
              engine:
                data.details?.vehicles?.engine ||
                prev.details?.vehicles?.engine ||
                "",
              horsepower:
                data.details?.vehicles?.horsepower ||
                prev.details?.vehicles?.horsepower ||
                0,
              torque:
                data.details?.vehicles?.torque ||
                prev.details?.vehicles?.torque ||
                0,
              warranty:
                data.details?.vehicles?.warranty ||
                prev.details?.vehicles?.warranty ||
                "",
            }
          : undefined;

      const mergedRealEstate =
        data.category.mainCategory === ListingCategory.REAL_ESTATE
          ? (() => {
              const propertyType =
                data.details?.realEstate?.propertyType ||
                prev.details?.realEstate?.propertyType ||
                PropertyType.HOUSE;

              console.log(propertyType);

              const baseDetails = {
                size:
                  data.details?.realEstate?.size ||
                  prev.details?.realEstate?.size ||
                  0,
                condition: (data.details?.realEstate?.condition ||
                  prev.details?.realEstate?.condition ||
                  Condition.GOOD) as Condition,
                features:
                  data.details?.realEstate?.features ||
                  prev.details?.realEstate?.features ||
                  [],
              };

              return {
                ...baseDetails,
                ...data?.details?.realEstate,
                ...prev?.details?.realEstate,
              };
            })()
          : undefined;

      // Log the merged data objects
      console.log("Merged vehicles data:", mergedVehicles);
      console.log("Merged real estate data:", mergedRealEstate);

      // Updated form data with merged details
      const updatedData: FormState = {
        ...prev,
        details: {
          vehicles: mergedVehicles as VehicleDetails,
          realEstate: mergedRealEstate as RealEstateDetails,
        },
      };

      console.log("Updated form data after advanced details:", updatedData);

      // Save to session storage
      sessionStorage.setItem(
        "createListingFormData",
        JSON.stringify(updatedData)
      );
      return updatedData;
    });

    setStep((prev) => prev + 1);
    toast.success(t("stepSaved"), {
      id: "step-saved",
      duration: 2000,
    });
  } else {
    toast.error(t("completeAllRequiredFields"), {
      id: "validation-error",
      duration: 3000,
    });
    console.error("Advanced details form validation failed");
  }
};
