// src/components/ui/Button.jsx
import { forwardRef } from "react";

const VARIANTS = {
  primary: {
    className:
      "bg-primary text-primary-fg hover-glow hover-shine focus-ring " +
      "shadow-[0_0_0_1px_color-mix(in srgb, var(--color-primary) 35%, transparent),0_6px_20px_-6px_color-mix(in srgb, var(--color-primary) 40%, transparent)]",
  },
  secondary: {
    className:
      "bg-transparent text-text-primary border border-border-strong " +
      "hover:border-primary/50 hover:bg-hover hover-micro focus-ring",
  },
  ghost: {
    className:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-hover hover-micro focus-ring",
  },
  danger: {
    className:
      "bg-danger text-white hover:brightness-110 hover-micro focus-ring",
  },
};

const SIZES = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-md",
  md: "h-11 px-5 text-[14px] gap-2 rounded-lg",
  lg: "h-13 px-7 text-[15px] gap-2.5 rounded-lg",
};

const Button = forwardRef(
  (
    {
      as: Component = "button",
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "right",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const v = VARIANTS[variant] ?? VARIANTS.primary;
    return (
      <Component
        ref={ref}
        className={`group/btn inline-flex items-center justify-center font-medium tracking-tight
          transition-all duration-200 ease-out select-none
          disabled:opacity-50 disabled:pointer-events-none
          ${v.className} ${SIZES[size]} ${className}`}
        {...props}
      >
        {Icon && iconPosition === "left" && (
          <Icon
            size={16}
            strokeWidth={1.75}
            className="transition-transform duration-200 group-hover/btn:-translate-x-0.5"
          />
        )}
        <span className="relative z-[2]">{children}</span>
        {Icon && iconPosition === "right" && (
          <Icon
            size={16}
            strokeWidth={1.75}
            className="transition-transform duration-200 group-hover/btn:translate-x-0.5 relative z-[2]"
          />
        )}
      </Component>
    );
  }
);

Button.displayName = "Button";
export default Button;
