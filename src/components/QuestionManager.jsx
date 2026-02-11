import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function QuestionManager({ onQuestionsChange }) {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
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

    const { data, error } = await supabase
      .from('questions')
      .insert([{ content: newQuestion.trim() }])
      .select()

    if (error) {
      console.error('Error adding question:', error)
    } else {
      setQuestions([...questions, data[0]])
      setNewQuestion('')
    }
  }

  async function updateQuestion(id) {
    if (!editContent.trim()) return

    const { error } = await supabase
      .from('questions')
      .update({ content: editContent.trim() })
      .eq('id', id)

    if (error) {
      console.error('Error updating question:', error)
    } else {
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, content: editContent.trim() } : q
      ))
      setEditingId(null)
      setEditContent('')
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
  }

  if (loading) {
    return <div className="text-gray-500">Loading questions...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">ICP Questions</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
          placeholder="Enter a new question..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {questions.map((question) => (
          <li key={question.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {editingId === question.id ? (
              <>
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateQuestion(question.id)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  autoFocus
                />
                <button
                  onClick={() => updateQuestion(question.id)}
                  className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{question.content}</span>
                <button
                  onClick={() => startEditing(question)}
                  className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {questions.length === 0 && (
        <p className="text-gray-500 text-center py-4">No questions yet. Add your first ICP question above.</p>
      )}
    </div>
  )
}
