
import React from "react";
import { cn } from "@/lib/utils";

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
}

const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "rounded-md bg-muted p-4 overflow-auto text-sm text-muted-foreground font-mono",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    );
  }
);

Code.displayName = "Code";

export { Code };
