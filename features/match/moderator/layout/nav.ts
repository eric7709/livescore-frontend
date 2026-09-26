import { LayoutGrid, CalendarDays, Shirt, LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/moderator", icon: LayoutGrid },
  { label: "Matches", href: "/moderator/matches", icon: CalendarDays },
];