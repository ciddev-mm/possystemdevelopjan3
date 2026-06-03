import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.AUTH_SECRET || 'your-secret-key-change-in-production'
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  userId: string
  username: string
  fullName: string
  role: string
  roleId?: string | null
  rolePermissions?: any | null
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // 30 days
    .sign(encodedKey)
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error: any) {
    // Silently handle invalid/expired sessions - this is expected behavior
    // Only log unexpected errors
    if (error?.code !== 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' && 
        error?.code !== 'ERR_JWT_EXPIRED' &&
        error?.code !== 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
      console.error('Unexpected session error:', error)
    }
    return null
  }
}
