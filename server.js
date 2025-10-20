import express from 'express'
import cors from "cors"
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const server = express()
server.use(cors())
server.use(express.json())


server.get("/", (request, response) => {
  response.json({ status: true, message: "API de Sites funcionando correctamente" })
})

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/sites-db")
    console.log("Conectado a MongoDB con éxito")
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error)
  }
}


const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  siteUrl: { type: String, required: true },
  socialnetwork: { type: String, required: true }
}, {
  versionKey: false,
  timestamps: true
})

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, {
  versionKey: false
})


const Site = mongoose.model("Site", siteSchema)
const User = mongoose.model("User", userSchema)

const authMiddleware = (request, response, next) => {
  const token = request.headers.authorization

  if (!token) {
    return response.status(401).json({ status: "Se necesita el permiso" })
  }

  try {
    const decoded = jwt.verify(token, "CLAVE_SECRETA")
    request.user = decoded
    next()
  } catch (error) {
    return response.status(401).json({ status: "Token inválido" })
  }
}

server.post("/auth/register", async (request, response) => {
  try {
    const body = request.body

    const user = await User.findOne({ email: body.email })

    if (user) {
      return response.status(400).json({ message: "El usuario ya existe en nuestras base de datos" })
    }

    const hash = await bcrypt.hash(body.password, 10)

    const newUser = new User({
      email: body.email,
      password: hash
    })

    await newUser.save()

    response.json({ message: "Usuario creado exitosamente", user: { email: newUser.email } })
  } catch (error) {
    response.status(500).json({ error: "Error interno del servidor" })
  }
})


server.post("/auth/login", async (request, response) => {
  try {
    const body = request.body

    const user = await User.findOne({ email: body.email })

    if (!user) {
      return response.status(401).json({ status: "Usuario no encontrado, credenciales invalidas" })
    }

    const passwordValidada = await bcrypt.compare(body.password, user.password)
    if (!passwordValidada) {
      return response.status(401).json({ status: "Usuario no encontrado, credenciales invalidas" })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, "CLAVE_SECRETA", { expiresIn: "1h" })

    response.json({ token, message: "Login exitoso" })
  } catch (error) {
    response.status(500).json({ error: "Error interno del servidor" })
  }
})


server.get("/sites", async (request, response) => {
  try {
    const sites = await Site.find()
    response.json(sites)
  } catch (error) {
    response.status(500).json({ error: "Error al obtener los sites" })
  }
})

server.get("/sites/:id", authMiddleware, async (request, response) => {
  try {
    const id = request.params.id
    const site = await Site.findById(id)

    if (!site) {
      return response.status(404).json({ error: "Site no encontrado" })
    }

    response.json(site)
  } catch (error) {
    response.status(500).json({ error: "Error al obtener el site" })
  }
})

server.post("/create-sites", authMiddleware, async (request, response) => {
  try {
    const body = request.body

    const { name, description, siteUrl, socialnetwork } = body

    if (!name || !description || !siteUrl || !socialnetwork) {
      return response.status(400).json({ status: "Data invalida, todos los campos son requeridos" })
    }

    const newSite = new Site({
      name,
      description,
      siteUrl,
      socialnetwork
    })

    await newSite.save()
    response.json({ message: "Site creado exitosamente", site: newSite })
  } catch (error) {
    response.status(500).json({ error: "Error al crear el site" })
  }
})

server.patch("/update-sites/:id", authMiddleware, async (request, response) => {
  try {
    const body = request.body
    const id = request.params.id

    const updatedSite = await Site.findByIdAndUpdate(id, body, { new: true })

    if (!updatedSite) {
      return response.status(404).json({ error: "Site no encontrado" })
    }

    response.json({ message: "Site actualizado exitosamente", site: updatedSite })
  } catch (error) {
    response.status(500).json({ error: "Error al actualizar el site" })
  }
})

server.delete("/delete-sites/:id", authMiddleware, async (request, response) => {
  try {
    const id = request.params.id

    const deletedSite = await Site.findByIdAndDelete(id)

    if (!deletedSite) {
      return response.status(404).json({ error: "No se encuentra el site para borrar" })
    }

    response.json({ message: "Site eliminado exitosamente", site: deletedSite })
  } catch (error) {
    response.status(500).json({ error: "Error al eliminar el sitio" })
  }
})

server.listen(1111, () => {
  connectDb()
  console.log(`Server conectado en http://localhost:1111`)
  console.log(`Base de datos: sites-db`)
  console.log(`MongoDB Compass: mongodb://localhost:27017/sites-db`)
})
