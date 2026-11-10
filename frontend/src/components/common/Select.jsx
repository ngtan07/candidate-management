import React, { forwardRef } from "react";

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      id,
      name,
      options = [],
      placeholder = "Select an option",
      className = "",
      ...props
    },
    ref
  ) => {
    const selectId = id || name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={name}
          className={`block w-full rounded-lg border text-sm transition-colors px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 ${
            error
              ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200"
              : "border-slate-300 text-slate-900 focus:border-teal-600 focus:ring-teal-100"
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === "object" ? opt.value : opt;
            const text = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;

