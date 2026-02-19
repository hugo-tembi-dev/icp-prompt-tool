import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { runPrompt } from '../lib/openai'

export default function PromptRunner({ systemPrompt, model, questions, selectedIds, jsonData, userContext, onComplete }) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, currentDomain: '' })
  const [error, setError] = useState('')

  function getSelectedQuestions() {
    return questions
      .filter(q => selectedIds.includes(q.id))
      .map(q => q.content)
  }

  function getUniqueDomains() {
    if (!jsonData) return []
    return [...new Set(jsonData.map(item => item.domainURL).filter(Boolean))]
  }

  function getDataForDomain(domain) {
    return jsonData.filter(item => item.domainURL === domain)
  }

  async function runAllPrompts() {
    const selectedQuestions = getSelectedQuestions()
    const domains = getUniqueDomains()

    if (selectedQuestions.length === 0) {
      setError('Please select at least one question')
      return
    }

    if (domains.length === 0) {
      setError('No domains found in JSON data')
      return
    }

    setRunning(true)
    setError('')
    setProgress({ current: 0, total: domains.length, currentDomain: '' })

    const results = []

    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i]
      setProgress({ current: i + 1, total: domains.length, currentDomain: domain })

      try {
        const domainData = getDataForDomain(domain)
        const promptInput = {
          domainURL: domain,
          data: domainData,
          system_icp: selectedQuestions,
          user_context: userContext,
          model: model
        }

        const response = await runPrompt(systemPrompt, selectedQuestions, { domainURL: domain, entries: domainData, userContext }, model)

        const { data, error: dbError } = await supabase
          .from('prompt_results')
          .insert([{
            domain_url: domain,
            prompt_input: promptInput,
            response: response
          }])
          .select()

        if (dbError) {
          console.error('Error saving result:', dbError)
        } else {
          results.push(data[0])
        }
      } catch (err) {
        console.error(`Error processing ${domain}:`, err)
        setError(`Error processing ${domain}: ${err.message}`)
      }
    }

    setRunning(false)
    setProgress({ current: 0, total: 0, currentDomain: '' })
    onComplete(results)
  }

  const selectedCount = selectedIds.length
  const domainCount = getUniqueDomains().length
  const canRun = selectedCount > 0 && domainCount > 0 && !running

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Run Prompts</h2>

      <div className="mb-4 space-y-2 text-sm text-slate-500">
        <p>Model: <span className="font-medium text-slate-700">{model}</span></p>
        <p>Selected questions: <span className="font-medium text-slate-700">{selectedCount}</span></p>
        <p>Domains to process: <span className="font-medium text-slate-700">{domainCount}</span></p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
          {error}
        </div>
      )}

      {running && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-500 mb-1">
            <span>Processing: {progress.currentDomain}</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-sky-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={runAllPrompts}
        disabled={!canRun}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
          canRun
            ? 'bg-emerald-400 text-white hover:bg-emerald-500'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {running ? 'Processing...' : `Run Prompts for ${domainCount} Domains`}
      </button>

      {!jsonData && (
        <p className="mt-2 text-sm text-slate-400 text-center">
          Import JSON data first
        </p>
      )}
    </div>
  )
}
