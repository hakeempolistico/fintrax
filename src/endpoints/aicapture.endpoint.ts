import { Endpoint } from 'payload'

const AICaptureEndpoint: Endpoint = {
  path: '/aicapture',
  method: 'post',
  handler: async (req) => {
    if (!req.formData) {
      return Response.json(
        { error: 'FormData is not supported' },

        { status: 400 },
      )
    }
    const formData = await req.formData()
    const image = formData.get('image')

    console.log('IMAGE:', image)

    return Response.json({
      success: true,
    })
  },
}

export default AICaptureEndpoint
