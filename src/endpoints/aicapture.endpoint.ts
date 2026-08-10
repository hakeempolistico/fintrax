import { getCurrentUser } from '@/services/app.service'
import { Endpoint } from 'payload'

const getContent = (): string => {
  return `
Analyze the provided image.

Determine whether the image contains a financial account or a bill.

Return ONLY valid JSON. Do not use Markdown. Do not wrap the JSON in \`\`\`json or \`\`\`.

Use exactly this JSON structure:

{
  "documentType": "account" | "bill" | null,

  "account": {
    "name": string | null,
    "type": "bank" | "cash" | "credit-card" | "ewallet" | "investment" | "other" | null,
    "accountNumber": string | null,
    "balance": number,
    "source": string | null,
    "metadata": {}
  },

  "bill": {
    "provider": string | null,
    "customerAccountNumber": string | null,
    "accountNumber": string | null,
    "billNumber": string | null,
    "type": "electricity" | "water" | "internet" | "mobile" | "telephone" | "insurance" | "credit-card" | "loan" | "government" | "other" | null,
    "amountDue": number,
    "billingPeriodStart": "YYYY-MM-DD" | null,
    "billingPeriodEnd": "YYYY-MM-DD" | null,
    "dueDate": "YYYY-MM-DD" | null,
    "issueDate": "YYYY-MM-DD" | null,
    "metadata": {}
  }
}

GENERAL RULES:
- Return ONLY valid JSON.
- Do not return Markdown.
- Do not return explanations.
- Do not wrap the response in \`\`\`json.
- Only extract information that is clearly visible in the image.
- Never guess, invent, or assume information.
- Use null when a main field is not visible.
- Use 0 for balance when no balance is clearly visible.
- Do not include image data, Base64 data, image_url, or the original image in metadata.
- Preserve numbers and text as accurately as possible.
- Do not duplicate main fields inside metadata.

DOCUMENT TYPE:
- Use "account" when the image represents a bank account, bank statement, debit card, credit card, e-wallet, investment account, cash account, or similar financial account.
- Use "bill" when the image represents a utility bill, electricity bill, water bill, internet bill, mobile bill, telephone bill, insurance bill, loan statement, credit card bill, government bill, or similar payment document.
- If the document type cannot be determined from the image, use null.
- If documentType is "account", populate account and set bill to null.
- If documentType is "bill", populate bill and set account to null.

ACCOUNT RULES:
- "name" is the account holder name or account name.
- "type" identifies the account type.
- If the image clearly shows a debit account/card from a bank, use "bank".
- If the image clearly shows GCash, Maya, or another e-wallet, use "ewallet".
- "accountNumber" is the account number clearly visible in the image.
- "balance" is the current or available balance clearly shown.
- Remove currency symbols and commas from balance.
- Example: "₱25,000.50" becomes 25000.50.
- "source" is the bank, financial institution, or provider.
- Examples include BPI, BDO, Metrobank, UnionBank, GCash, Maya, etc.

ACCOUNT METADATA:
- metadata MUST contain additional information clearly visible in the image.
- Do NOT return an empty metadata object when additional information is visible.
- Store all additional visible information that does not belong in the main account fields.
- Use descriptive camelCase keys.
- Each metadata item MUST be a valid JSON key-value pair.
- Never put standalone text inside metadata.
- Preserve the original value as accurately as possible.
- Examples of useful metadata include:
  accountStatus, cardType, cardNumber, branch, accountType, availableBalance,
  currentBalance, statementDate, transactionDate, currency, customerId,
  referenceNumber, address, phoneNumber, email, and other visible information.
- Example:
  "metadata": {
    "accountStatus": "Active",
    "branch": "BPI Makati",
    "statementDate": "2026-08-01",
    "currency": "PHP",
    "customerId": "123456789"
  }

BILL RULES:
- "provider" is the company or organization issuing the bill.
- Examples include Meralco, Maynilad, Manila Water, PLDT, Globe, Converge, Smart, etc.
- "customerAccountNumber" is the Customer Account Number (CAN) or equivalent customer identifier.
- "accountNumber" is another account or reference number only when it is clearly shown and different from the customerAccountNumber.
- "billNumber" is the bill number, statement number, invoice number, or equivalent reference number.
- "type" identifies the bill category.
- "amountDue" is the total amount currently due.
- Remove currency symbols and commas from amountDue.
- Example: "₱2,567.94" becomes 2567.94.
- Use 0 only when no amount due is clearly visible.
- "billingPeriodStart" is the first date of the billing period.
- "billingPeriodEnd" is the last date of the billing period.
- "dueDate" is the payment due date.
- "issueDate" is the bill date, statement date, issue date, or equivalent date.
- All dates in the main bill fields MUST use YYYY-MM-DD.
- Do not guess dates.
- Do not invent missing parts of dates.
- If a date cannot be determined with confidence, use null.
- billingPeriodStart must be earlier than or equal to billingPeriodEnd.
- Never swap or invent dates just to make the date range valid.

BILL METADATA:
- metadata MUST contain additional information clearly visible in the bill.
- Do NOT return an empty metadata object when additional information is visible.
- Store ALL additional visible information that does not belong in the main bill fields.
- Use descriptive camelCase keys.
- Every metadata item MUST be a valid JSON key-value pair.
- Never put standalone text inside metadata.
- Preserve values as accurately as possible.
- Include additional information such as:
  meterNumber, routeSequence, printSequence, meterReadingDate,
  nextMeterReadingDate, customerType, rateThisMonth, leadFactor,
  actualConsumption, previousBalance, currentCharges, generation,
  transmission, systemLoss, distributionCharges, subsidies,
  governmentTaxes, universalCharges, serviceAddress, accountStatus,
  paymentTerms, VAT, discounts, adjustments, and other visible information.
- Example:
  "metadata": {
    "meterNumber": "A101000623",
    "routeSequence": "1110 04 0002",
    "printSequence": "111861",
    "customerType": "Business - General Power",
    "rateThisMonth": "₱7.41 per kWh",
    "leadFactor": "69.14%",
    "actualConsumption": "303,360 kWh",
    "previousBalance": "0.00",
    "accountStatus": "Active"
  }

IMPORTANT METADATA REQUIREMENT:
- Read the entire image, not just the main fields.
- Extract additional visible labels and their values into metadata.
- If the image contains 10 additional pieces of information, metadata should contain those additional pieces of information.
- Do not intentionally omit additional visible information.
- Do not summarize multiple visible fields into one metadata field when they can be represented separately.
- Every piece of additional information must be represented as a JSON key-value pair.
- If a visible statement has no explicit value, convert it to a boolean only when appropriate.
- Example:
  "Using 240 multiplier" becomes:
  "using240Multiplier": true
- Never output:
  "Using 240 multiplier",
- Instead output:
  "using240Multiplier": true

FINAL VALIDATION:
Before returning the response:
1. Make sure the response is valid JSON.
2. Make sure every property has a colon and a value.
3. Make sure there are no trailing commas.
4. Make sure strings use double quotes.
5. Make sure metadata is a JSON object.
6. Make sure metadata contains additional visible information.
7. Make sure there is no Markdown or code fence.
8. Make sure dates use YYYY-MM-DD.
9. Make sure billingPeriodStart is not later than billingPeriodEnd.
10. Return ONLY the JSON object.
`
}

