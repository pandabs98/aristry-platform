import * as React from "react";



interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'danger' | 'destructive'; // Add more if needed
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    const baseStyle = "px-4 py-2 rounded";
    const variantStyles = {
      default: "bg-blue-600 text-white",
      ghost: "bg-black text-white hover:bg-gray-700",
      outline: "border border-gray-400",
      danger: "bg-black text-white hover:bg-red-600 ",
      destructive: "bg-black text-white"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
