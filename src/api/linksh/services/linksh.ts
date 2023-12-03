/**
 * linksh service
 */

import { errors } from '@strapi/utils';
import { factories } from '@strapi/strapi';
import { v4 } from 'uuid';

import { LinkshCreateRequest } from '../../../../types/linksh';
import { User } from '../../../../types/user';

const { ApplicationError } = errors;

export default factories.createCoreService('api::linksh.linksh', () => ({

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


    return await super.create({ data: newLinksh });

  }
}));
