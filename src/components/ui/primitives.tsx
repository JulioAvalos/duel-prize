import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-fg hover:brightness-110',
        outline: 'border border-border bg-surface-2 hover:bg-border',
        ghost: 'hover:bg-surface-2',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn('rounded-xl border border-border bg-surface p-4 sm:p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('mb-3 flex items-center gap-2 text-lg font-semibold', className)} {...props} />
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border border-border bg-surface-2 px-3 text-sm outline-none focus:border-primary aria-[invalid=true]:border-danger',
        className,
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn('mb-1 block text-sm text-muted', className)} {...props} />
}

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-border transition-colors data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  )
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted', className)}
      {...props}
    />
  )
}

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn('flex items-start gap-2 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger', className)}
      {...props}
    />
  )
}

/** Integer/decimal field that keeps its own text so partial typing ("5.") works. */
export function NumberInput({
  value,
  onValueChange,
  invalid,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: number
  onValueChange: (n: number) => void
  invalid?: boolean
}) {
  const [text, setText] = React.useState(String(value))
  const [focused, setFocused] = React.useState(false)
  React.useEffect(() => {
    if (!focused) setText(Number.isFinite(value) ? String(value) : '')
  }, [value, focused])
  return (
    <Input
      type="number"
      inputMode="decimal"
      aria-invalid={invalid || undefined}
      value={text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        setText(e.target.value)
        onValueChange(e.target.value === '' ? NaN : Number(e.target.value))
      }}
      {...props}
    />
  )
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  label: string
}) {
  const [text, setText] = React.useState(String(value))
  const [focused, setFocused] = React.useState(false)
  React.useEffect(() => {
    if (!focused) setText(String(value))
  }, [value, focused])

  const commit = (raw: string) => {
    if (raw.trim() === '') return
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    onChange(Math.min(max, Math.max(min, Math.floor(n))))
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <Button variant="outline" size="icon" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        {'−'}
      </Button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={`${label} value`}
        min={min}
        max={max}
        step={1}
        value={text}
        onFocus={(e) => {
          setFocused(true)
          e.currentTarget.select()
        }}
        onBlur={() => {
          setFocused(false)
          setText(String(value))
        }}
        onChange={(e) => {
          setText(e.target.value)
          commit(e.target.value)
        }}
        className="h-9 w-14 rounded-md border border-border bg-surface-2 text-center tabular-nums outline-none focus:border-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button variant="outline" size="icon" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </Button>
    </div>
  )
}
