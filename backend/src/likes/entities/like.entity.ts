import { Entity, Index, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { Accounts } from 'src/accounts/entities/account.entity';
import { BaseModel } from 'src/common/entities/BaseEntity';
import { Blog } from 'src/blogs/entities/blog.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Reply } from 'src/replies/entities/reply.entity';

@Entity('likes')
export class Like extends BaseModel {
  @ManyToOne(() => Comment, (comment) => comment.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Index()
  comment?: Comment | null;

  @ManyToOne(() => Reply, (reply) => reply.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Index()
  reply?: Reply | null;

  @ManyToOne(() => Blog, (blog) => blog.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Index()
  blog?: Blog | null;

  @ManyToOne(() => Accounts, (account) => account.likes, {
    onDelete: 'CASCADE',
  })
  @Index()
  account: Accounts;
}
