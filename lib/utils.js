import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const ANDROID_CLIENT_ID = "1047453891691-ih7iva36hqjitca18m5ulqs8mr0ena8i.apps.googleusercontent.com";
export const IOS_CLIENT_ID = "837231796444-6r0i1epp7p6k4tg24dg5dua43orolfrd.apps.googleusercontent.com";
export const WEB_CLIENT_ID = "1047453891691-ih7iva36hqjitca18m5ulqs8mr0ena8i.apps.googleusercontent.com";