import { useState, useRef } from 'react'

export default function JsonImporter({ jsonData, onJsonChange }) {
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function normalizeJson(parsed) {
    // Case 1: Already an array of objects
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        ...item,
        domainURL: item.domainURL || item.domainUrl || item.domain
      }))
    }

    // Case 2: Object with "content" field (stringified JSON)
    if (parsed.content && typeof parsed.content === 'string') {
      try {
        const innerParsed = JSON.parse(parsed.content)
        return normalizeJson(innerParsed)
      } catch {
        // content is not valid JSON, continue to other cases
      }
    }

    // Case 3: Object with data.WEBSHOP structure (Tembi format)
    if (parsed.data?.WEBSHOP) {
      const webshop = parsed.data.WEBSHOP
      const result = []

      // Extract main webshop overview
      if (webshop.overview) {
        const overview = webshop.overview
        result.push({
          ...overview,
          domainURL: overview.domainUrl || overview.domain,
          _source: 'overview'
        })
      }

      // Extract similar webshops if present
      if (Array.isArray(webshop.similar_webshop)) {
        webshop.similar_webshop.forEach(shop => {
          result.push({
            ...shop,
            domainURL: shop.domainUrl || shop.domain,
            _source: 'similar_webshop'
          })
        })
      }

      return result
    }

    // Case 4: Single object with domain info - wrap in array
    if (parsed.domainURL || parsed.domainUrl || parsed.domain) {
      return [{
        ...parsed,
        domainURL: parsed.domainURL || parsed.domainUrl || parsed.domain
      }]
    }

    return null
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target.result
        const parsed = JSON.parse(content)
        const normalized = normalizeJson(parsed)

        if (!normalized || normalized.length === 0) {
          setError('Could not extract domain data from JSON. Expected array of objects or Tembi WEBSHOP format.')
          return
        }

        const hasdomainURL = normalized.some(item => item.domainURL)
        if (!hasdomainURL) {
          setError('Warning: No domainURL fields found in data')
        } else {
          setError('')
        }

        onJsonChange(normalized)
      } catch (err) {
        setError('Invalid JSON: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  function handleTextChange(e) {
    const text = e.target.value
    if (!text.trim()) {
      onJsonChange(null)
      setError('')
      return
    }

    try {
      const parsed = JSON.parse(text)
      const normalized = normalizeJson(parsed)

      if (!normalized || normalized.length === 0) {
        setError('Could not extract domain data from JSON')
        return
      }
      setError('')
      onJsonChange(normalized)
    } catch (err) {
      setError('Invalid JSON: ' + err.message)
    }
  }

  function getUniqueDomains() {
    if (!jsonData) return []
    return [...new Set(jsonData.map(item => item.domainURL).filter(Boolean))]
  }

  const domains = getUniqueDomains()

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Import JSON Data</h2>

      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Upload JSON/TXT File
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or paste/edit JSON directly:
        </label>
        <textarea
          value={jsonData ? JSON.stringify(jsonData, null, 2) : ''}
          onChange={handleTextChange}
          placeholder='[{"domainURL": "example.com", "company": "Example Inc", ...}]'
          className="w-full h-64 px-3 py-2 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {jsonData && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 text-sm font-medium">
            Loaded {jsonData.length} entries with {domains.length} unique domains
          </p>
          {domains.length > 0 && (
            <ul className="mt-2 text-sm text-green-600">
              {domains.slice(0, 5).map((domain, i) => (
                <li key={i}>- {domain}</li>
              ))}
              {domains.length > 5 && <li>...and {domains.length - 5} more</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
