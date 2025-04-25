import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListingCard from "./ListingCard";

// Mock translation function
type TFunction = (key: string) => string;
const t: TFunction = (key) => key;

// Minimal required props for ListingCard
const baseProps = {
  t,
  // Add other required props with sensible defaults or mocks
  // For this test, we'll focus on vehicleDetails
  listing: {
    category: "vehicle",
    vehicleDetails: {},
    realEstateDetails: {},
    // ...other minimal fields
  },
  // ...other props as needed
};

describe("ListingCard - vehicleDetails edge cases", () => {
  it("renders string transmission and fuelType", () => {
    render(
      <ListingCard
        {...baseProps}
        listing={{
          ...baseProps.listing,
          vehicleDetails: { transmission: "automatic", fuelType: "gasoline" },
        }}
      />,
    );
    expect(
      screen.getByText("enums.transmission.automatic"),
    ).toBeInTheDocument();
    expect(screen.getByText("enums.fuel.gasoline")).toBeInTheDocument();
  });

  it("renders number transmission and fuelType", () => {
    render(
      <ListingCard
        {...baseProps}
        listing={{
          ...baseProps.listing,
          vehicleDetails: { transmission: 1, fuelType: 2 },
        }}
      />,
    );
    expect(screen.getByText("enums.transmission.1")).toBeInTheDocument();
    expect(screen.getByText("enums.fuel.2")).toBeInTheDocument();
  });

  it("renders object transmission and fuelType", () => {
    render(
      <ListingCard
        {...baseProps}
        listing={{
          ...baseProps.listing,
          vehicleDetails: {
            transmission: { auto: true, manual: false },
            fuelType: { gasoline: true, diesel: false },
          },
        }}
      />,
    );
    expect(screen.getByText("auto, manual")).toBeInTheDocument();
    expect(screen.getByText("gasoline, diesel")).toBeInTheDocument();
  });

  it("renders fallback for null/undefined transmission and fuelType", () => {
    render(
      <ListingCard
        {...baseProps}
        listing={{
          ...baseProps.listing,
          vehicleDetails: { transmission: null, fuelType: undefined },
        }}
      />,
    );
    expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(2);
  });

  it("renders fallback for missing vehicleDetails", () => {
    render(
      <ListingCard
        {...baseProps}
        listing={{
          ...baseProps.listing,
          vehicleDetails: undefined,
        }}
      />,
    );
    expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(1);
  });
});
