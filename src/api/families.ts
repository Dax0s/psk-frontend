export interface FamilySummary {
  id: string
  name: string
  inviteCode: string
  isAdmin: boolean
  memberCount: number
}

export interface Member {
  userId: string
  email: string | null
  joinedAt: string
  isAdmin: boolean
}

export interface FamilyDetail extends FamilySummary {
  createdAt: string
  members: Member[]
}
