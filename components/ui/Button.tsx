import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

/**
 * Button — BRIEF §8.1
 * Pill-shaped, gold-on-forest brand refresh.
 * Variants: primary | secondary | tertiary | outline-primary | on-card
 * Sizes:    sm | md | lg
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline-primary"
  | "on-card";

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
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50";

const sizeMap: Record<ButtonSize, string> = {
  sm: "px-[18px] py-[10px] text-caption",
  md: "px-[22px] py-[12px] text-body",
  lg: "px-[26px] py-[14px] text-body-lg",
};

const variantMap: Record<ButtonVariant, string> = {
  primary:
    "bg-gold-500 text-forest-900 hover:bg-gold-600",
  secondary:
    "border border-mist-400/40 text-mist-50 bg-transparent hover:bg-mist-50/5 hover:border-mist-400/70",
  tertiary:
    "text-gold-500 bg-transparent hover:text-gold-400 px-0 py-0 underline-offset-4 hover:underline",
  "outline-primary":
    "border border-gold-500 text-gold-500 bg-transparent hover:bg-gold-500/10",
  "on-card":
    "bg-forest-900 text-mist-50 hover:bg-forest-800",
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
