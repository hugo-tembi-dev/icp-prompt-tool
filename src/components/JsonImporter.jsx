import { useState, useRef } from 'react'

export default function JsonImporter({ jsonData, userContext, onJsonChange, onUserContextChange }) {
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function normalizeJson(parsed) {
    let extractedUserContext = null

    // Case 1: Already an array of objects
    if (Array.isArray(parsed)) {
      return {
        data: parsed.map(item => ({
          ...item,
          domainURL: item.domainURL || item.domainUrl || item.domain
        })),
        userContext: null
      }
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

      // Extract user_context if present
      if (parsed.user_context) {
        extractedUserContext = parsed.user_context
      }

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

      return { data: result, userContext: extractedUserContext }
    }

    // Case 4: Single object with domain info - wrap in array
    if (parsed.domainURL || parsed.domainUrl || parsed.domain) {
      return {
        data: [{
          ...parsed,
          domainURL: parsed.domainURL || parsed.domainUrl || parsed.domain
        }],
        userContext: parsed.user_context || null
      }
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

        if (!normalized || !normalized.data || normalized.data.length === 0) {
          setError('Could not extract domain data from JSON. Expected array of objects or Tembi WEBSHOP format.')
          return
        }

        const hasdomainURL = normalized.data.some(item => item.domainURL)
        if (!hasdomainURL) {
          setError('Warning: No domainURL fields found in data')
        } else {
          setError('')
        }

        onJsonChange(normalized.data)
        onUserContextChange(normalized.userContext)
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
      onUserContextChange(null)
      setError('')
      return
    }

    try {
      const parsed = JSON.parse(text)
      const normalized = normalizeJson(parsed)

      if (!normalized || !normalized.data || normalized.data.length === 0) {
        setError('Could not extract domain data from JSON')
        return
      }
      setError('')
      onJsonChange(normalized.data)
      onUserContextChange(normalized.userContext)
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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Import JSON Data</h2>

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
          className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
        >
          Upload JSON/TXT File
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Or paste/edit JSON directly:
        </label>
        <textarea
          value={jsonData ? JSON.stringify(jsonData, null, 2) : ''}
          onChange={handleTextChange}
          placeholder='[{"domainURL": "example.com", "company": "Example Inc", ...}]'
          className="w-full h-64 px-3 py-2 font-mono text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 text-slate-600 bg-white/50"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
          {error}
        </div>
      )}

      {jsonData && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-emerald-600 text-sm font-medium">
            Loaded {jsonData.length} entries with {domains.length} unique domains
          </p>
          {domains.length > 0 && (
            <ul className="mt-2 text-sm text-emerald-500">
              {domains.slice(0, 5).map((domain, i) => (
                <li key={i}>- {domain}</li>
              ))}
              {domains.length > 5 && <li>...and {domains.length - 5} more</li>}
            </ul>
          )}
        </div>
      )}

      {userContext && (
        <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
          <p className="text-sky-600 text-sm font-medium mb-2">User Context Detected:</p>
          <ul className="text-sm text-sky-500 space-y-1">
            {userContext.userName && <li>User: {userContext.userName}</li>}
            {userContext.country_code && <li>Country: {userContext.country_code}</li>}
            {userContext.providers && <li>Providers: {userContext.providers}</li>}
            {userContext.currency && <li>Currency: {userContext.currency}</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
