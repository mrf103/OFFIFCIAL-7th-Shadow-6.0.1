import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, format = "long") {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (format === "short") {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dateObj);
  }
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

export function formatNumber(num, options = {}) {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("ar-SA", options).format(num);
}

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 بايت";
  const k = 1024;
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function truncate(str, length = 50) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}
