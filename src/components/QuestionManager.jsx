import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function QuestionManager({ onQuestionsChange }) {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [newTag, setNewTag] = useState('untagged')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTag, setEditTag] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    onQuestionsChange(questions)
  }, [questions, onQuestionsChange])

  async function fetchQuestions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
    } else {
      setQuestions(data || [])
    }
    setLoading(false)
  }

  async function addQuestion() {
    if (!newQuestion.trim()) return

    const tagValue = newTag.trim() || 'untagged'
    const { data, error } = await supabase
      .from('questions')
      .insert([{ content: newQuestion.trim(), tag: tagValue }])
      .select()

    if (error) {
      console.error('Error adding question:', error)
    } else {
      setQuestions([...questions, data[0]])
      setNewQuestion('')
      setNewTag('untagged')
    }
  }

  async function updateQuestion(id) {
    if (!editContent.trim()) return

    const tagValue = editTag.trim() || 'untagged'
    const { error } = await supabase
      .from('questions')
      .update({ content: editContent.trim(), tag: tagValue })
      .eq('id', id)

    if (error) {
      console.error('Error updating question:', error)
    } else {
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, content: editContent.trim(), tag: tagValue } : q
      ))
      setEditingId(null)
      setEditContent('')
      setEditTag('')
    }
  }

  async function deleteQuestion(id) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting question:', error)
    } else {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  function startEditing(question) {
    setEditingId(question.id)
    setEditContent(question.content)
    setEditTag(question.tag || 'untagged')
  }

  if (loading) {
    return <div className="text-slate-400">Loading questions...</div>
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700">ICP Questions</h2>
        <span className="text-sm text-slate-400">{questions.length} total</span>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
          placeholder="Enter a new question..."
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 text-slate-600 bg-white/50"
        />
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
          placeholder="Tag..."
          className="w-32 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 text-slate-600 bg-white/50"
        />
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors"
        >
          Add
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-2">Latest 3 questions:</p>
      <ul className="space-y-2">
        {questions.slice(-3).map((question) => (
          <li key={question.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            {editingId === question.id ? (
              <>
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateQuestion(question.id)}
                  className="flex-1 px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-600"
                  autoFocus
                />
                <input
                  type="text"
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateQuestion(question.id)}
                  placeholder="Tag..."
                  className="w-28 px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-600"
                />
                <button
                  onClick={() => updateQuestion(question.id)}
                  className="px-2 py-1 text-sm bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 text-sm bg-slate-300 text-slate-600 rounded-lg hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-slate-600">{question.content}</span>
                <span className="px-2 py-0.5 text-xs bg-sky-100 text-sky-600 rounded-full">
                  {question.tag || 'untagged'}
                </span>
                <button
                  onClick={() => startEditing(question)}
                  className="px-2 py-1 text-sm text-sky-500 hover:text-sky-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="px-2 py-1 text-sm text-rose-400 hover:text-rose-500 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {questions.length === 0 && (
        <p className="text-slate-400 text-center py-4">No questions yet. Add your first ICP question above.</p>
      )}
    </div>
  )
}
