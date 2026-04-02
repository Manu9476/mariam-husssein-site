import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm", className)}
    {...props}
  />
));
SheetOverlay.displayName = Dialog.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
    overlayClassName?: string;
    closeClassName?: string;
    side?: "right" | "bottom";
  }
>(({ className, overlayClassName, closeClassName, side = "right", children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay className={overlayClassName} />
    <Dialog.Content
      ref={ref}
      className={cn(
        side === "bottom"
          ? "fixed bottom-0 left-1/2 z-50 flex h-[82vh] max-h-[82vh] w-full -translate-x-1/2 flex-col overflow-hidden rounded-t-[1.75rem] border border-white/10 bg-[#1f1f20] p-0 shadow-[0_-24px_80px_rgba(0,0,0,0.28)] sm:bottom-4 sm:max-w-[34rem] sm:rounded-[1.75rem]"
          : "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-[#d7eadf] bg-white p-6 shadow-sm",
        className,
      )}
      {...props}
    >
      <Dialog.Close
        className={cn(
          "absolute right-5 top-5 rounded-full p-2 transition",
          side === "bottom"
            ? "text-white/50 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground hover:bg-secondary hover:text-primary",
          closeClassName,
        )}
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </Dialog.Close>
      {children}
    </Dialog.Content>
  </SheetPortal>
));
SheetContent.displayName = Dialog.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title ref={ref} className={cn("text-2xl font-semibold text-primary", className)} {...props} />
));
SheetTitle.displayName = Dialog.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = Dialog.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