// Llama local
const AI_ENDPOINT = 'http://localhost:11434/api/chat'

const AICaptureEndpoint: Endpoint = {
  path: '/aicapture',
  method: 'post',

  handler: async (req) => {
    try {
      const member = await getCurrentUser()
      if (!member) {
        return Response.json({ error: 'Unauthenticated' }, { status: 401 })
      }

      if (!req.formData) {
        return Response.json({ error: 'FormData is not supported' }, { status: 400 })
      }

      const formData = await req.formData()
      const image = formData.get('image')

      if (!(image instanceof File)) {
        return Response.json({ error: 'Image file is required' }, { status: 400 })
      }

      if (!image.type.startsWith('image/')) {
        return Response.json({ error: 'File must be an image' }, { status: 400 })
      }

      // Convert image to Base64
      const arrayBuffer = await image.arrayBuffer()
      const base64Image = Buffer.from(arrayBuffer).toString('base64')

      // Send image to local Ollama
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemma3:4b',
          stream: false,
          format: {
            type: 'object',
            properties: {
              documentType: {
                type: 'string',
                enum: ['account', 'bill', 'null'],
              },
              account: {
                type: ['object', 'null'],
                properties: {
                  name: { type: ['string', 'null'] },
                  type: { type: ['string', 'null'] },
                  accountNumber: { type: ['string', 'null'] },
                  balance: { type: 'number' },
                  source: { type: ['string', 'null'] },
                  metadata: {
                    'additional information': 'value',
                  },
                },
              },
              bill: {
                type: ['object', 'null'],
                properties: {
                  provider: { type: ['string', 'null'] },
                  customerAccountNumber: { type: ['string', 'null'] },
                  billNumber: { type: ['string', 'null'] },
                  type: { type: ['string', 'null'] },
                  amountDue: { type: 'number' },
                  billingPeriodStart: { type: ['string', 'null'] },
                  billingPeriodEnd: { type: ['string', 'null'] },
                  dueDate: { type: ['string', 'null'] },
                  issueDate: { type: ['string', 'null'] },
                  metadata: {
                    'additional information': 'value',
                  },
                },
              },
            },
          },
          messages: [
            {
              role: 'user',
              content: getContent().trim(),
              images: [base64Image],
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Ollama error:', error)
        return Response.json({ error: 'Failed to analyze image with Ollama' }, { status: 500 })
      }

      const result = await response.json()
      console.log('OLLAMA RESPONSE:', result)
      const content = result.message?.content

      if (!content) {
        return Response.json({ error: 'No response from Ollama' }, { status: 500 })
      }

      // Remove possible markdown code fences
      const cleanContent = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()

      let account = null
      let bill = null
      const data = JSON.parse(cleanContent)

      try {
        if (data?.documentType === 'account') {
          account = data?.account
          account.member = member
        } else if (data?.documentType === 'bill') {
          bill = data?.bill
          bill.member = member
        }
      } catch (error: any) {
        console.log({ error })
        console.error('Invalid JSON from Ollama:', error?.message)

        return Response.json(
          {
            error: 'Ollama returned invalid JSON',
            raw: content,
            message: error?.message,
          },
          { status: 500 },
        )
      }

      if (account) {
        account = await req.payload.create({
          collection: 'accounts',
          data: account,
        })
      }

      if (bill) {
        console.log({ bill })
      }

      return Response.json({
        success: true,
        created: account,
        // redirect: '/portal/accounts',
      })
    } catch (error: any) {
      console.error('AI capture error:', error)
      const accountNumberError = error?.data?.errors?.find(
        (item: any) => item.path === 'accountNumber',
      )

      if (accountNumberError) {
        return Response.json(
          {
            success: false,
            message: 'Account number already exists. Please use another account.',
          },
          { status: 400 },
        )
      }

      return Response.json({ error: 'Failed to process image' }, { status: 500 })
    }
  },
}

export default AICaptureEndpoint
