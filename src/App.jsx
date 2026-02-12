import { useState, useCallback } from 'react'
import SystemPromptEditor from './components/SystemPromptEditor'
import QuestionManager from './components/QuestionManager'
import QuestionSelector from './components/QuestionSelector'
import JsonImporter from './components/JsonImporter'
import PromptRunner from './components/PromptRunner'
import ResultsViewer from './components/ResultsViewer'

function App() {
  const [systemPrompt, setSystemPrompt] = useState('')
  const [questions, setQuestions] = useState([])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([])
  const [jsonData, setJsonData] = useState(null)
  const [userContext, setUserContext] = useState(null)
  const [resultsRefresh, setResultsRefresh] = useState(0)

  const handleSystemPromptChange = useCallback((prompt) => {
    setSystemPrompt(prompt)
  }, [])

  const handleQuestionsChange = useCallback((newQuestions) => {
    setQuestions(newQuestions)
    setSelectedQuestionIds(prev =>
      prev.filter(id => newQuestions.some(q => q.id === id))
    )
  }, [])

  const handlePromptComplete = useCallback(() => {
    setResultsRefresh(prev => prev + 1)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ICP Prompt Tool</h1>
          <p className="text-gray-600 mt-2">
            Create questions, import website data, and generate AI-powered insights
          </p>
        </header>

        <div className="mb-6">
          <SystemPromptEditor onSystemPromptChange={handleSystemPromptChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <QuestionManager onQuestionsChange={handleQuestionsChange} />
            <QuestionSelector
              questions={questions}
              selectedIds={selectedQuestionIds}
              onSelectionChange={setSelectedQuestionIds}
            />
          </div>

          <div className="space-y-6">
            <JsonImporter
              jsonData={jsonData}
              userContext={userContext}
              onJsonChange={setJsonData}
              onUserContextChange={setUserContext}
            />
            <PromptRunner
              systemPrompt={systemPrompt}
              questions={questions}
              selectedIds={selectedQuestionIds}
              jsonData={jsonData}
              userContext={userContext}
              onComplete={handlePromptComplete}
            />
          </div>
        </div>

        <div className="mt-8">
          <ResultsViewer refreshTrigger={resultsRefresh} />
        </div>
      </div>
    </div>
  )
}

export default App
