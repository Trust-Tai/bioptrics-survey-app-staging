import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor, DragSourceMonitor } from 'react-dnd';
import { FaTimes, FaGripVertical } from 'react-icons/fa';

interface Answer {
  text: string;
  value?: string;
  image?: string;
  isOther?: boolean;
}

interface DraggableAnswerOptionProps {
  index: number;
  answer: Answer;
  onUpdate: (updatedAnswer: Answer) => void;
  onRemove: () => void;
  moveAnswer: (dragIndex: number, hoverIndex: number) => void;
  disabled?: boolean;
}

interface DragItem {
  index: number;
  type: string;
}

const ItemTypes = {
  ANSWER_OPTION: 'answerOption',
};

const DraggableAnswerOption: React.FC<DraggableAnswerOptionProps> = ({
  index,
  answer,
  onUpdate,
  onRemove,
  moveAnswer,
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: ItemTypes.ANSWER_OPTION,
    collect(monitor: DropTargetMonitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveAnswer(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: ItemTypes.ANSWER_OPTION,
    item: { 
      index,
      type: ItemTypes.ANSWER_OPTION
    },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !disabled,
  });

  const opacity = isDragging ? 0.4 : 1;
  
  // Combine the drag and drop refs
  drag(drop(ref));

  return (
    <div 
      ref={ref}
      className="answer-option" 
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      {!disabled && (
        <div className="drag-handle">
          <FaGripVertical />
        </div>
      )}
      <div className="answer-option-content">
        <div className="answer-option-index">{index + 1}</div>
      <input 
        type="text" 
        value={answer.text} 
        onChange={(e) => onUpdate({ ...answer, text: e.target.value })}
        placeholder={`Option ${index + 1}`}
        disabled={disabled}
        className="answer-option-input"
      />
      </div>
      {!disabled && (
        <button 
          className="remove-answer" 
          onClick={onRemove}
          aria-label="Remove answer option"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

// Add CSS for the component
const styles = `
.answer-option {
  display: flex;
  align-items: center;
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
}

.answer-option-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.drag-handle {
  color: #aaa;
  margin-right: 10px;
  cursor: grab;
}

.answer-option-index {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  margin-right: 10px;
  font-size: 12px;
  color: #666;
}

.answer-option-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-answer {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default DraggableAnswerOption;
