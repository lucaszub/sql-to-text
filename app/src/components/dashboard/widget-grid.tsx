"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { WidgetCard } from "@/components/widget-card";
import type { DashboardWidget } from "@/lib/widget-store";

// ── Sortable wrapper ──────────────────────────────────────────────────────────

const SIZE_SPAN: Record<DashboardWidget["size"], string> = {
  sm: "col-span-1",
  md: "col-span-2",
  lg: "col-span-3",
};

function SortableWidget({
  widget,
  editMode,
  onDelete,
}: {
  widget: DashboardWidget;
  editMode: boolean;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        SIZE_SPAN[widget.size],
        isDragging && "opacity-50 z-10",
      )}
      {...attributes}
    >
      <WidgetCard
        widget={widget}
        editMode={editMode}
        dragHandleProps={editMode ? listeners : undefined}
        onDelete={onDelete}
      />
    </div>
  );
}

// ── WidgetGrid ────────────────────────────────────────────────────────────────

interface WidgetGridProps {
  widgets: DashboardWidget[];
  editMode: boolean;
  onReorder: (widgets: DashboardWidget[]) => void;
  onDelete: (id: string) => void;
}

export function WidgetGrid({ widgets, editMode, onReorder, onDelete }: WidgetGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = widgets.findIndex(w => w.id === active.id);
    const newIndex  = widgets.findIndex(w => w.id === over.id);
    onReorder(arrayMove(widgets, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-4">
          {widgets.map(w => (
            <SortableWidget
              key={w.id}
              widget={w}
              editMode={editMode}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
