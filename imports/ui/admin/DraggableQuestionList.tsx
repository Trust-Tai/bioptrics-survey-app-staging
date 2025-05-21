import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { QuestionOption } from './SurveySectionQuestionDropdown';

interface DraggableQuestionListProps {
  questions: QuestionOption[];
  onReorder: (newOrder: QuestionOption[]) => void;
  onRemove: (index: number) => void;
}

const DraggableQuestionList: React.FC<DraggableQuestionListProps> = ({ questions, onReorder, onRemove }) => {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onReorder(reordered);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questionList">
        {(provided) => (
          <ol
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ paddingLeft: 18, margin: 0 }}
          >
            {questions.map((q, idx) => (
              <Draggable key={q.value} draggableId={q.value} index={idx}>
                {(provided, snapshot) => {
                  return (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: 4,
                        color: '#28211e',
                        fontSize: 15,
                        fontWeight: 500,
                        background: snapshot.isDragging ? '#f7e9c1' : 'transparent',
                        borderRadius: 6,
                        padding: '6px 10px',
                        boxShadow: snapshot.isDragging ? '0 2px 8px #552a4733' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span style={{ fontWeight: 700, marginRight: 8 }}>{idx + 1}.</span> {q.label}
                      <button
                        type="button"
                        aria-label="Remove question"
                        onClick={e => { e.stopPropagation(); onRemove(idx); }}
                        style={{
                          marginLeft: 'auto',
                          background: 'none',
                          border: 'none',
                          color: '#552a47',
                          fontWeight: 900,
                          fontSize: 18,
                          cursor: 'pointer',
                          padding: '0 8px',
                          lineHeight: 1,
                          borderRadius: 4,
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = '#f7e9c1')}
                        onMouseOut={e => (e.currentTarget.style.background = 'none')}
                      >
                        ×
                      </button>
                    </li>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableQuestionList;
