import { Plus } from "lucide-react";

type AddButtonProps = {
  onClick: () => void;
  label?: string;
};

export function AddButton({
  onClick,
  label = "Add",
}: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex items-center gap-1.5
        h-10 rounded-xl
        bg-emerald-500 px-4
        text-xs font-semibold text-white
        shadow-sm shadow-emerald-200
        transition-all duration-200
        hover:bg-emerald-600
        hover:shadow-md hover:shadow-emerald-200
        active:scale-[0.98]
      "
    >
      <Plus size={13} strokeWidth={2.5} />
      {label}
    </button>
  );
}