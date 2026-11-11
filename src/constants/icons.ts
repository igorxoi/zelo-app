import ArrowRight from "@/assets/icons/arrow-right.svg";
import Calendar from "@/assets/icons/calendar.svg";
import ErrorIcon from "@/assets/icons/error.svg";
import Home from "@/assets/icons/home.svg";
import InfoIcon from "@/assets/icons/info.svg";
import Pill from "@/assets/icons/pill.svg";
import SuccessIcon from "@/assets/icons/success.svg";
import User from "@/assets/icons/user.svg";
import Warning from "@/assets/icons/warning.svg";

export const Icons = {
  arrowRight: ArrowRight,
  calendar: Calendar,
  home: Home,
  pill: Pill,
  user: User,
  warning: Warning,
  info: InfoIcon,
  error: ErrorIcon,
  success: SuccessIcon,
  ArrowRight: ArrowRight,
} as const;

export const ICON_SIZE = 22;

export type IconName = keyof typeof Icons;
