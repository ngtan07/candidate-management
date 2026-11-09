import React from "react";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  JOB_STATUS,
  JOB_STATUS_COLORS,
  REGISTRATION_STATUS,
  REGISTRATION_STATUS_COLORS,
} from "../../utils/constants";

export const StatusBadge = ({ status, type = "application", className = "" }) => {
  if (!status) return null;

  let label = status;
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";

  if (type === "application") {
    label = APPLICATION_STATUS_LABELS[status] || status;
    colorClasses = APPLICATION_STATUS_COLORS[status] || colorClasses;
  } else if (type === "job") {
    label = status === JOB_STATUS.DRAFT ? "Draft" : status === JOB_STATUS.OPENING ? "Opening" : "Closed";
    colorClasses = JOB_STATUS_COLORS[status] || colorClasses;
  } else if (type === "registration") {
    label = status === REGISTRATION_STATUS.APPROVED ? "Approved" : status === REGISTRATION_STATUS.PENDING ? "Pending Review" : "Rejected";
    colorClasses = REGISTRATION_STATUS_COLORS[status] || colorClasses;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};

export default StatusBadge;

