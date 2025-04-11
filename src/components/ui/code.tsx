
import React from "react";
import { cn } from "@/lib/utils";

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
}

export const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "rounded-lg bg-muted p-4 overflow-auto text-sm font-mono text-foreground",
          className
        )}
        {...props}
      >
        <code>{children}</code>
      </pre>
    );
  }
);

Code.displayName = "Code";
