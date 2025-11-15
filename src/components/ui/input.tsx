import * as React from 'react';

import { getComponentBaseClass } from "@/lib/designSystem";
import { cn } from "@/lib/utils";

const inputBaseClass = cn(
  getComponentBaseClass("input"),
  "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputBaseClass, "text-base md:text-sm", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
