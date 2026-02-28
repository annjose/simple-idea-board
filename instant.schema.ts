import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $users: i.entity({ email: i.string().unique().indexed() }),
    profiles: i.entity({ displayName: i.string() }),
    ideas: i.entity({
      userId: i.string().indexed(),
      displayName: i.string(),
      content: i.string(),
      createdAt: i.number().indexed(),
      x: i.number(),
      y: i.number(),
    }),
    reactions: i.entity({
      ideaId: i.string().indexed(),
      userId: i.string().indexed(),
      emoji: i.string(),
    }),
  },
  links: {
    profileUser: {
      forward: { on: 'profiles', has: 'one', label: '$user' },
      reverse: { on: '$users', has: 'one', label: 'profile' },
    },
  },
});

export type AppSchema = typeof _schema;
export default _schema;
