import React from "react"

interface Step {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 py-4 overflow-x-auto">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center justify-center rounded-full border-2 transition-all duration-300 mb-2 ${
                isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : isActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-gray-200 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600"
              }`}
            >
              {isCompleted ? (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </div>

            <div className="hidden md:block max-w-[120px]">
              <div
                className={`text-sm font-medium text-center ${
                  isActive || isCompleted ? "text-gray-900 dark:text-white" : "text-gray-500"
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{step.description}</div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`hidden md:block h-px w-8 transition-all duration-300 ${
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
