import { useState } from 'react'

const AVAILABLE_MODELS = [
  // GPT-5 Series (Flagship)
  { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Flagship reasoning model - most powerful' },
  { id: 'gpt-5.1', name: 'GPT-5.1', description: 'Advanced flagship model' },
  { id: 'gpt-5', name: 'GPT-5', description: 'Recommended for complex tasks' },

  // GPT-4.1 Series (Latest efficient models)
  { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Improved coding & 1M context window' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Fast, efficient, fine-tunable' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', description: 'Smallest and fastest' },

  // GPT-4o Series
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal, vision capable' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cost-effective' },

  // Reasoning Models (o-series)
  { id: 'o3-pro', name: 'o3-pro', description: 'Most capable reasoning model' },
  { id: 'o3', name: 'o3', description: 'Advanced reasoning with tools' },
  { id: 'o4-mini', name: 'o4-mini', description: 'Fast reasoning, best math/coding' },
  { id: 'o3-mini', name: 'o3-mini', description: 'Efficient reasoning model' },
  { id: 'o1', name: 'o1', description: 'Original reasoning model' },
  { id: 'o1-mini', name: 'o1-mini', description: 'Compact reasoning model' },
]

export default function ModelSelector({ selectedModel, onModelChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Model Selection</h2>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">{currentModel.name}</span>
              <span className="text-gray-500 text-sm ml-2">({currentModel.id})</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mt-1">{currentModel.description}</p>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                  model.id === selectedModel ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-sm text-gray-500">{model.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Model used for AI analysis. Different models have different capabilities and costs.
      </p>
    </div>
  )
}
