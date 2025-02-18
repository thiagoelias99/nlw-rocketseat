import { fastify } from "fastify"
import { fastifyCors } from "@fastify/cors"
import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod"
import z from "zod"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import { routes } from "./routes"
import { env } from "./env"


const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: "*"
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Subscription API",
      version: "1.0.0",
      description: "API to manage subscriptions",
    },
  },
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
})

// Utilizara o zod para compilar os schemas de validação e serialização
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(routes)

app.listen({ port: env.PORT })
  .then(() => {
    console.log(`Server listening on port http://localhost:${env.PORT}`)
  })
  .catch((error) => {
    console.error(error)
  })