import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'
import Application from '@ioc:Adonis/Core/Application'
import { v4 as uuiddv4 } from 'uuid'

export default class MomentsController {
  private validationOptions = {
    types: ['image'],
    syze: '2mb',
  }

  public async store({ request, response }: HttpContextContract) {
    const body = request.body()

    const image = request.file('image', this.validationOptions)
    if (image) {
      const imageName = `${uuiddv4()}.${image.extname}`

      await image.move(Application.tmpPath('uploads'), {
        name: imageName,
      })

      body.image = imageName
    }

    const moment = await Moment.create(body)

    return response.status(200).send({ message: 'Momento foi criado com sucesso!', data: moment })
  }

  public async index({ response }: HttpContextContract) {
    const moments = await Moment.query().preload('comments')

    return response.status(200).send({ data: moments })
  }

  public async show({ params, response }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)

    await moment.load('comments')

    response.status(200).send({ data: moment })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)

    await moment.delete()

    response.status(200).send({ message: 'Momento excluído com sucesso!', data: moment })
  }

  public async update({ params, response, request }: HttpContextContract) {
    const body = request.body()
    const moment = await Moment.findOrFail(params.id)

    moment.title = body.title
    moment.description = body.description

    if (moment.image !== body.image || !moment.image) {
      const image = request.file('image', this.validationOptions)

      if (image) {
        const imageName = `${uuiddv4()}.${image.extname}`

        await image.move(Application.tmpPath('uploads'), {
          name: imageName,
        })

        moment.image = imageName
      }
    }

    await moment.save()

    return response.status(200).send({ message: 'Momento atualizado com sucesso!', data: moment })
  }
}
