import React from "react";
import "./styles/badge.css";

interface BadgeProps {
  text: string;
}

export const Badge: React.FC<BadgeProps> = ({ text }) => {
  return <span className="badge">{text}</span>;
};