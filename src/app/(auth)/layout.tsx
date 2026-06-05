import { Toaster } from "sonner";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        closeButton
        duration={4000}
        toastOptions={{
          style: { fontFamily: "var(--font-roboto)", borderRadius: "3px" },
          classNames: {
            toast: "!bg-white shadow-lg border border-gray-200",
            title: "font-medium text-[13px]",
            description: "text-[13px] !text-gray-900",
          },
        }}
      />
    </>
  );
}
