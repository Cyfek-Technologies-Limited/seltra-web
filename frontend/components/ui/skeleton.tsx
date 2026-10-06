export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`rounded-md bg-gray-200/70 dark:bg-gray-700/50 animate-pulse ${className}`}
    />
  );
};
