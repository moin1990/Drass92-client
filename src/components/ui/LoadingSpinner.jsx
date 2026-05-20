const SIZES = {
  sm : 'h-5 w-5 border-2',
  md : 'h-10 w-10 border-[3px]',
  lg : 'h-14 w-14 border-4',
}

const LoadingSpinner = ({ fullScreen = false, size = 'md', message = 'Loading...' }) => {
  const spinner = (
    <div
      role="status"
      aria-label={message}
      className={`rounded-full border-primary/20 border-t-primary animate-spin ${SIZES[size] || SIZES.md}`}
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-4">
        {spinner}
        <p className="text-sm text-muted-foreground font-medium animate-pulse">{message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      {spinner}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export default LoadingSpinner