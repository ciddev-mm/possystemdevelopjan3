import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { encrypt, decrypt, type SessionPayload } from './session'


export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      roleId: true,
      roleRelation: {
        select: {
          id: true,
          name: true,
          permissions: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const session = await encrypt({
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    roleId: user.roleId,
    rolePermissions: user.roleRelation ? JSON.parse(user.roleRelation.permissions) : null,
    expiresAt,
  })

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  // Update last login
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
    },
  })

  return session
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) {
    return null
  }

  const session = await decrypt(sessionCookie)

  if (!session) {
    // Return null - cookie will be cleared by middleware or on next request
    return null
  }

  // Check if session is expired
  if (new Date() > new Date(session.expiresAt)) {
    // Return null - cookie will be cleared by middleware or on next request
    return null
  }

  return session
}

export async function clearInvalidSession() {
  // This can be called from Server Actions or Route Handlers
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

