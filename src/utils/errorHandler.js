import toast from 'react-hot-toast'

export const handleError = (error, defaultMsg) => {
  const message = error.response?.data?.message
    || defaultMsg
    || 'Something went wrong'
  toast.error(message)
}
