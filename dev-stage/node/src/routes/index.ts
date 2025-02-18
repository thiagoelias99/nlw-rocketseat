import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"
import { subscribeToEvent } from "../functions/subscribe-to-event"
import { env } from "../env"
import { accessInviteLink } from "../functions/access-invite-link"
import { redis } from "../redis/client"

export const routes: FastifyPluginAsyncZod = async (app) => {
  app.post("/subscriptions", {
    schema: {
      summary: "Create a new subscription",
      tags: ["subscriptions"],
      body: z.object({
        name: z.string().min(3).max(255),
        email: z.string().email(),
      }),
      response: {
        201: z.object({
          subscriberId: z.string(),
        }),
      }
    }
  }, async (request, reply) => {
    const { name, email } = request.body

    const { subscriberId } = await subscribeToEvent({ name, email, invitedBySubscriberId: null })


    return reply.status(201).send({ subscriberId })
  })

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
}
