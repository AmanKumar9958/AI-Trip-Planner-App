import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const ANDROID_CLIENT_ID = "837231796444-aliv2nfo6g07ddcbahjk7269cs86ihkh.apps.googleusercontent.com";
export const IOS_CLIENT_ID = "837231796444-6r0i1epp7p6k4tg24dg5dua43orolfrd.apps.googleusercontent.com";
export const WEB_CLIENT_ID = "837231796444-ii8k89pp44gb8q5v4m04g0j2mk59qmbu.apps.googleusercontent.com";