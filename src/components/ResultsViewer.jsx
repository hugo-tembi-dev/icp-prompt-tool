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
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Results</h2>
        <p className="text-gray-500">Loading results...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Results ({results.length})</h2>

      {results.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No results yet. Run prompts to see results here.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Domain:
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <h3 className="font-medium text-gray-800">{selectedResult.domain_url}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedResult.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteResult(selectedResult.id)}
                  className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Prompt Input:</h4>
                <pre className="p-3 bg-gray-50 rounded text-xs overflow-x-auto max-h-40">
                  {JSON.stringify(selectedResult.prompt_input, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI Response:</h4>
                <div className="p-3 bg-blue-50 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
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
