import { redis } from '../redis/client'

interface AccessInviteLinkParams {
  subscriberId: string
}

// This function is responsible for incrementing the access count of a given subscriberId
export async function accessInviteLink({
  subscriberId,
}: AccessInviteLinkParams) {
  await redis.hincrby('referral:access-count', subscriberId, 1)
}