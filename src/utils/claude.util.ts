const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CLAUDE_API_VERSION = '2023-06-01'
const CLAUDE_MAX_TOKENS = 4096

export interface AccountAIResult {
  name: string | null
  type: 'bank' | 'cash' | 'credit-card' | 'ewallet' | 'investment' | 'other' | null
  accountNumber: string | null
  balance: number
  source: string | null
  metadata: Record<string, unknown>
}

export interface BillAIResult {
  provider: string | null
  customerAccountNumber: string | null
  accountNumber: string | null
  billNumber: string | null
  type:
    | 'electricity'
    | 'water'
    | 'internet'
    | 'mobile'
    | 'telephone'
    | 'insurance'
    | 'credit-card'
    | 'loan'
    | 'government'
    | 'other'
    | null
  amountDue: number
  billingPeriodStart: string | null
  billingPeriodEnd: string | null
  dueDate: string | null
  issueDate: string | null
  metadata: Record<string, unknown>
}

export interface AICaptureResult {
  documentType: 'account' | 'bill' | null

  account: AccountAIResult | null

  bill: BillAIResult | null
}

export async function imageToBase64(image: File): Promise<string> {
  const arrayBuffer = await image.arrayBuffer()

  return Buffer.from(arrayBuffer).toString('base64')
}

export function getContent(): string {
  return `
Analyze the provided image and identify the financial document.

The document type is required and must be either:
- "account"
- "bill"

Extract all information clearly visible in the image.

Return only a JSON object matching the provided schema.

Rules:
- Do not guess or invent information.
- Preserve visible text and numbers accurately.
- Use null when a requested field is not visible.
- Extract all additional visible information into metadata.
- Do not duplicate the main fields inside metadata.
- Use descriptive camelCase keys for metadata.
- Metadata should contain every useful visible field that is not represented by a main field.
- Do not include the image, Base64 data, URLs, or technical image information in metadata.
- For monetary values, return numbers without currency symbols or thousands separators.
- Dates should use YYYY-MM-DD when the complete date is clearly visible.
- If a date cannot be determined confidently, return null.

For an account, extract the account information and all additional visible account-related information.

For a bill, extract the bill information and all additional visible bill-related information.

Read the entire image, including small text, secondary sections, labels, references, balances, dates, addresses, identifiers, charges, and other useful information.
`
}

function getOutputSchema() {
  const metadataSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
        },
        value: {
          type: ['string', 'number', 'boolean', 'null'],
        },
      },
      required: ['key', 'value'],
      additionalProperties: false,
    },
  }

  return {
    type: 'object',
    properties: {
      documentType: {
        type: 'string',
        enum: ['account', 'bill'],
      },
      account: {
        type: ['object', 'null'],
        properties: {
          name: {
            type: ['string', 'null'],
          },
          type: {
            type: 'string',
            enum: ['bank', 'cash', 'credit-card', 'ewallet', 'investment', 'other'],
          },
          accountNumber: {
            type: ['string', 'null'],
          },
          balance: {
            type: ['number', 'null'],
          },
          source: {
            type: ['string', 'null'],
          },
          metadata: metadataSchema,
        },
        required: ['name', 'type', 'accountNumber', 'balance', 'source', 'metadata'],
        additionalProperties: false,
      },

      bill: {
        type: ['object', 'null'],
        properties: {
          provider: {
            type: ['string', 'null'],
          },
          customerAccountNumber: {
            type: ['string', 'null'],
          },

          accountNumber: {
            type: ['string', 'null'],
          },

          billNumber: {
            type: ['string', 'null'],
          },

          type: {
            type: 'string',
            enum: [
              'electricity',
              'water',
              'internet',
              'mobile',
              'telephone',
              'insurance',
              'credit-card',
              'loan',
              'government',
              'other',
            ],
          },
          amountDue: {
            type: ['number', 'null'],
          },
          billingPeriodStart: {
            type: ['string', 'null'],
          },
          billingPeriodEnd: {
            type: ['string', 'null'],
          },
          dueDate: {
            type: ['string', 'null'],
          },
          issueDate: {
            type: ['string', 'null'],
          },
          metadata: metadataSchema,
        },
        required: [
          'provider',
          'customerAccountNumber',
          'accountNumber',
          'billNumber',
          'type',
          'amountDue',
          'billingPeriodStart',
          'billingPeriodEnd',
          'dueDate',
          'issueDate',
          'metadata',
        ],

        additionalProperties: false,
      },
    },

    required: ['documentType', 'account', 'bill'],

    additionalProperties: false,
  }
}

