"use client"

import * as React from "react"
import { ReactNode } from "react"

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>
}
