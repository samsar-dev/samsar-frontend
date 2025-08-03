import React from "react";
import { FaCar } from "@react-icons/all-files/fa/FaCar";
import { FaHome } from "@react-icons/all-files/fa/FaHome";
import { FaBuilding } from "@react-icons/all-files/fa/FaBuilding";
import { FaMotorcycle } from "@react-icons/all-files/fa/FaMotorcycle";
import { FaTruck } from "@react-icons/all-files/fa/FaTruck";
import { FaBus } from "@react-icons/all-files/fa/FaBus";
import { FaTractor } from "@react-icons/all-files/fa/FaTractor";
import { FaTachometerAlt } from "@react-icons/all-files/fa/FaTachometerAlt"; // Mileage
import { FaCalendarAlt } from "@react-icons/all-files/fa/FaCalendarAlt"; // Year
import { FaGasPump } from "@react-icons/all-files/fa/FaGasPump"; // Fuel Type
import { FaCogs } from "@react-icons/all-files/fa/FaCogs"; // Transmission (alt)
import { FaGripLines } from "@react-icons/all-files/fa/FaGripLines"; // Transmission (modern)
import { FaBolt } from "@react-icons/all-files/fa/FaBolt"; // Power (kW)
import { FaHorseHead } from "@react-icons/all-files/fa/FaHorseHead"; // Horsepower
import { FaBath } from "@react-icons/all-files/fa/FaBath"; // Bathrooms
import { FaBed } from "@react-icons/all-files/fa/FaBed"; // Bedrooms
import { MdBuild } from "@react-icons/all-files/md/MdBuild";
import { GiTreeBranch } from "@react-icons/all-files/gi/GiTreeBranch";

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
  MdBuild,
  GiTreeBranch,
  HeartIcon,
  HeartFilledIcon,
};

export const renderIcon = (iconName: string, className: string) => {
  const Icon = icons[iconName];
  return Icon ? <Icon className={className} /> : null;
};
