import type { ReactNode } from "react";

type IconProps = { size?: number; className?: string };

function Icon({ size = 20, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"
      aria-hidden="true" focusable="false" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return <Icon {...props}><path d="M3 4h2l3 12h11l2-8H6 M9 20h.01 M18 20h.01" /></Icon>;
}

export function SearchIcon(props: IconProps) {
  return <Icon {...props}><path d="M20 20l-4-4 M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" /></Icon>;
}

export function FilterIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 6h16 M7 12h10 M10 18h4" /></Icon>;
}

export function AddIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 12h14 M12 5v14" /></Icon>;
}

export function MinusIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 12h14" /></Icon>;
}

export function DeleteIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 6h16 M9 6V4h6v2 M6 6l1 14h10l1-14 M10 10v6 M14 10v6" /></Icon>;
}

export function EditIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 20l4-.8L20 7l-3-3L5 16l-1 4Z M14.5 6.5l3 3" /></Icon>;
}

export function CloseIcon(props: IconProps) {
  return <Icon {...props}><path d="M6 6l12 12 M18 6L6 18" /></Icon>;
}

export function CheckIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 12l4 4L19 6" /></Icon>;
}

export function CheckCircleIcon(props: IconProps) {
  return <Icon {...props}><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z M7.5 12l3 3 6-6" /></Icon>;
}

export function ArrowBackIcon(props: IconProps) {
  return <Icon {...props}><path d="M19 12H5 M12 5l-7 7 7 7" /></Icon>;
}

export function ArrowForwardIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 12h14 M12 5l7 7-7 7" /></Icon>;
}

export function ChevronDownIcon(props: IconProps) {
  return <Icon {...props}><path d="M6 9l6 6 6-6" /></Icon>;
}

export function SunIcon(props: IconProps) {
  return <Icon {...props}><path d="M16 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0Z M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" /></Icon>;
}

export function MoonIcon(props: IconProps) {
  return <Icon {...props}><path d="M20.5 15.4A8.6 8.6 0 0 1 8.6 3.5a9 9 0 1 0 11.9 11.9Z" /></Icon>;
}

export function SystemIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 5h16v12H4Z M8 21h8 M12 17v4 M12 8a3 3 0 1 0 3 3" /></Icon>;
}

export function CameraIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 7h4l2-3h4l2 3h4v13H4Z M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></Icon>;
}

export function AddPhotoIcon(props: IconProps) {
  return <Icon {...props}><path d="M13 5H4v15h16v-9 M4 17l4-4 3 3 3-3 6 6 M19 3v6 M16 6h6" /></Icon>;
}

export function ImageIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 4h16v16H4Z M4 17l5-5 4 4 3-3 4 4 M15 8h.01" /></Icon>;
}

export function StarIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" /></Icon>;
}

export function RefreshIcon(props: IconProps) {
  return <Icon {...props}><path d="M20 8v5h-5 M20 13a8 8 0 1 0-2.2 5.4" /></Icon>;
}

export function RestartIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 11a8 8 0 1 1 2.2 6.4 M4 6v5h5" /></Icon>;
}

export function SaveIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 4h12l3 3v13H4V4h1 M8 4v5h8V4 M8 20v-6h8v6" /></Icon>;
}

export function SendIcon(props: IconProps) {
  return <Icon {...props}><path d="M3 4l18 8-18 8 3-8-3-8Z M6 12h9" /></Icon>;
}

export function LoginIcon(props: IconProps) {
  return <Icon {...props}><path d="M13 5h7v14h-7 M3 12h12 M11 8l4 4-4 4" /></Icon>;
}

export function LogoutIcon(props: IconProps) {
  return <Icon {...props}><path d="M11 5H4v14h7 M9 12h12 M17 8l4 4-4 4" /></Icon>;
}

export function PersonIcon(props: IconProps) {
  return <Icon {...props}><path d="M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M4 20a8 8 0 0 1 16 0" /></Icon>;
}

export function ReceiptIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 3l2 2 2-2 2 2 2-2 2 2 2-2 2 2v16l-2-2-2 2-2-2-2 2-2-2-2 2-2-2V3Z M9 9h6 M9 13h6" /></Icon>;
}

export function InventoryIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 9h14v11H5Z M4 4h16v5H4Z M9 13h6" /></Icon>;
}

export function CategoryIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 4h6v6H5Z M15 4h5v6h-5Z M5 14h6v6H5Z M15 14h5v6h-5Z" /></Icon>;
}

export function SettingsIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.7 5.7l2 2m8.6 8.6 2 2m0-12.6-2 2m-8.6 8.6-2 2 M18 12a6 6 0 1 1-12 0 6 6 0 1 1 12 0Z M14 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0Z" /></Icon>;
}

export function PhoneIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 4h4l2 5-2 2a13 13 0 0 0 4 4l2-2 5 2v4c0 1-1 2-2 2C10 20 4 14 3 6c0-1 1-2 2-2Z" /></Icon>;
}

export function InfoIcon(props: IconProps) {
  return <Icon {...props}><path d="M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0Z M12 11v5 M12 8h.01" /></Icon>;
}

export function WarningIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 3 2.5 20h19L12 3Z M12 9v4 M12 16h.01" /></Icon>;
}

export function ErrorIcon(props: IconProps) {
  return <Icon {...props}><path d="M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0Z M12 8v5 M12 16h.01" /></Icon>;
}

export function StoreIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 10l2-6h12l2 6 M4 10v3h16v-3H4Z M6 13v7h12v-7 M10 20v-4h4v4" /></Icon>;
}
