"use client"

import { useState } from "react"
// Removed framer-motion and lucide-react imports due to dependency issues
import React from "react"
import { StepIndicator } from "./step-indicator"
import { TokenTypeSelection } from "./steps/token-type-selection"
import { TokenConfiguration } from "./steps/token-configuration"
import { PaymentForm } from "./steps/payment-form"
import { DeploymentStep } from "./steps/deployment-step"

// Simple icon components for the step indicator
const ZapIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const WalletIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const GlobeIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 2.5 2.5 0 004.5 2.5V3.935M20 21a1 1 0 01-1-1c0-4.208-3.00-7.586-7-8.999C8.001 11.414 5 14.792 5 19a1 1 0 01-2 0c0-5.208 3.001-9.586 7-10.999 3.999 1.413 7 5.79 7 10.999a1 1 0 01-1 1z" />
  </svg>
)

const steps = [
  {
    id: 'type',
    title: 'Choose Token Type',
    description: 'Select the type of token you want to create',
    icon: ZapIcon
  },
  {
    id: 'configure',
    title: 'Configure Token',
    description: 'Set up your token parameters',
    icon: ShieldIcon
  },
  {
    id: 'payment',
    title: 'Review & Pay',
    description: 'Review configuration and pay creation fee',
    icon: WalletIcon
  },
  {
    id: 'deploy',
    title: 'Deploy Token',
    description: 'Deploy your token to the blockchain',
    icon: GlobeIcon
  }
]

export function TokenCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [tokenData, setTokenData] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateTokenData = (data: any) => {
    setTokenData({ ...tokenData, ...data })
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Create Your Token
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Generate, configure, and deploy your custom ERC20 token in just a few steps
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-12">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <TokenTypeSelection
              selectedType={tokenData?.tokenType}
              onTypeSelect={(type: string) => updateTokenData({ tokenType: type })}
              onContinue={nextStep}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <TokenConfiguration
              tokenType={tokenData?.tokenType}
              config={tokenData?.config || {}}
              onConfigUpdate={(config: object) => updateTokenData({ config })}
              onContinue={nextStep}
              onBack={prevStep}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <PaymentForm
              tokenData={tokenData}
              onPaymentConfirm={() => {
                updateTokenData({ paymentConfirmed: true })
                nextStep()
              }}
              onBack={prevStep}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <DeploymentStep
              tokenData={tokenData}
              onComplete={() => {
                // Handle completion
                window.location.href = '/dashboard'
              }}
              onBack={prevStep}
            />
          </div>
        )}
      </div>
    </div>
  )
}
