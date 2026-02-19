import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_PROMPT = 'You are an ICP (Ideal Customer Profile) analyst. Analyze the provided website/company data thoroughly. Be detailed, specific, and provide actionable insights based on the data provided.'

export default function SystemPromptEditor({ onSystemPromptChange }) {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSystemPrompt()
  }, [])

  useEffect(() => {
    onSystemPromptChange(systemPrompt)
  }, [systemPrompt, onSystemPromptChange])

  async function fetchSystemPrompt() {
    setLoading(true)
    const { data, error } = await supabase
      .from('system_prompt')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching system prompt:', error)
      setSystemPrompt(DEFAULT_PROMPT)
    } else if (data) {
      setSystemPrompt(data.content)
    }
    setLoading(false)
  }

  async function saveSystemPrompt() {
    setSaving(true)

    const { data: existing } = await supabase
      .from('system_prompt')
      .select('id')
      .limit(1)
      .single()

    let error
    if (existing) {
      const result = await supabase
        .from('system_prompt')
        .update({ content: editContent, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      error = result.error
    } else {
      const result = await supabase
        .from('system_prompt')
        .insert([{ content: editContent }])
      error = result.error
    }

    if (error) {
      console.error('Error saving system prompt:', error)
    } else {
      setSystemPrompt(editContent)
      setIsEditing(false)
    }
    setSaving(false)
  }

  function startEditing() {
    setEditContent(systemPrompt)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setEditContent('')
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
        {!isEditing && (
          <button
            onClick={startEditing}
            className="px-3 py-1 text-sm text-sky-500 hover:text-sky-600 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

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
              onClick={saveSystemPrompt}
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
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600 whitespace-pre-wrap">
            {systemPrompt.length > 1000
              ? `${systemPrompt.slice(0, 1000)}...`
              : systemPrompt}
          </p>
          {systemPrompt.length > 1000 && (
            <p className="text-xs text-slate-400 mt-2">
              {systemPrompt.length} characters total — click Edit to see full prompt
            </p>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        This prompt is sent as the system instruction to OpenAI.
      </p>
    </div>
  )
}
