import * as DialogPrimitive from '@radix-ui/react-dialog'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent(props: DialogPrimitive.DialogContentProps) {
  const { className, children, ...rest } = props
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        className={[
          'fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ children }: { children?: React.ReactNode }) {
  return <div className="border-b px-4 py-3">{children}</div>
}

export function DialogTitle(props: DialogPrimitive.DialogTitleProps) {
  const { className, ...rest } = props
  return (
    <DialogPrimitive.Title
      className={['text-base font-semibold', className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}

export function DialogDescription(props: DialogPrimitive.DialogDescriptionProps) {
  const { className, ...rest } = props
  return (
    <DialogPrimitive.Description
      className={['text-sm text-gray-600', className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
