import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ResultsViewer({ refreshTrigger }) {
  const [results, setResults] = useState([])
  const [selectedDomain, setSelectedDomain] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [refreshTrigger])

  async function fetchResults() {
    setLoading(true)
    const { data, error } = await supabase
      .from('prompt_results')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching results:', error)
    } else {
      setResults(data || [])
    }
    setLoading(false)
  }

  async function deleteResult(id) {
    const { error } = await supabase
      .from('prompt_results')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting result:', error)
    } else {
      setResults(results.filter(r => r.id !== id))
      if (selectedResult?.id === id) {
        setSelectedDomain('')
      }
    }
  }

  const uniqueDomains = [...new Set(results.map(r => r.domain_url))]
  const selectedResult = results.find(r => r.domain_url === selectedDomain)

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Results</h2>
        <p className="text-slate-400">Loading results...</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Results ({results.length})</h2>

      {results.length === 0 ? (
        <p className="text-slate-400 text-center py-4">
          No results yet. Run prompts to see results here.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Select Domain:
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 text-slate-600 bg-white/50"
            >
              <option value="">-- Select a domain --</option>
              {uniqueDomains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>

          {selectedResult && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-slate-700">{selectedResult.domain_url}</h3>
                  <p className="text-xs text-slate-400">
                    {new Date(selectedResult.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteResult(selectedResult.id)}
                  className="px-2 py-1 text-sm text-rose-400 hover:text-rose-500 transition-colors"
                >
                  Delete
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-600 mb-2">Prompt Input:</h4>
                <pre className="p-3 bg-slate-50 rounded-lg text-xs overflow-x-auto max-h-40 text-slate-600">
                  {JSON.stringify(selectedResult.prompt_input, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-600 mb-2">AI Response:</h4>
                <div className="p-3 bg-sky-50 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto text-slate-600">
                  {selectedResult.response}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
