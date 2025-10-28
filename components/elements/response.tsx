"use client";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { MDUIRenderer, parseMDUI } from "@/lib/mdui";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, children, ...props }: ResponseProps) => {
    // Check if content contains MD-UI syntax
    const content = typeof children === "string" ? children : "";
    const hasMDUI =
      content.includes(":::") ||
      content.includes("{{") ||
      content.includes("action:");

    if (hasMDUI) {
      const tokens = parseMDUI(content);
      return (
        <div
          className={cn(
            "size-full space-y-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
            className
          )}
        >
          <MDUIRenderer tokens={tokens} />
        </div>
      );
    }

    return (
      <Streamdown
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
          className
        )}
        {...props}
      >
        {children}
      </Streamdown>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
