export type IconType = "svg" | "rect-text";

export interface TechItem {
  name: string;
  color: string;
  iconType: IconType;
  iconData: string; // SVG path data or text label for rect-text
}
