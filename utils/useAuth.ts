import { ref } from 'vue'
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth'

const isAuthenticated = ref(false)
const userEmail = ref('')
const userID = ref('')
const token = ref('')

export const useAuth = async () => {
  try {
    const session = await fetchAuthSession()

    const idToken = session.tokens?.idToken?.toString()
    if (idToken) {
      isAuthenticated.value = true
      token.value = idToken

      const attributes = await fetchUserAttributes()
      userEmail.value = attributes.email || ''
      userID.value = attributes.sub || ''
    } else {
      isAuthenticated.value = false
    }
  } catch (error) {
    isAuthenticated.value = false
    console.error('Auth error:', error)
  }

  return {
    isAuthenticated,
    userEmail,
    userID,
    token
  }
}
