import React from "react";
import {
  FaCar,
  FaHome,
  FaBuilding,
  FaMotorcycle,
  FaTruck,
  FaBus,
  FaTractor,
  FaTachometerAlt, // Mileage
  FaCalendarAlt, // Year
  FaGasPump, // Fuel Type
  FaCogs, // Transmission (alt)
  FaGripLines, // Transmission (modern)
  FaBolt, // Power (kW)
  FaHorseHead, // Horsepower
  FaBath, // Bathrooms
  FaBed, // Bedrooms
} from "react-icons/fa";
import { MdConstruction } from "react-icons/md";
import { GiTreeBranch } from "react-icons/gi";

// Custom Heart Icons
const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const HeartFilledIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const icons: { [key: string]: React.ComponentType<any> } = {
  FaCar,
  FaHome,
  FaBuilding,
  FaMotorcycle,
  FaTruck,
  FaBus,
  FaTractor,
  FaTachometerAlt, // Mileage
  FaCalendarAlt, // Year
  FaGasPump, // Fuel Type
  FaCogs, // Transmission (alt)
  FaGripLines, // Transmission (modern)
  FaBolt, // Power (kW)
  FaHorseHead, // Horsepower
  FaBath, // Bathrooms
  FaBed, // Bedrooms
  MdConstruction,
  GiTreeBranch,
  HeartIcon,
  HeartFilledIcon,
};

export const renderIcon = (iconName: string, className: string) => {
  const Icon = icons[iconName];
  return Icon ? <Icon className={className} /> : null;
};
