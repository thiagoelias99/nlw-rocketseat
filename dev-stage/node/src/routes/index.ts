import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"

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
          name: z.string(),
          email: z.string(),
        }),
      }
    }
  }, async (request, reply) => {
    const { name, email } = request.body
    return reply.status(201).send({ name, email })
  })
}
