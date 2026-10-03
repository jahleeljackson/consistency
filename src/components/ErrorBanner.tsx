export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-[#9b3d2d]/30 bg-[#9b3d2d]/8 px-4 py-3 text-sm text-[#9b3d2d]"
    >
      {message}
    </div>
  )
}
