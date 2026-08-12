import { Endpoint } from 'payload'

import { captureAIImage } from '@/services/scanner.service'

const AICaptureEndpoint: Endpoint = {
  path: '/aicapture',
  method: 'post',

  handler: async (req) => {
    try {
      if (!req.formData) {
        return Response.json(
          {
            success: false,
            error: 'FormData is not supported',
          },
          { status: 400 },
        )
      }

      const formData = await req.formData()
      const image = formData.get('image')

      if (!(image instanceof File)) {
        return Response.json(
          {
            success: false,
            error: 'Image file is required',
          },
          { status: 400 },
        )
      }

      if (!image.type.startsWith('image/')) {
        return Response.json(
          {
            success: false,
            error: 'File must be an image',
          },
          { status: 400 },
        )
      }

      const result = await captureAIImage(req, image)

      return Response.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      console.error('AI capture error:', error)

      if (error?.message === 'Unauthenticated') {
        return Response.json(
          {
            success: false,
            error: 'Unauthenticated',
          },
          { status: 401 },
        )
      }

      if (error?.code === 'ACCOUNT_NUMBER_EXISTS') {
        return Response.json(
          {
            success: false,
            error: 'Account number already exists',
            message: 'Account number already exists. Please use another account.',
          },
          { status: 400 },
        )
      }

      if (error?.code === 'CLAUDE_API_ERROR') {
        return Response.json(
          {
            success: false,
            error: 'Failed to analyze image with Claude',
          },
          { status: 502 },
        )
      }

      if (error?.code === 'CLAUDE_INVALID_RESPONSE') {
        return Response.json(
          {
            success: false,
            error: 'Claude returned an invalid response',
          },
          { status: 502 },
        )
      }

      return Response.json(
        {
          success: false,
          error: 'Failed to process image',
        },
        { status: 500 },
      )
    }
  },
}

export default AICaptureEndpoint
