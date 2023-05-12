import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className={['flex flex-col', className ?? ''].join(' ')}>
        {label ? <label>{label}</label> : null}
        <input
          ref={ref}
          {...props}
          type="text"
          required
          className="w-full flex items-center h-9 rounded bg-white border border-gray-300 focus:border-gray-400 px-2"
        />
      </div>
    )
  }
)
