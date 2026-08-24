export const isAdminUser = (user: any) => user?.collection === 'users'
export const isMemberUser = (user: any) => user?.collection === 'members'

export const authenticatedMemberOrAdmin = ({ req }: any) =>
  Boolean(req.user && (isAdminUser(req.user) || isMemberUser(req.user)))

export const memberOwnedAccess = ({ req }: any) => {
  if (isAdminUser(req.user)) return true
  if (isMemberUser(req.user)) {
    return {
      member: {
        equals: req.user.id,
      },
    }
  }
  return false
}

export const ownMemberAccess = ({ req }: any) => {
  if (isAdminUser(req.user)) return true
  if (isMemberUser(req.user)) {
    return {
      id: {
        equals: req.user.id,
      },
    }
  }
  return false
}

export const forceMemberOwnership = ({ data, req }: any) => {
  if (data && isMemberUser(req.user)) {
    data.member = req.user.id
  }
  return data
}
