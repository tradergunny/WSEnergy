import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

/**
 * Button — BRIEF §8.1
 * Variants: primary | secondary | tertiary | outline-primary
 * Sizes:    sm | md | lg
 *
 * Rules: max one primary per viewport, 8px radius, no drop shadows,
 * hover darkens ~10%, focus shows 2px Brand 200 ring (handled globally).
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline-primary";

export type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const sizeMap: Record<ButtonSize, string> = {
  sm: "px-[14px] py-[8px] text-caption",
  md: "px-[22px] py-[12px] text-body",
  lg: "px-[26px] py-[14px] text-body-lg",
};

const variantMap: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-800",
  secondary:
    "border border-graphite-600 text-graphite-900 bg-transparent hover:bg-graphite-100",
  tertiary:
    "text-brand-600 bg-transparent hover:text-brand-800 px-0 py-0",
  "outline-primary":
    "border border-brand-600 text-brand-600 bg-transparent hover:bg-brand-50",
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
  } = props;

  const classes =
    `${base} ${variantMap[variant]} ${variant !== "tertiary" ? sizeMap[size] : ""} ${className}`.trim();

  if ("href" in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } =
      props;
    void _v;
    void _s;
    void _c;
    void _ch;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonAsButton;
  void _v;
  void _s;
  void _c;
  void _ch;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
