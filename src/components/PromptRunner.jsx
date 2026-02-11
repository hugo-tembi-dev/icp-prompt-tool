import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { runPrompt } from '../lib/openai'

export default function PromptRunner({ systemPrompt, questions, selectedIds, jsonData, onComplete }) {
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
          system_icp: selectedQuestions
        }

        const response = await runPrompt(systemPrompt, selectedQuestions, { domainURL: domain, entries: domainData })

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
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Run Prompts</h2>

      <div className="mb-4 space-y-2 text-sm text-gray-600">
        <p>Selected questions: <span className="font-medium text-gray-800">{selectedCount}</span></p>
        <p>Domains to process: <span className="font-medium text-gray-800">{domainCount}</span></p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {running && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Processing: {progress.currentDomain}</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={runAllPrompts}
        disabled={!canRun}
        className={`w-full px-4 py-3 rounded-md font-medium transition-colors ${
          canRun
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {running ? 'Processing...' : `Run Prompts for ${domainCount} Domains`}
      </button>

      {!jsonData && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          Import JSON data first
        </p>
      )}
    </div>
  )
}