function getMediaType(mimeType: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  switch (mimeType) {
    case 'image/jpeg':
      return 'image/jpeg'

    case 'image/png':
      return 'image/png'

    case 'image/gif':
      return 'image/gif'

    case 'image/webp':
      return 'image/webp'

    default:
      return 'image/jpeg'
  }
}

async function requestClaude(base64Image: string, mimeType: string): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY

  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY is not configured')
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': CLAUDE_API_VERSION,
    },

    body: JSON.stringify({
      model: CLAUDE_MODEL,

      max_tokens: CLAUDE_MAX_TOKENS,

      system:
        'You are a highly accurate financial document extraction system. Extract only information clearly visible in the provided image. Never guess or fabricate information.',

      messages: [
        {
          role: 'user',

          content: [
            {
              type: 'image',

              source: {
                type: 'base64',
                media_type: getMediaType(mimeType),
                data: base64Image,
              },
            },

            {
              type: 'text',
              text: getContent(),
            },
          ],
        },
      ],

      output_config: {
        format: {
          type: 'json_schema',

          schema: getOutputSchema(),
        },
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()

    console.error('Claude API error:', {
      status: response.status,
      body: errorBody,
    })

    const error = new Error('Claude API request failed')

    ;(error as any).code = 'CLAUDE_API_ERROR'

    throw error
  }

  const result = await response.json()

  const textBlock = result?.content?.find((item: any) => item.type === 'text')

  if (!textBlock?.text) {
    const error = new Error('Claude returned no text response')

    ;(error as any).code = 'CLAUDE_INVALID_RESPONSE'

    throw error
  }

  return textBlock.text
}

function parseMetadata(
  metadata: Array<{
    key: string
    value: string | number | boolean | null
  }>,
): Record<string, unknown> {
  if (!Array.isArray(metadata)) {
    return {}
  }

  return metadata.reduce<Record<string, unknown>>((result, item) => {
    if (!item?.key) {
      return result
    }

    result[item.key] = item.value

    return result
  }, {})
}

function parseClaudeResponse(content: string): AICaptureResult {
  try {
    const data = JSON.parse(content)

    if (
      data.documentType !== 'account' &&
      data.documentType !== 'bill' &&
      data.documentType !== null
    ) {
      throw new Error('Invalid documentType')
    }

    if (data.documentType === 'account') {
      return {
        documentType: 'account',

        account: data.account
          ? {
              name: data.account.name ?? null,

              type: data.account.type ?? null,

              accountNumber: data.account.accountNumber ?? null,

              balance: typeof data.account.balance === 'number' ? data.account.balance : null,

              source: data.account.source ?? null,

              metadata: parseMetadata(data.account.metadata),
            }
          : null,

        bill: null,
      }
    }

    if (data.documentType === 'bill') {
      return {
        documentType: 'bill',
        account: null,
        bill: data.bill
          ? {
              provider: data.bill.provider ?? null,
              customerAccountNumber: data.bill.customerAccountNumber ?? null,
              accountNumber: data.bill.accountNumber ?? null,
              billNumber: data.bill.billNumber ?? null,
              type: data.bill.type ?? null,
              amountDue: typeof data.bill.amountDue === 'number' ? data.bill.amountDue : null,
              billingPeriodStart: data.bill.billingPeriodStart ?? null,
              billingPeriodEnd: data.bill.billingPeriodEnd ?? null,
              dueDate: data.bill.dueDate ?? null,
              issueDate: data.bill.issueDate ?? null,
              metadata: parseMetadata(data.bill.metadata),
            }
          : null,
      }
    }

    return {
      documentType: null,
      account: null,
      bill: null,
    }
  } catch (error) {
    console.error('Failed to parse Claude response:', error)
    console.error('Claude response:', content)

    const parseError = new Error('Claude returned an invalid response')

    ;(parseError as any).code = 'CLAUDE_INVALID_RESPONSE'

    throw parseError
  }
}

export async function analyzeFinancialImage(
  base64Image: string,
  mimeType: string,
): Promise<AICaptureResult> {
  const content = await requestClaude(base64Image, mimeType)

  return parseClaudeResponse(content)
}
