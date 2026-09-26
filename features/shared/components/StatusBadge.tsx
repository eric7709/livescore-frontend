export default function StatusBadge({ isStarter }: { isStarter: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
        isStarter ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isStarter ? 'Starter' : 'Bench'}
    </span>
  );
}