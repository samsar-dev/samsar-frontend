import React from "react";
import {
  FaCar,
  FaHome,
  FaBuilding,
  FaMotorcycle,
  FaTruck,
  FaBus,
  FaTractor,
} from "react-icons/fa";
import { MdConstruction } from "react-icons/md";
import { GiTreeBranch } from "react-icons/gi";

const icons: { [key: string]: React.ComponentType<any> } = {
  FaCar,
  FaHome,
  FaBuilding,
  FaMotorcycle,
  FaTruck,
  FaBus,
  FaTractor,
  MdConstruction,
  GiTreeBranch,
};

export const renderIcon = (iconName: string, className: string) => {
  const Icon = icons[iconName];
  return Icon ? <Icon className={className} /> : null;
};
