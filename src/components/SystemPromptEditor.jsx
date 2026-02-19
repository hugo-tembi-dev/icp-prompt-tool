import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_PROMPT_CONTENT = 'You are an ICP (Ideal Customer Profile) analyst. Analyze the provided website/company data thoroughly. Be detailed, specific, and provide actionable insights based on the data provided.'

export default function SystemPromptEditor({ onSystemPromptChange }) {
  const [prompts, setPrompts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newContent, setNewContent] = useState(DEFAULT_PROMPT_CONTENT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPrompts()
  }, [])

  useEffect(() => {
    const selected = prompts.find(p => p.id === selectedId)
    onSystemPromptChange(selected ? selected.content : '')
  }, [selectedId, prompts, onSystemPromptChange])

  async function fetchPrompts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('system_prompt')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching system prompts:', error)
    } else if (data && data.length > 0) {
      setPrompts(data)
      setSelectedId(data[0].id)
    }
    setLoading(false)
  }

  const selectedPrompt = prompts.find(p => p.id === selectedId)

  function handleSelectChange(e) {
    setSelectedId(e.target.value)
    setIsEditing(false)
  }

  function startEditing() {
    setEditContent(selectedPrompt.content)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setEditContent('')
  }

  async function saveEdit() {
    setSaving(true)
    const { error } = await supabase
      .from('system_prompt')
      .update({ content: editContent, updated_at: new Date().toISOString() })
      .eq('id', selectedId)

    if (error) {
      console.error('Error saving prompt:', error)
    } else {
      setPrompts(prev => prev.map(p => p.id === selectedId ? { ...p, content: editContent } : p))
      setIsEditing(false)
    }
    setSaving(false)
  }

  async function deletePrompt() {
    if (prompts.length === 1) return
    const { error } = await supabase
      .from('system_prompt')
      .delete()
      .eq('id', selectedId)

    if (!error) {
      const updated = prompts.filter(p => p.id !== selectedId)
      setPrompts(updated)
      setSelectedId(updated[0]?.id ?? null)
    }
  }

  async function createPrompt() {
    if (!newName.trim() || !newContent.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('system_prompt')
      .insert([{ name: newName.trim(), content: newContent.trim() }])
      .select()
      .single()

    if (error) {
      console.error('Error creating prompt:', error)
    } else {
      setPrompts(prev => [data, ...prev])
      setSelectedId(data.id)
      setIsCreating(false)
      setNewName('')
      setNewContent(DEFAULT_PROMPT_CONTENT)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">System Prompt</h2>
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700">System Prompt</h2>
        {!isCreating && (
          <button
            onClick={() => { setIsCreating(true); setIsEditing(false) }}
            className="px-3 py-1 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            + New Prompt
          </button>
        )}
      </div>

      {/* Dropdown selector */}
      {prompts.length > 0 && !isCreating && (
        <div className="mb-4">
          <select
            value={selectedId ?? ''}
            onChange={handleSelectChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
          >
            {prompts.map(p => (
              <option key={p.id} value={p.id}>{p.name || 'Unnamed Prompt'}</option>
            ))}
          </select>
        </div>
      )}

      {/* New Prompt Form */}
      {isCreating && (
        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Prompt name (e.g. Logistics Focus)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full h-40 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 font-mono text-sm text-slate-600 bg-white/50"
            placeholder="Enter system prompt instructions..."
          />
          <div className="flex gap-2">
            <button
              onClick={createPrompt}
              disabled={saving || !newName.trim()}
              className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:bg-slate-300"
            >
              {saving ? 'Saving...' : 'Add'}
            </button>
            <button
              onClick={() => { setIsCreating(false); setNewName(''); setNewContent(DEFAULT_PROMPT_CONTENT) }}
              className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Selected Prompt Viewer / Editor */}
      {!isCreating && selectedPrompt && (
        <>
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-40 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 font-mono text-sm text-slate-600 bg-white/50"
                placeholder="Enter system prompt instructions..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:bg-slate-300"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {selectedPrompt.content.length > 1000
                    ? `${selectedPrompt.content.slice(0, 1000)}...`
                    : selectedPrompt.content}
                </p>
                {selectedPrompt.content.length > 1000 && (
                  <p className="text-xs text-slate-400 mt-2">
                    {selectedPrompt.content.length} characters total — click Edit to see full prompt
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={startEditing}
                  className="px-3 py-1 text-sm text-sky-500 hover:text-sky-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={deletePrompt}
                  disabled={prompts.length === 1}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-500 transition-colors disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </>
      )}

      {!isCreating && prompts.length === 0 && (
        <p className="text-sm text-slate-400">No prompts yet. Create one above.</p>
      )}

      <p className="mt-3 text-xs text-slate-400">
        This prompt is sent as the system instruction to OpenAI.
      </p>
    </div>
  )
}
