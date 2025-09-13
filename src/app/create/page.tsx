import { TokenCreationWizard } from "@/components/create/token-creation-wizard"

export default function CreateTokenPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <TokenCreationWizard />
      </div>
    </div>
  )
}
