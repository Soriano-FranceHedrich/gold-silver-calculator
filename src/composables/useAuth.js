import { ref, computed } from 'vue'

// Simple in-memory storage for users (in production, this would be a backend API)
const users = ref(JSON.parse(localStorage.getItem('users') || '[]'))
const currentUser = ref(JSON.parse(localStorage.getItem('currentUser') || 'null'))

// Save users to localStorage whenever it changes
const saveUsers = () => {
  localStorage.setItem('users', JSON.stringify(users.value))
}

// Save current user to localStorage
const saveCurrentUser = () => {
  if (currentUser.value) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
  } else {
    localStorage.removeItem('currentUser')
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)

  const register = (email, password, name) => {
    // Validation
    if (!email || !password || !name) {
      return { success: false, message: 'All fields are required' }
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' }
    }

    // Check if user already exists
    const existingUser = users.value.find(u => u.email === email)
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' }
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, this should be hashed
      name
    }

    users.value.push(newUser)
    saveUsers()

    return { success: true, message: 'Registration successful' }
  }

  const login = (email, password) => {
    // Validation
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' }
    }

    // Find user
    const user = users.value.find(u => u.email === email && u.password === password)
    if (!user) {
      return { success: false, message: 'Invalid email or password' }
    }

    // Set current user (without password)
    const { password: _, ...userWithoutPassword } = user
    currentUser.value = userWithoutPassword
    saveCurrentUser()

    return { success: true, message: 'Login successful' }
  }

  const logout = () => {
    currentUser.value = null
    saveCurrentUser()
  }

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    register,
    login,
    logout
  }
}
