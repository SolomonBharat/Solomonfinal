import { Toaster } from "sonner"

export { toast } from "sonner"

export function Toast() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
    />
  )
}