type Props = {
  color?: "RED" | "BLUE" | "GRAY" | "GREEN" | "YELLOW"
  children?: React.ReactNode
  title: string
  onClick?: () => void
  full?: boolean
  py?: string
}

export default function ActionButton({
  color = "BLUE",
  children,
  title,
  onClick,
  full,
  py,
}: Props) {

  const styles = {
    BLUE: "border-blue-800 bg-linear-to-b from-blue-500 via-blue-600 to-blue-700",
    RED: "border-red-800 bg-linear-to-b from-red-500 via-red-600 to-red-700",
    YELLOW: "border-yellow-800 bg-linear-to-b from-yellow-500 via-yellow-600 to-yellow-700",
    GRAY: "border-gray-800 bg-linear-to-b from-gray-500 via-gray-600 to-gray-700",
    GREEN: "border-green-800 bg-linear-to-b from-green-500 via-green-600 to-green-700",
  }


  return (
    <button
      onClick={onClick}
      className={`
        px-2.5 h-11 
        duration-300 
        active:scale-95 
        text-[13px]
        shadow-md 
        ${full ? "w-full" : "w-fit"}
        rounded-xl
        text-white
        font-semibold
        flex items-center justify-center gap-2
        border
        tracking-wider
        cursor-pointer
        ${styles[color]}
      `}
    >
      {children}
      <span>{title}</span>
    </button>
  )
}