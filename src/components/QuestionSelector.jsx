import { useState, useMemo } from 'react'

export default function QuestionSelector({ questions, selectedIds, onSelectionChange }) {
  const [selectedTag, setSelectedTag] = useState('all')

  // Extract unique tags from questions
  const uniqueTags = useMemo(() => {
    const tags = new Set(questions.map(q => q.tag || 'untagged'))
    return ['all', ...Array.from(tags).sort()]
  }, [questions])

  // Filter questions based on selected tag
  const filteredQuestions = useMemo(() => {
    if (selectedTag === 'all') return questions
    return questions.filter(q => (q.tag || 'untagged') === selectedTag)
  }, [questions, selectedTag])

  function toggleQuestion(id) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(qId => qId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  function selectAll() {
    // Select all filtered questions
    const filteredIds = filteredQuestions.map(q => q.id)
    const newSelection = new Set([...selectedIds, ...filteredIds])
    onSelectionChange(Array.from(newSelection))
  }

  function selectNone() {
    // Deselect only filtered questions
    const filteredIds = new Set(filteredQuestions.map(q => q.id))
    onSelectionChange(selectedIds.filter(id => !filteredIds.has(id)))
  }

  if (questions.length === 0) {
    return null
  }

  // Count selected questions in current filter
  const selectedInFilter = filteredQuestions.filter(q => selectedIds.includes(q.id)).length

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700">Select Questions for Prompt</h2>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1 text-sm text-sky-500 hover:text-sky-600 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={selectNone}
            className="px-3 py-1 text-sm text-slate-400 hover:text-slate-500 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Tag Filter */}
      <div className="mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-500 font-medium">Filter:</span>
          {uniqueTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTag === tag
                  ? 'bg-sky-400 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag === 'all' ? 'All' : tag}
              {tag !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({questions.filter(q => (q.tag || 'untagged') === tag).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredQuestions.map((question) => (
          <label
            key={question.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(question.id)}
              onChange={() => toggleQuestion(question.id)}
              className="w-4 h-4 text-sky-400 rounded focus:ring-sky-300 border-slate-300"
            />
            <span className={`flex-1 ${selectedIds.includes(question.id) ? 'text-sky-600' : 'text-slate-600'}`}>
              {question.content}
            </span>
            <span className="px-2 py-0.5 text-xs bg-sky-100 text-sky-600 rounded-full">
              {question.tag || 'untagged'}
            </span>
          </label>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <p className="text-slate-400 text-center py-4">No questions match this filter.</p>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          {selectedInFilter} of {filteredQuestions.length} shown selected
          {selectedTag !== 'all' && (
            <span className="text-slate-400"> • {selectedIds.length} total selected</span>
          )}
        </p>
      </div>
    </div>
  )
}
