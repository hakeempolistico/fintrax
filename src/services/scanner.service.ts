import { getCurrentUser } from '@/services/app.service'
import { analyzeFinancialImage, type AICaptureResult, imageToBase64 } from '@/utils/claude.util'

export async function captureAIImage(req: any, image: File) {
  const member = await getCurrentUser()

  if (!member) {
    throw new Error('Unauthenticated')
  }

  const base64Image = await imageToBase64(image)
  const result: AICaptureResult = await analyzeFinancialImage(base64Image, image.type)
  if (!result.documentType) {
    return {
      documentType: null,
      created: null,
    }
  }

  if (result.documentType === 'account') {
    if (!result.account) {
      const error = new Error('Claude returned account document without account data')
      error.name = 'CLAUDE_INVALID_RESPONSE'
      throw error
    }

    try {
      const account = await req.payload.create({
        collection: 'accounts',
        data: {
          ...result.account,
          member: member.id,
          balance: result.account.balance ?? 0,
        },
      })

      return {
        documentType: 'account',
        created: account,
        redirect: '/portal/acccounts',
      }
    } catch (error: any) {
      const accountNumberError = error?.data?.errors?.find(
        (item: any) => item.path === 'accountNumber',
      )
      if (accountNumberError) {
        const duplicateError = new Error('Account number already exists')
        ;(duplicateError as any).code = 'ACCOUNT_NUMBER_EXISTS'
        throw duplicateError
      }
      throw error
    }
  }

  if (result.documentType === 'bill') {
    if (!result.bill) {
      const error = new Error('Claude returned bill document without bill data')
      error.name = 'CLAUDE_INVALID_RESPONSE'
      throw error
    }

    const bill = await req.payload.create({
      collection: 'bills',
      data: {
        ...result.bill,
        member: member.id,
      },
    })

    return {
      documentType: 'bill',
      created: bill,
      redirect: '/portal/bills',
    }
  }

  return {
    documentType: null,
    created: null,
  }
}
