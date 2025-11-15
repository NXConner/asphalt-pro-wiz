import * as React from 'react';

import { getComponentBaseClass } from "@/lib/designSystem";
import { cn } from "@/lib/utils";

const textareaBaseClass = cn(getComponentBaseClass("textarea"), "resize-y align-top");

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  children?: React.ReactNode;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaBaseClass, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
