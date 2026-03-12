import KanbanBoard from "@/components/KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Drag and drop cards between columns to update their status.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
