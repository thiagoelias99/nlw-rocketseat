import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"
import { subscribeToEvent } from "../functions/subscribe-to-event"
import { env } from "../env"
import { accessInviteLink } from "../functions/access-invite-link"
import { redis } from "../redis/client"
import { getSubscriberInvitesClicks } from "../functions/get-subscriber-invites-clicks"
import { getSubscriberInvitesCount } from "../functions/get-subscriber-invites-count"
import { getSubscriberRankingPosition } from "../functions/get-subscriber-ranking-position"
import { getRanking } from "../functions/get-ranking"

export const routes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/subscriptions',
    {
      schema: {
        summary: 'Subscribe to event',
        tags: ['subscriptions'],
        operationId: 'subscribeToEvent',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          referrer: z.string().nullish(),
        }),
        response: {
          201: z.object({ subscriberId: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, referrer } = request.body

      console.log({ name, email, referrer })

      const { subscriberId } = await subscribeToEvent({
        name,
        email,
        invitedBySubscriberId: referrer || null,
      })

      console.log({ subscriberId })

      return reply.status(201).send({ subscriberId })
    }
  )

  app.get(
    '/invites/:subscriberId',
    {
      schema: {
        summary: 'Access invite link',
        operationId: 'accessInviteLink',
        tags: ['referral'],
        params: z.object({
          subscriberId: z.string(),
        }),
        response: {
          301: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { subscriberId } = request.params

      await accessInviteLink({ subscriberId })

      // Visualizar o contador de acessos
      console.log(await redis.hgetall('referral:access-count'))

      const redirectUrl = new URL(env.WEB_URL)

      redirectUrl.searchParams.set('referrer', subscriberId)

      return reply.redirect(redirectUrl.toString(), 302)
    }
  )

  app.get(
    '/subscribers/:subscriberId/ranking/clicks',
    {
      schema: {
        summary: 'Get subscriber ranking invites clicks count',
        operationId: 'getSubscriberInviteClicks',
        tags: ['referral'],
        params: z.object({
          subscriberId: z.string(),
        }),
        response: {
          200: z.object({ count: z.number() }),
        },
      },
    },
    async request => {
      const { subscriberId } = request.params

      const { count } = await getSubscriberInvitesClicks({
        subscriberId,
      })

      return { count }
    }
  )

  app.get(
    '/subscribers/:subscriberId/ranking/count',
    {
      schema: {
        summary: 'Get subscriber ranking invites count',
        operationId: 'getSubscriberInviteCount',
        tags: ['referral'],
        params: z.object({
          subscriberId: z.string(),
        }),
        response: {
          200: z.object({ count: z.number() }),
        },
      },
    },
    async request => {
      const { subscriberId } = request.params

      const { count } = await getSubscriberInvitesCount({
        subscriberId,
      })

      return { count }
    }
  )

  app.get(
    '/subscribers/:subscriberId/ranking/position',
    {
      schema: {
        summary: 'Get subscriber ranking position',
        operationId: 'getSubscriberRankingPosition',
        tags: ['referral'],
        params: z.object({
          subscriberId: z.string(),
        }),
        response: {
          200: z.object({ position: z.number().nullable() }),
        },
      },
    },
    async request => {
      const { subscriberId } = request.params

      const { position } = await getSubscriberRankingPosition({
        subscriberId,
      })

      return { position }
    }
  )

  app.get(
    '/ranking',
    {
      schema: {
        summary: 'Get ranking',
        operationId: 'getRanking',
        tags: ['referral'],
        response: {
          200: z.object({
            ranking: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                score: z.number(),
              })
            ),
          }),
        },
      },
    },
    async () => {
      const { rankingWithScores } = await getRanking()

      return {
        ranking: rankingWithScores,
      }
    }
  )
}
