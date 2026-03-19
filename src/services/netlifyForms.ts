type NetlifyFormValues = Record<string, string>

const encode = (values: NetlifyFormValues) =>
  new URLSearchParams(values).toString()

export async function submitNetlifyForm(formName: string, values: NetlifyFormValues) {
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encode({
      'form-name': formName,
      ...values,
    }),
  })

  if (!response.ok) {
    throw new Error('Unable to submit right now. Please try again.')
  }
}
