import { forwardRef } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
  return (
    <button
      className={[
        'w-full flex items-center justify-center h-9 rounded bg-gray-900 text-white',
        className || '',
        props.disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
      ref={ref}
      {...props}
    />
  )
})
