export interface Project {
  id: string
  name: string
  clientName: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'completed' | 'archived'
}

export interface ClientInfo {
  companyName: string
  industry: string
  companySize: string
  description: string
  targetMarket: string
  keyProducts: string[]
  brandPosition: string
}

export interface Requirements {
  projectType: string
  budget: string
  timeline: string
  targetAudience: string
  keyMessage: string
  deliverables: string[]
  tone: string
  channels: string[]
  brandChallenge?: string
}

export interface Competitor {
  id: string
  name: string
  brandPositioning: string
  visualStyle: string
  targetAudience: string
  strengths: string[]
  weaknesses: string[]
  marketShare: string
}

export interface Brief {
  projectOverview: string
  creativeDirection: string
  keyInsights: string[]
  successMetrics: string[]
}

export interface Strategy {
  overallStrategy: string
  differentiation: string
  contentStrategy: string
  mediaStrategy: string
}

export interface ProjectSteps {
  clientInfo?: ClientInfo
  requirements?: Requirements
  competitors?: Competitor[]
  brief?: Brief
  strategy?: Strategy
}

export interface CreateProjectRequest {
  name: string
  clientName: string
}
