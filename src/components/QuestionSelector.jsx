export default function QuestionSelector({ questions, selectedIds, onSelectionChange }) {
  function toggleQuestion(id) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(qId => qId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  function selectAll() {
    onSelectionChange(questions.map(q => q.id))
  }

  function selectNone() {
    onSelectionChange([])
  }

  if (questions.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Select Questions for Prompt</h2>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            onClick={selectNone}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {questions.map((question) => (
          <label
            key={question.id}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(question.id)}
              onChange={() => toggleQuestion(question.id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className={selectedIds.includes(question.id) ? 'text-blue-700' : ''}>
              {question.content}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {selectedIds.length} of {questions.length} questions selected
        </p>
      </div>
    </div>
  )
}
