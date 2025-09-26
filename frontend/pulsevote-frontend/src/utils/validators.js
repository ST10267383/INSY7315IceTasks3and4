// Basic client-side validation helpers

// RFC-lite email check
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

// ≥8 chars AND contains at least one letter and one number (symbols allowed)
export const isStrongPassword = (password) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
    .test(String(password || ''));