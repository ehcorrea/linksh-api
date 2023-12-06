/**
 * linksh service
 */

import { errors } from '@strapi/utils';
import { factories } from '@strapi/strapi';
import { v4 } from 'uuid';

import { LinkshCreateRequest, User, FindQuery, Linksh } from '@/types';

const { ApplicationError, ForbiddenError, NotFoundError } = errors;

export default factories.createCoreService('api::linksh.linksh', ({ strapi }) => ({

  async create(args: LinkshCreateRequest) {

    const { data: { title, content, timeout } } = args;

    const actualDateISOString = new Date().toISOString();
    const timeoutDateISOString = new Date(timeout).toISOString();

    if (actualDateISOString >= timeoutDateISOString) {
      throw new ApplicationError('The timeout date must be greater than the current date', { field: 'timeout' });
    }

    const { id: userId, username } = strapi.requestContext.get().state.user as User;

    const linkshId = `${username}-${v4()}`;
    const newLinksh = {
      title,
      content,
      timeout: new Date(timeout),
      linkshId,
      owner: userId,
      ownedBy: username
    };

    return super.create({ data: newLinksh });
  },

  async find(query: FindQuery) {

    return super.find({
      fields: ["title", "ownedBy", "id"],
      filters:
      {
        $and: [
          {
            title: { $contains: query.title || "" },
            ownedBy: { $contains: query.ownedBy || "" },
            isDeleted: false,
          },
        ],
      },
    });
  },

  async delete(id: string) {
    const { username } = strapi.requestContext.get().state.user as User;
    const linksh = await super.findOne(id) as Linksh;

    if (!linksh || linksh.ownedBy !== username || linksh.isDeleted) {
      throw new NotFoundError("Content not found");
    }

    await super.update(id, { data: { ...linksh, isDeleted: true } });

    return strapi.requestContext.get().send({ message: "Content deleted successfully" }, 200)
  },


  async findOne(id: string) {
    const user = strapi.requestContext.get().state.user as User;
    const linksh = await super.findOne(id) as Linksh;

    if (linksh.isDeleted) {
      throw new NotFoundError("Content not found");
    }

    if (linksh.ownedBy === user?.username) {
      return strapi.requestContext.get().send({
        data:
        {
          title: linksh.title,
          content: linksh.content,
          timeout: linksh.timeout,
          linkshId: linksh.linkshId,
          ownedBy: linksh.ownedBy,
        }
      }, 200);
    }

    const actualDateISOString = new Date().toISOString();
    const timeoutDateISOString = new Date(linksh.timeout).toISOString();

    if (actualDateISOString >= timeoutDateISOString) {
      return strapi.requestContext.get().send({
        data: {
          title: linksh.title,
          timeout: linksh.timeout,
          content: linksh.content,
          linkshId: linksh.linkshId,
          ownedBy: linksh.ownedBy,
        }
      }, 200)
    }

    return strapi.requestContext.get().send({
      data: {
        title: linksh.title,
        timeout: linksh.timeout,
        content: "Content not available yet",
        linkshId: linksh.linkshId,
        ownedBy: linksh.ownedBy,
      }
    }, 200)

  },
}));
